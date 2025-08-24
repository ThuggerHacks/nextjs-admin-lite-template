const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get all folders for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { parentId } = req.query;
    const where = {
      userId: req.user.id,
      sucursalId: req.user.sucursalId
    };

    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null;
    }

    const folders = await prisma.folder.findMany({
      where,
      include: {
        children: {
          include: {
            _count: {
              select: {
                children: true,
                files: true
              }
            }
          }
        },
        files: {
          select: {
            id: true,
            name: true,
            size: true,
            type: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            children: true,
            files: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ folders });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get folders failed', error);
    res.status(500).json({ error: 'Failed to get folders' });
  }
});

// Get folder by ID
router.get('/:folderId', authenticateToken, async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: {
                children: true,
                files: true
              }
            }
          }
        },
        files: {
          select: {
            id: true,
            name: true,
            description: true,
            size: true,
            type: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true
          }
        },
        _count: {
          select: {
            children: true,
            files: true
          }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ folder });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get folder failed', error);
    res.status(500).json({ error: 'Failed to get folder' });
  }
});

// Create folder
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Folder name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('parentId').optional().isString().withMessage('Parent ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, parentId } = req.body;

    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId }
      });

      if (!parentFolder) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }

      if (parentFolder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied to parent folder' });
      }
    }

    const existingFolder = await prisma.folder.findFirst({
      where: {
        name,
        userId: req.user.id,
        parentId: parentId || null
      }
    });

    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists in this location' });
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        parentId,
        userId: req.user.id,
        sucursalId: req.user.sucursalId
      },
      include: {
        parent: true,
        children: true
      }
    });

    res.status(201).json({
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create folder failed', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update folder
router.put('/:folderId', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Folder name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('parentId').optional().isString().withMessage('Parent ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { folderId } = req.params;
    const { name, description, parentId } = req.body;

    const folder = await prisma.folder.findUnique({
      where: { id: folderId }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId }
      });

      if (!parentFolder) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }

      if (parentFolder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied to parent folder' });
      }
    }

    const updateData = {};
    if (name) {
      const existingFolder = await prisma.folder.findFirst({
        where: {
          name,
          userId: req.user.id,
          parentId: parentId || folder.parentId,
          id: { not: folderId }
        }
      });

      if (existingFolder) {
        return res.status(400).json({ error: 'Folder with this name already exists in this location' });
      }
      updateData.name = name;
    }
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId;

    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: updateData,
      include: {
        parent: true,
        children: true
      }
    });

    res.json({
      message: 'Folder updated successfully',
      folder: updatedFolder
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update folder failed', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Rename folder
router.patch('/:folderId/rename', authenticateToken, [
  body('name').notEmpty().withMessage('New name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { folderId } = req.params;
    const { name } = req.body;

    const folder = await prisma.folder.findUnique({
      where: { id: folderId }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if folder with new name already exists in same location
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name,
        userId: req.user.id,
        parentId: folder.parentId,
        id: { not: folderId }
      }
    });

    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists in this location' });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: { name },
      include: {
        parent: true,
        children: true
      }
    });

    res.json({
      message: 'Folder renamed successfully',
      folder: updatedFolder
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Rename folder failed', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
});

// Move folder
router.patch('/:folderId/move', authenticateToken, [
  body('parentId').optional().isString().withMessage('Parent ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { folderId } = req.params;
    const { parentId } = req.body;

    const folder = await prisma.folder.findUnique({
      where: { id: folderId }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prevent moving folder into itself or its children
    if (parentId === folderId) {
      return res.status(400).json({ error: 'Cannot move folder into itself' });
    }

    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId }
      });

      if (!parentFolder) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }

      if (parentFolder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied to parent folder' });
      }

      // Check if moving into a child folder (would create circular reference)
      let currentParentId = parentFolder.parentId;
      while (currentParentId) {
        if (currentParentId === folderId) {
          return res.status(400).json({ error: 'Cannot move folder into its own child' });
        }
        const parent = await prisma.folder.findUnique({
          where: { id: currentParentId },
          select: { parentId: true }
        });
        currentParentId = parent?.parentId;
      }
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: { parentId },
      include: {
        parent: true,
        children: true
      }
    });

    res.json({
      message: 'Folder moved successfully',
      folder: updatedFolder
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Move folder failed', error);
    res.status(500).json({ error: 'Failed to move folder' });
  }
});

// Delete folder
router.delete('/:folderId', authenticateToken, async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        children: true,
        files: true
      }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (folder.children.length > 0 || folder.files.length > 0) {
      return res.status(400).json({ error: 'Cannot delete folder with contents' });
    }

    await prisma.folder.delete({
      where: { id: folderId }
    });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete folder failed', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Get folder tree
router.get('/tree/:folderId?', authenticateToken, async (req, res) => {
  try {
    const { folderId } = req.params;
    
    const buildTree = async (parentId = null) => {
      const folders = await prisma.folder.findMany({
        where: {
          userId: req.user.id,
          parentId,
          sucursalId: req.user.sucursalId
        },
        include: {
          _count: {
            select: {
              children: true,
              files: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      const tree = [];
      for (const folder of folders) {
        const children = await buildTree(folder.id);
        tree.push({
          ...folder,
          children
        });
      }

      return tree;
    };

    const tree = await buildTree(folderId || null);
    res.json({ tree });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get folder tree failed', error);
    res.status(500).json({ error: 'Failed to get folder tree' });
  }
});

// Get all folders for documents view (public, department, and user folders)
router.get('/documents/all', authenticateToken, async (req, res) => {
  try {
    const { type = 'all', departmentId } = req.query;

    let where = {
      sucursalId: req.user.sucursalId
    };

    // Filter by type
    switch (type) {
      case 'public':
        // Public folders (created by admins)
        where.user = {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']
          }
        };
        break;
      case 'department':
        if (departmentId) {
          where.user = {
            departmentId: departmentId
          };
        } else if (req.user.departmentId) {
          where.user = {
            departmentId: req.user.departmentId
          };
        }
        break;
      case 'personal':
        where.userId = req.user.id;
        break;
      case 'all':
      default:
        // Get all folders user has access to
        where.OR = [
          { userId: req.user.id },
          {
            user: {
              role: {
                in: ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']
              }
            }
          },
          {
            user: {
              departmentId: req.user.departmentId
            }
          }
        ];
        break;
    }

    const folders = await prisma.folder.findMany({
      where,
      include: {
        parent: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            children: true,
            files: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ folders });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get document folders failed', error);
    res.status(500).json({ error: 'Failed to get document folders' });
  }
});

module.exports = router; 