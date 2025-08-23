const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get all libraries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      sucursalId: req.user.sucursalId
    };

    // Users can only see libraries they're members of, unless they're admin/supervisor
    if (!['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      where.members = {
        some: {
          userId: req.user.id
        }
      };
    }

    const libraries = await prisma.library.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.library.count({ where });

    res.json({
      libraries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get libraries failed', error);
    res.status(500).json({ error: 'Failed to get libraries' });
  }
});

// Get library by ID
router.get('/:libraryId', authenticateToken, async (req, res) => {
  try {
    const { libraryId } = req.params;
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isMember = library.members.some(member => member.userId === req.user.id);
    const canAccess = isMember || library.userId === req.user.id || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ library });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get library failed', error);
    res.status(500).json({ error: 'Failed to get library' });
  }
});

// Create library
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Library name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('userIds').optional().isArray().withMessage('User IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, userIds = [] } = req.body;

    const existingLibrary = await prisma.library.findFirst({
      where: {
        name,
        userId: req.user.id,
        sucursalId: req.user.sucursalId
      }
    });

    if (existingLibrary) {
      return res.status(400).json({ error: 'Library with this name already exists' });
    }

    const library = await prisma.library.create({
      data: {
        name,
        description,
        userId: req.user.id,
        sucursalId: req.user.sucursalId,
        members: {
          create: userIds.map(userId => ({
            userId
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    for (const userId of userIds) {
      await createNotification(
        userId,
        'SYSTEM_UPDATE',
        'Adicionado à Biblioteca',
        `Você foi adicionado à biblioteca: "${name}"`
      );
    }

    res.status(201).json({
      message: 'Library created successfully',
      library
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create library failed', error);
    res.status(500).json({ error: 'Failed to create library' });
  }
});

// Update library
router.put('/:libraryId', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Library name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { libraryId } = req.params;
    const { name, description } = req.body;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (library.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (name) {
      const existingLibrary = await prisma.library.findFirst({
        where: {
          name,
          userId: req.user.id,
          sucursalId: req.user.sucursalId,
          id: { not: libraryId }
        }
      });

      if (existingLibrary) {
        return res.status(400).json({ error: 'Library with this name already exists' });
      }
      updateData.name = name;
    }
    if (description !== undefined) updateData.description = description;

    const updatedLibrary = await prisma.library.update({
      where: { id: libraryId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Library updated successfully',
      library: updatedLibrary
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update library failed', error);
    res.status(500).json({ error: 'Failed to update library' });
  }
});

// Delete library
router.delete('/:libraryId', authenticateToken, async (req, res) => {
  try {
    const { libraryId } = req.params;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (library.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.library.delete({
      where: { id: libraryId }
    });

    res.json({ message: 'Library deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete library failed', error);
    res.status(500).json({ error: 'Failed to delete library' });
  }
});

// Add member to library
router.post('/:libraryId/members', authenticateToken, [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { libraryId } = req.params;
    const { userId } = req.body;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (library.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existingMember = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this library' });
    }

    const member = await prisma.libraryMember.create({
      data: {
        libraryId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    await createNotification(
      userId,
      'SYSTEM_UPDATE',
      'Adicionado à Biblioteca',
      `Você foi adicionado à biblioteca: "${library.name}"`
    );

    res.status(201).json({
      message: 'Member added successfully',
      member
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Add library member failed', error);
    res.status(500).json({ error: 'Failed to add library member' });
  }
});

// Remove member from library
router.delete('/:libraryId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { libraryId, userId } = req.params;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (library.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await prisma.libraryMember.delete({
      where: { id: member.id }
    });

    await createNotification(
      userId,
      'SYSTEM_UPDATE',
      'Removido da Biblioteca',
      `Você foi removido da biblioteca: "${library.name}"`
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Remove library member failed', error);
    res.status(500).json({ error: 'Failed to remove library member' });
  }
});

module.exports = router; 