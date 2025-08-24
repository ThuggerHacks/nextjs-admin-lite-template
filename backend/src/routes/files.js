const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get all files for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { folderId, isPublic, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      sucursalId: req.user.sucursalId
    };

    if (folderId) {
      where.folderId = folderId;
    }

    if (isPublic === 'true') {
      where.isPublic = true;
    } else if (isPublic === 'false') {
      where.isPublic = false;
      where.userId = req.user.id;
    } else {
      where.OR = [
        { userId: req.user.id },
        { isPublic: true }
      ];
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.file.count({ where });

    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get files failed', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

// Get file by ID
router.get('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id && !file.isPublic && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ file });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get file failed', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
});

// Create file with URL (two-step process)
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  // body('url').isURL().withMessage('Valid file URL is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('folderId').optional().isString().withMessage('Folder ID must be a string'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('size').optional().isNumeric().withMessage('Size must be a number'),
  body('type').optional().isString().withMessage('Type must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, url, description, folderId, isPublic = false, size, type } = req.body;
    console.log('📁 Backend: Creating file with data:', { name, url, description, folderId, isPublic, size, type });

    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId }
      });

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }

      if (folder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied to folder' });
      }
    }

    const fileData = {
      name,
      description,
      url,
      size: size || 0,
      type: type || 'application/octet-stream',
      isPublic,
      folderId,
      userId: req.user.id,
      sucursalId: req.user.sucursalId
    };
    
    console.log('📁 Backend: Saving file to database with data:', fileData);
    
    const file = await prisma.file.create({
      data: fileData,
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('📁 Backend: File created successfully:', file);

    await createNotification(
      req.user.id,
      'FILE_UPLOADED',
      'Arquivo Enviado',
      `Arquivo "${name}" foi enviado com sucesso.`
    );

    res.status(201).json({
      message: 'File created successfully',
      file
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create file failed', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// Update file
router.put('/:fileId', authenticateToken, [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fileId } = req.params;
    const { name, description, isPublic } = req.body;

    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: updateData,
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'File updated successfully',
      file: updatedFile
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update file failed', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Rename file
router.patch('/:fileId/rename', authenticateToken, [
  body('name').notEmpty().withMessage('New name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fileId } = req.params;
    const { name } = req.body;

    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: { name },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    await createNotification(
      req.user.id,
      'FILE_RENAMED',
      'Arquivo Renomeado',
      `Arquivo "${file.name}" foi renomeado para "${name}".`
    );

    res.json({
      message: 'File renamed successfully',
      file: updatedFile
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Rename file failed', error);
    res.status(500).json({ error: 'Failed to rename file' });
  }
});

// Move file to folder
router.patch('/:fileId/move', authenticateToken, [
  body('folderId').optional().isString().withMessage('Folder ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fileId } = req.params;
    const { folderId } = req.body;

    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId }
      });

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }

      if (folder.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied to folder' });
      }
    }

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: { folderId },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'File moved successfully',
      file: updatedFile
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Move file failed', error);
    res.status(500).json({ error: 'Failed to move file' });
  }
});

// Delete file
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.file.delete({
      where: { id: fileId }
    });

    await createNotification(
      req.user.id,
      'FILE_DELETED',
      'Arquivo Excluído',
      `Arquivo "${file.name}" foi excluído.`
    );

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete file failed', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get public files
router.get('/public/files', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const files = await prisma.file.findMany({
      where: {
        isPublic: true,
        sucursalId: req.user.sucursalId
      },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.file.count({
      where: {
        isPublic: true,
        sucursalId: req.user.sucursalId
      }
    });

    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get public files failed', error);
    res.status(500).json({ error: 'Failed to get public files' });
  }
});

// Get all files for documents view (public, department, and user files)
router.get('/documents/all', authenticateToken, async (req, res) => {
  try {
    const { type = 'all', departmentId, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let where = {
      sucursalId: req.user.sucursalId
    };

    // Filter by type
    switch (type) {
      case 'public':
        where.isPublic = true;
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
        // Get all files user has access to
        where.OR = [
          { userId: req.user.id },
          { isPublic: true },
          {
            user: {
              departmentId: req.user.departmentId
            }
          }
        ];
        break;
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        folder: true,
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
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.file.count({ where });

    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get documents failed', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// Get all folders for documents view
router.get('/documents/folders', authenticateToken, async (req, res) => {
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