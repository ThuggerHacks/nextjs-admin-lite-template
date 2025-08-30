const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logError } = require('../utils/errorLogger');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads with 10GB support
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB limit
    fieldSize: 10 * 1024 * 1024 * 1024, // 10GB field size limit
    files: 1, // Allow only one file at a time for large uploads
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// Upload file and return URL
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/api/uploads/files/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fullUrl,
        path: fileUrl
      }
    });
  } catch (error) {
    await logError('FILE_UPLOAD_ERROR', 'File upload failed', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Serve uploaded files
router.get('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Create upload session for large files
router.post('/session', authenticateToken, async (req, res) => {
  try {
    const { fileName, fileSize, folderId } = req.body;
    
    if (!fileName || !fileSize) {
      return res.status(400).json({ error: 'FileName and fileSize are required' });
    }

    // Validate file size (10GB limit)
    if (fileSize > 10 * 1024 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10GB limit' });
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create session directory
    const sessionDir = path.join(uploadsDir, 'sessions', sessionId);
    await fs.promises.mkdir(sessionDir, { recursive: true });

    // Store session info (in production, use Redis or database)
    const sessionInfo = {
      sessionId,
      fileName,
      fileSize: parseInt(fileSize),
      folderId,
      userId: req.user.id,
      createdAt: new Date(),
      chunks: [],
      totalChunks: Math.ceil(fileSize / (10 * 1024 * 1024)) // 10MB chunks
    };

    // Store session info in a file (simple implementation)
    await fs.promises.writeFile(
      path.join(sessionDir, 'session.json'), 
      JSON.stringify(sessionInfo)
    );

    res.status(201).json({ 
      message: 'Upload session created',
      sessionId,
      totalChunks: sessionInfo.totalChunks
    });
  } catch (error) {
    await logError('SESSION_CREATE_ERROR', 'Failed to create upload session', error);
    res.status(500).json({ error: 'Failed to create upload session' });
  }
});

// Upload chunk for large files
router.post('/chunk', authenticateToken, upload.single('chunk'), async (req, res) => {
  try {
    const { sessionId, chunkIndex, fileName } = req.body;
    const chunkFile = req.file;
    
    console.log('Chunk upload request received:', { 
      sessionId, 
      chunkIndex, 
      fileName,
      hasChunkFile: !!chunkFile,
      chunkFileSize: chunkFile ? chunkFile.size : 0
    });
    
    if (!sessionId || chunkIndex === undefined || !chunkFile || !fileName) {
      return res.status(400).json({ 
        error: 'SessionId, chunkIndex, chunk file, and fileName are required',
        received: { 
          sessionId, 
          chunkIndex, 
          chunk: chunkFile ? 'present' : 'missing', 
          fileName,
          chunkFileSize: chunkFile ? chunkFile.size : 0
        }
      });
    }

    const sessionDir = path.join(uploadsDir, 'sessions', sessionId);
    const sessionInfoPath = path.join(sessionDir, 'session.json');
    
    // Check if session exists
    if (!fs.existsSync(sessionInfoPath)) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    // Read session info
    const sessionInfo = JSON.parse(await fs.promises.readFile(sessionInfoPath, 'utf8'));
    
    // Validate user ownership
    if (sessionInfo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this upload session' });
    }

    // The chunk file is already saved to disk by multer, so we just need to move it to the session directory
    const chunkPath = path.join(sessionDir, `chunk_${chunkIndex}`);
    
    try {
      // Move the uploaded chunk file to the session directory
      await fs.promises.rename(chunkFile.path, chunkPath);
      console.log('Chunk file moved to session directory:', chunkPath);
    } catch (moveError) {
      console.error('Failed to move chunk file:', moveError);
      // Try to copy instead if rename fails
      try {
        await fs.promises.copyFile(chunkFile.path, chunkPath);
        await fs.promises.unlink(chunkFile.path); // Clean up original
        console.log('Chunk file copied to session directory:', chunkPath);
      } catch (copyError) {
        console.error('Failed to copy chunk file:', copyError);
        return res.status(500).json({ error: 'Failed to save chunk file' });
      }
    }

    // Update session info
    sessionInfo.chunks.push(parseInt(chunkIndex));
    sessionInfo.chunks.sort((a, b) => a - b);
    
    await fs.promises.writeFile(sessionInfoPath, JSON.stringify(sessionInfo, null, 2));

    // Return only progress info, no success message to avoid toasts
    res.json({ 
      chunkIndex: parseInt(chunkIndex),
      uploadedChunks: sessionInfo.chunks.length,
      totalChunks: sessionInfo.totalChunks
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    await logError('CHUNK_UPLOAD_ERROR', 'Failed to upload chunk', error);
    res.status(500).json({ error: 'Failed to upload chunk' });
  }
});

// Complete upload session
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }

    const sessionDir = path.join(uploadsDir, 'sessions', sessionId);
    const sessionInfoPath = path.join(sessionDir, 'session.json');
    
    // Check if session exists
    if (!fs.existsSync(sessionInfoPath)) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    // Read session info
    const sessionInfo = JSON.parse(await fs.promises.readFile(sessionInfoPath, 'utf8'));
    
    // Validate user ownership
    if (sessionInfo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this upload session' });
    }

    // Check if all chunks are uploaded
    if (sessionInfo.chunks.length !== sessionInfo.totalChunks) {
      return res.status(400).json({ 
        error: 'Not all chunks uploaded', 
        uploaded: sessionInfo.chunks.length,
        total: sessionInfo.totalChunks
      });
    }

    // Combine chunks into final file
    const finalFileName = `${Date.now()}-${sessionInfo.fileName}`;
    const finalFilePath = path.join(uploadsDir, finalFileName);
    const finalFileStream = fs.createWriteStream(finalFilePath);

    // Combine chunks in order
    for (let i = 0; i < sessionInfo.totalChunks; i++) {
      const chunkPath = path.join(sessionDir, `chunk_${i}`);
      if (!fs.existsSync(chunkPath)) {
        return res.status(400).json({ error: `Chunk ${i} not found` });
      }
      
      const chunkData = await fs.promises.readFile(chunkPath);
      finalFileStream.write(chunkData);
    }
    
    finalFileStream.end();

    // Wait for file to be written
    await new Promise((resolve, reject) => {
      finalFileStream.on('finish', resolve);
      finalFileStream.on('error', reject);
    });

    // Get final file size
    const finalFileStats = await fs.promises.stat(finalFilePath);
    
    // Clean up session directory
    try {
      await fs.promises.rm(sessionDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('Failed to cleanup session directory:', cleanupError);
    }

    const fileUrl = `/api/uploads/files/${finalFileName}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    res.json({
      message: 'File upload completed successfully',
      file: {
        originalName: sessionInfo.fileName,
        filename: finalFileName,
        size: finalFileStats.size,
        url: fullUrl,
        path: fileUrl
      }
    });
  } catch (error) {
    await logError('UPLOAD_COMPLETE_ERROR', 'Failed to complete upload', error);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
});

module.exports = router; 