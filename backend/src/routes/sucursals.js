const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');
const currentSucursal = require('../lib/currentSucursal');

const router = express.Router();

// Get all sucursals
router.get('/', authenticateToken, requireRole(['DEVELOPER', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const sucursals = await prisma.sucursal.findMany({
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            libraries: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ sucursals });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get sucursals failed', error);
    res.status(500).json({ error: 'Failed to get sucursals' });
  }
});

// Get sucursal by ID
router.get('/:sucursalId', authenticateToken, requireRole(['DEVELOPER', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const sucursal = await prisma.sucursal.findUnique({
      where: { id: sucursalId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        libraries: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            users: true,
            departments: true,
            libraries: true,
            goals: true,
            reports: true
          }
        }
      }
    });

    if (!sucursal) {
      return res.status(404).json({ error: 'Sucursal not found' });
    }

    res.json({ sucursal });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get sucursal failed', error);
    res.status(500).json({ error: 'Failed to get sucursal' });
  }
});

// Create sucursal (Developer only)
router.post('/', authenticateToken, requireRole(['DEVELOPER','SUPER_ADMIN']), [
  body('name').notEmpty().withMessage('Sucursal name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('location').optional().isString().withMessage('Location must be a string'),
  // body('serverUrl').isURL().withMessage('Valid server URL is required'),
  body('connectedSucursalIds').optional().isArray().withMessage('Connected sucursal IDs must be an array')
], async (req, res) => {
  try {
    console.log('Create sucursal request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, location, serverUrl, connectedSucursalIds = [] } = req.body;

    const existingSucursal = await prisma.sucursal.findFirst({
      where: {
        OR: [
          { name },
          { serverUrl }
        ]
      }
    });

    if (existingSucursal) {
      return res.status(400).json({ error: 'Sucursal with this name or server URL already exists' });
    }

    console.log('Creating sucursal with data:', { name, description, location, serverUrl, connectedSucursalIds });
    
         const sucursal = await prisma.sucursal.create({
       data: {
         name,
         description,
         location,
         serverUrl,
         sourceConnections: {
           create: connectedSucursalIds.map(connectedId => ({
             targetSucursalId: connectedId
           }))
         }
       },
       include: {
         sourceConnections: {
           include: {
             targetSucursal: true
           }
         }
       }
     });
    
    console.log('Sucursal created successfully:', sucursal.id);

    // Notify other sucursals about the new sucursal
    if (connectedSucursalIds.length > 0) {
      await notifyOtherSucursals(sucursal, connectedSucursalIds);
    }

    res.status(201).json({
      message: 'Sucursal created successfully',
      sucursal
    });
  } catch (error) {
    console.error('Create sucursal error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Sucursal with this name or server URL already exists',
        details: 'Unique constraint violation'
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Invalid foreign key reference',
        details: error.message
      });
    }
    
    await logError('DATABASE_ERROR', 'Create sucursal failed', error);
    res.status(500).json({ 
      error: 'Failed to create sucursal',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to notify other sucursals
async function notifyOtherSucursals(newSucursal, connectedSucursalIds) {
  for (const sucursalId of connectedSucursalIds) {
    try {
      const targetSucursal = await prisma.sucursal.findUnique({
        where: { id: sucursalId }
      });

      if (targetSucursal && targetSucursal.serverUrl) {
        try {
          // Notify the target sucursal about the new sucursal
          await axios.post(`${targetSucursal.serverUrl}/api/sucursals/notify-new`, {
            sucursalId: newSucursal.id,
            name: newSucursal.name,
            description: newSucursal.description,
            location: newSucursal.location,
            serverUrl: newSucursal.serverUrl
          }, {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log(`Successfully notified sucursal ${targetSucursal.name} about new sucursal ${newSucursal.name}`);
        } catch (error) {
          console.error(`Failed to notify sucursal ${targetSucursal.name}:`, error.message);
          await logError('NETWORK_ERROR', `Failed to notify sucursal ${targetSucursal.name} about new sucursal`, error);
        }
      }
    } catch (error) {
      console.error(`Error processing sucursal ${sucursalId}:`, error);
    }
  }
}

// Endpoint to receive notifications about new sucursals
router.post('/notify-new', async (req, res) => {
  try {
    const { sucursalId, name, description, location, serverUrl } = req.body;

    if (!sucursalId || !name || !serverUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if sucursal already exists
    const existingSucursal = await prisma.sucursal.findUnique({
      where: { id: sucursalId }
    });

    if (existingSucursal) {
      // Update existing sucursal
      await prisma.sucursal.update({
        where: { id: sucursalId },
        data: {
          name,
          description,
          location,
          serverUrl,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new sucursal
      await prisma.sucursal.create({
        data: {
          id: sucursalId,
          name,
          description,
          location,
          serverUrl
        }
      });
    }

    res.json({ message: 'Sucursal notification processed successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Process sucursal notification failed', error);
    res.status(500).json({ error: 'Failed to process sucursal notification' });
  }
});

// Update sucursal
router.put('/:sucursalId', authenticateToken, requireRole(['DEVELOPER','SUPER_ADMIN']), [
  body('name').optional().notEmpty().withMessage('Sucursal name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('location').optional().isString().withMessage('Location must be a string'),
  // body('serverUrl').optional().isURL().withMessage('Valid server URL is required')
], async (req, res) => {
  try {
    console.log('Update sucursal request:', { sucursalId: req.params.sucursalId, body: req.body });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Update validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { sucursalId } = req.params;
    const { name, description, location, serverUrl } = req.body;

    const existingSucursal = await prisma.sucursal.findUnique({
      where: { id: sucursalId }
    });

        if (!existingSucursal) {
      return res.status(404).json({ error: 'Sucursal not found' });
    }

    // Check if name or serverUrl already exists (excluding current sucursal)
    if (name || serverUrl) {
      const duplicateCheck = await prisma.sucursal.findFirst({
        where: {
          OR: [
            ...(name ? [{ name }] : []),
            ...(serverUrl ? [{ serverUrl }] : [])
          ],
          NOT: { id: sucursalId }
        }
      });

      if (duplicateCheck) {
        const conflicts = [];
        if (duplicateCheck.name === name) conflicts.push('name');
        if (duplicateCheck.serverUrl === serverUrl) conflicts.push('serverUrl');
        return res.status(400).json({ 
          error: `Sucursal with this ${conflicts.join(' and ')} already exists` 
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (serverUrl !== undefined) updateData.serverUrl = serverUrl;

    console.log('Updating sucursal with data:', updateData);

    const updatedSucursal = await prisma.sucursal.update({
      where: { id: sucursalId },
      data: updateData
    });
    
    console.log('Sucursal updated successfully:', updatedSucursal.id);

    res.json({
      message: 'Sucursal updated successfully',
      sucursal: updatedSucursal
    });
  } catch (error) {
    console.error('Update sucursal error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Sucursal with this name or server URL already exists',
        details: 'Unique constraint violation'
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Invalid foreign key reference',
        details: error.message
      });
    }
    
    await logError('DATABASE_ERROR', 'Update sucursal failed', error);
    res.status(500).json({ 
      error: 'Failed to update sucursal',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete sucursal
router.delete('/:sucursalId', authenticateToken, requireRole(['DEVELOPER','SUPER_ADMIN']), async (req, res) => {
  try {
    const { sucursalId } = req.params;

    const sucursal = await prisma.sucursal.findUnique({
      where: { id: sucursalId }
    });

    if (!sucursal) {
      return res.status(404).json({ error: 'Sucursal not found' });
    }

    await prisma.sucursal.delete({
      where: { id: sucursalId }
    });

    res.json({ message: 'Sucursal deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete sucursal failed', error);
    res.status(500).json({ error: 'Failed to delete sucursal' });
  }
});

// Get connected sucursals
router.get('/:sucursalId/connections', authenticateToken, requireRole(['DEVELOPER']), async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const connections = await prisma.sucursalConnection.findMany({
      where: {
        OR: [
          { sourceSucursalId: sucursalId },
          { targetSucursalId: sucursalId }
        ]
      },
      include: {
        sourceSucursal: true,
        targetSucursal: true
      }
    });

    res.json({ connections });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get sucursal connections failed', error);
    res.status(500).json({ error: 'Failed to get sucursal connections' });
  }
});

// Connect sucursals
router.post('/:sucursalId/connect', authenticateToken, requireRole(['DEVELOPER']), [
  body('targetSucursalId').notEmpty().withMessage('Target sucursal ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sucursalId } = req.params;
    const { targetSucursalId } = req.body;

    if (sucursalId === targetSucursalId) {
      return res.status(400).json({ error: 'Cannot connect sucursal to itself' });
    }

    const existingConnection = await prisma.sucursalConnection.findFirst({
      where: {
        OR: [
          {
            sourceSucursalId: sucursalId,
            targetSucursalId: targetSucursalId
          },
          {
            sourceSucursalId: targetSucursalId,
            targetSucursalId: sucursalId
          }
        ]
      }
    });

    if (existingConnection) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    const connection = await prisma.sucursalConnection.create({
      data: {
        sourceSucursalId: sucursalId,
        targetSucursalId: targetSucursalId
      },
      include: {
        sourceSucursal: true,
        targetSucursal: true
      }
    });

    res.status(201).json({
      message: 'Sucursals connected successfully',
      connection
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Connect sucursals failed', error);
    res.status(500).json({ error: 'Failed to connect sucursals' });
  }
});

// Disconnect sucursals
router.delete('/:sucursalId/disconnect/:targetSucursalId', authenticateToken, requireRole(['DEVELOPER']), async (req, res) => {
  try {
    const { sucursalId, targetSucursalId } = req.params;

    const connection = await prisma.sucursalConnection.findFirst({
      where: {
        OR: [
          {
            sourceSucursalId: sucursalId,
            targetSucursalId: targetSucursalId
          },
          {
            sourceSucursalId: targetSucursalId,
            targetSucursalId: sucursalId
          }
        ]
      }
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await prisma.sucursalConnection.delete({
      where: { id: connection.id }
    });

    res.json({ message: 'Sucursals disconnected successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Disconnect sucursals failed', error);
    res.status(500).json({ error: 'Failed to disconnect sucursals' });
  }
});

// Get current sucursal info
router.get('/current/info', authenticateToken, async (req, res) => {
  try {
    const sucursalInfo = await currentSucursal.getInfo();
    res.json({ sucursal: sucursalInfo });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get current sucursal info failed', error);
    res.status(500).json({ error: 'Failed to get current sucursal info' });
  }
});

module.exports = router; 