const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Test endpoint to verify the route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Libraries route is working' });
});

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

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

// ===== LIBRARY FILE MANAGEMENT =====

// Get library files and folders
router.get('/:libraryId/files', authenticateToken, async (req, res) => {
  try {
    const { libraryId } = req.params;
    const { parentId = null } = req.query;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user is a member of the library
    const isMember = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId: req.user.id
      }
    });

    const canAccess = isMember || library.userId === req.user.id || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get folders and files for the specified parentId
    const folders = await prisma.libraryFolder.findMany({
      where: {
        libraryId,
        parentId: parentId === 'null' ? null : parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const files = await prisma.libraryFile.findMany({
      where: {
        libraryId,
        folderId: parentId === 'null' ? null : parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('Library content query:', {
      libraryId,
      parentId,
      foldersFound: folders.length,
      filesFound: files.length,
      folders: folders.map(f => ({ id: f.id, name: f.name, parentId: f.parentId })),
      files: files.map(f => ({ id: f.id, name: f.name, folderId: f.folderId }))
    });

    res.json({
      folders,
      files,
      parentId
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get library files failed', error);
    res.status(500).json({ error: 'Failed to get library files' });
  }
});

// Create folder in library
router.post('/:libraryId/folders', authenticateToken, [
  body('name').notEmpty().withMessage('Folder name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { libraryId } = req.params;
    const { name, parentId } = req.body;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user can write to library
    const isMember = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId: req.user.id
      }
    });

    const canWrite = isMember || library.userId === req.user.id || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canWrite) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if folder already exists
    const existingFolder = await prisma.libraryFolder.findFirst({
      where: {
        libraryId,
        name,
        parentId: parentId || null
      }
    });

    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists in this location' });
    }

    const folder = await prisma.libraryFolder.create({
      data: {
        name,
        description: '',
        parentId: parentId || null,
        userId: req.user.id,
        sucursalId: req.user.sucursalId,
        libraryId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create library folder failed', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Upload file to library
router.post('/:libraryId/files', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('File upload request received:', { libraryId: req.params.libraryId, body: req.body, file: req.file });
    
    const { libraryId } = req.params;
    const { folderId, description = '' } = req.body;
    const file = req.file;

    if (!file) {
      console.log('No file received in request');
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? `Buffer of ${file.buffer.length} bytes` : 'No buffer'
    });

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 50MB limit' });
    }

    // Validate file buffer
    if (!file.buffer || file.buffer.length === 0) {
      return res.status(400).json({ error: 'File buffer is empty or missing' });
    }

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user can write to library
    const isMember = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId: req.user.id
      }
    });

    const canWrite = isMember || library.userId === req.user.id || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canWrite) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${file.originalname}`;
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'libraries', libraryId);
    const filePath = path.join(uploadDir, fileName);

    // Ensure upload directory exists
    try {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    } catch (dirError) {
      console.error('Failed to create upload directory:', dirError);
      return res.status(500).json({ error: 'Failed to create upload directory' });
    }

    // Save file to disk
    try {
      await fs.promises.writeFile(filePath, file.buffer);
    } catch (writeError) {
      console.error('Failed to write file:', writeError);
      return res.status(500).json({ error: 'Failed to save file' });
    }

    console.log('Creating library file record with data:', {
      name: file.originalname,
      description,
      url: filePath,
      size: file.size,
      type: path.extname(file.originalname).substring(1),
      mimeType: file.mimetype,
      libraryId,
      folderId: folderId || null,
      userId: req.user.id,
      sucursalId: req.user.sucursalId
    });

    let libraryFile;
    try {
      libraryFile = await prisma.libraryFile.create({
        data: {
          name: file.originalname,
          originalName: file.originalname,
          description,
          url: filePath,
          size: file.size,
          type: path.extname(file.originalname).substring(1) || 'unknown',
          mimeType: file.mimetype,
          libraryId,
          folderId: folderId || null,
          userId: req.user.id,
          sucursalId: req.user.sucursalId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log('Library file created successfully:', libraryFile);
    } catch (prismaError) {
      console.error('Prisma error:', prismaError);
      return res.status(500).json({ error: 'Failed to create database record' });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: libraryFile
    });
  } catch (error) {
    console.error('File upload error details:', error);
    await logError('DATABASE_ERROR', 'Upload library file failed', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete library file
router.delete('/:libraryId/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const { libraryId, fileId } = req.params;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const file = await prisma.libraryFile.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user can delete file
    const isMember = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId: req.user.id
      }
    });

    const canDelete = file.userId === req.user.id || library.userId === req.user.id || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from disk
    try {
      await fs.promises.unlink(file.url);
    } catch (diskError) {
      console.warn('Failed to delete file from disk:', diskError);
    }

    // Delete file record
    await prisma.libraryFile.delete({
      where: { id: fileId }
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete library file failed', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Delete library folder
router.delete('/:libraryId/folders/:folderId', authenticateToken, async (req, res) => {
  try {
    const { libraryId, folderId } = req.params;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const folder = await prisma.libraryFolder.findUnique({
      where: { id: folderId }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if user can delete folder
    const isMember = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId: req.user.id
      }
    });

    const canDelete = folder.userId === req.user.id || library.userId === req.user.id || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if folder has contents
    const hasFiles = await prisma.libraryFile.findFirst({
      where: {
        libraryId,
        folderId: folderId
      }
    });

    const hasFolders = await prisma.libraryFolder.findFirst({
      where: {
        libraryId,
        parentId: folderId
      }
    });

    if (hasFiles || hasFolders) {
      return res.status(400).json({ error: 'Cannot delete folder with contents' });
    }

    // Delete folder
    await prisma.libraryFolder.delete({
      where: { id: folderId }
    });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete library folder failed', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Rename library file
router.patch('/:libraryId/files/:fileId', authenticateToken, [
  body('name').notEmpty().withMessage('File name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { libraryId, fileId } = req.params;
    const { name } = req.body;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const file = await prisma.libraryFile.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user can rename file
    const isMember = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId: req.user.id
      }
    });

    const canRename = file.userId === req.user.id || library.userId === req.user.id || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canRename) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update file name
    await prisma.libraryFile.update({
      where: { id: fileId },
      data: { name }
    });

    res.json({ message: 'File renamed successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Rename library file failed', error);
    res.status(500).json({ error: 'Failed to rename file' });
  }
});

// Rename library folder
router.patch('/:libraryId/folders/:folderId', authenticateToken, [
  body('name').notEmpty().withMessage('Folder name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { libraryId, folderId } = req.params;
    const { name } = req.body;

    const library = await prisma.library.findUnique({
      where: { id: libraryId }
    });

    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const folder = await prisma.libraryFolder.findUnique({
      where: { id: folderId }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if user can rename folder
    const isMember = await prisma.libraryMember.findFirst({
      where: {
        libraryId,
        userId: req.user.id
      }
    });

    const canRename = folder.userId === req.user.id || library.userId === req.user.id || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canRename) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update folder name
    await prisma.libraryFolder.update({
      where: { id: folderId },
      data: { name }
    });

    res.json({ message: 'Folder renamed successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Rename library folder failed', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
});

module.exports = router; 