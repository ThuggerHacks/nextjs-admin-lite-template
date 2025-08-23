const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 20 // Maximum 20 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all scans for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const scans = await prisma.scan.findMany({
      where: {
        userId: req.user.id,
        sucursalId: req.user.sucursalId
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(offset),
      take: parseInt(limit)
    });

    const total = await prisma.scan.count({
      where: {
        userId: req.user.id,
        sucursalId: req.user.sucursalId
      }
    });

    res.json({
      scans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get scans failed', error);
    res.status(500).json({ error: 'Failed to get scans' });
  }
});

// Get scan by ID
router.get('/:scanId', authenticateToken, async (req, res) => {
  try {
    const { scanId } = req.params;
    const scan = await prisma.scan.findUnique({
      where: { id: scanId }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    if (scan.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ scan });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get scan failed', error);
    res.status(500).json({ error: 'Failed to get scan' });
  }
});

// Create scan
router.post('/', authenticateToken, upload.array('images', 20), [
  body('title').notEmpty().withMessage('Scan title is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const { title } = req.body;
    const images = req.files;

    // Process images and create PDF
    const pdfDoc = await PDFDocument.create();
    const imageUrls = [];

    for (const image of images) {
      try {
        // Convert image to JPEG format with sharp
        const processedImage = await sharp(image.buffer)
          .jpeg({ quality: 80 })
          .toBuffer();

        // Embed image in PDF
        const imageEmbed = await pdfDoc.embedJpg(processedImage);
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        const imageAspectRatio = imageEmbed.width / imageEmbed.height;
        const pageAspectRatio = width / height;
        
        let imageWidth, imageHeight;
        if (imageAspectRatio > pageAspectRatio) {
          imageWidth = width * 0.9;
          imageHeight = imageWidth / imageAspectRatio;
        } else {
          imageHeight = height * 0.9;
          imageWidth = imageHeight * imageAspectRatio;
        }

        const x = (width - imageWidth) / 2;
        const y = (height - imageHeight) / 2;

        page.drawImage(imageEmbed, {
          x,
          y,
          width: imageWidth,
          height: imageHeight
        });

        // Store image URL (in a real app, you'd upload to cloud storage)
        const imageUrl = `uploads/scans/${Date.now()}-${image.originalname}`;
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        await logError('DATABASE_ERROR', 'Image processing failed', error);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const pdfUrl = `uploads/scans/${Date.now()}-${title}.pdf`;

    const scan = await prisma.scan.create({
      data: {
        title,
        userId: req.user.id,
        sucursalId: req.user.sucursalId,
        images: JSON.stringify(imageUrls),
        pdfUrl
      }
    });

    await createNotification(
      req.user.id,
      'SYSTEM_UPDATE',
      'Scan Criado',
      `Scan "${title}" foi criado com sucesso.`
    );

    res.status(201).json({
      message: 'Scan created successfully',
      scan: {
        ...scan,
        images: imageUrls
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create scan failed', error);
    res.status(500).json({ error: 'Failed to create scan' });
  }
});

// Delete scan
router.delete('/:scanId', authenticateToken, async (req, res) => {
  try {
    const { scanId } = req.params;

    const scan = await prisma.scan.findUnique({
      where: { id: scanId }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    if (scan.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.scan.delete({
      where: { id: scanId }
    });

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete scan failed', error);
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

// Download PDF
router.get('/:scanId/download', authenticateToken, async (req, res) => {
  try {
    const { scanId } = req.params;
    const scan = await prisma.scan.findUnique({
      where: { id: scanId }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    if (scan.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!scan.pdfUrl) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    // In a real application, you would serve the file from cloud storage
    // For now, we'll return the URL
    res.json({
      downloadUrl: scan.pdfUrl,
      scan
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Download scan failed', error);
    res.status(500).json({ error: 'Failed to download scan' });
  }
});

module.exports = router; 