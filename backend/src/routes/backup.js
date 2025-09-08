const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');
const prisma = require('../lib/prisma');

const router = express.Router();

// Create database backup
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { sucursalId } = req.user;
    
    // Get sucursal info
    const sucursal = await prisma.sucursal.findUnique({
      where: { id: sucursalId }
    });

    if (!sucursal) {
      return res.status(404).json({ error: 'Sucursal not found' });
    }

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `${sucursal.name}_${timestamp}_db.db`;
    
    // Path to the database file
    const dbPath = path.join(__dirname, '../../prisma/dev.db');
    const backupPath = path.join(__dirname, '../../backups', backupFilename);
    
    // Ensure backups directory exists
    const backupsDir = path.dirname(backupPath);
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Copy database file
    fs.copyFileSync(dbPath, backupPath);
    
    // If remote URL is configured, send backup to remote server
    if (sucursal.remoteUrl) {
      try {
        await sendBackupToRemote(backupPath, backupFilename, sucursal.remoteUrl);
        
        // Clean up local backup after successful remote send
        fs.unlinkSync(backupPath);
        
        res.json({ 
          message: 'Backup created and sent to remote server successfully',
          filename: backupFilename,
          sentToRemote: true
        });
      } catch (remoteError) {
        console.error('Failed to send backup to remote server:', remoteError);
        
        // Keep local backup if remote send fails
        res.json({ 
          message: 'Backup created locally, but failed to send to remote server',
          filename: backupFilename,
          localPath: backupPath,
          sentToRemote: false,
          error: remoteError.message
        });
      }
    } else {
      res.json({ 
        message: 'Backup created successfully',
        filename: backupFilename,
        localPath: backupPath,
        sentToRemote: false
      });
    }

  } catch (error) {
    console.error('Error creating backup:', error);
    await logError('BACKUP_ERROR', 'Failed to create database backup', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Send backup to remote server
async function sendBackupToRemote(backupPath, filename, remoteUrl) {
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(backupPath);
    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
    
    formData.append('backup', blob, filename);
    formData.append('sucursalName', filename.split('_')[0]);
    formData.append('timestamp', new Date().toISOString());

    const response = await axios.post(`${remoteUrl}/api/backup/receive`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000 // 30 second timeout
    });

    if (response.status !== 200) {
      throw new Error(`Remote server returned status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    throw new Error(`Failed to send backup to remote server: ${error.message}`);
  }
}

// Get backup status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const { sucursalId } = req.user;
    
    const sucursal = await prisma.sucursal.findUnique({
      where: { id: sucursalId },
      select: { name: true, remoteUrl: true }
    });

    if (!sucursal) {
      return res.status(404).json({ error: 'Sucursal not found' });
    }

    // Check local backups directory
    const backupsDir = path.join(__dirname, '../../backups');
    let localBackups = [];
    
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir);
      localBackups = files
        .filter(file => file.includes(sucursal.name) && file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(backupsDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            createdAt: stats.birthtime
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
    }

    res.json({
      sucursal: sucursal.name,
      hasRemoteUrl: !!sucursal.remoteUrl,
      remoteUrl: sucursal.remoteUrl,
      localBackups: localBackups.slice(0, 10), // Last 10 backups
      totalLocalBackups: localBackups.length
    });

  } catch (error) {
    console.error('Error getting backup status:', error);
    await logError('BACKUP_ERROR', 'Failed to get backup status', error);
    res.status(500).json({ error: 'Failed to get backup status' });
  }
});

// Sync pending backups to remote servers
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const backupService = require('../services/backupService');
    const result = await backupService.syncPendingBackups();
    
    res.json({
      message: 'Backup sync completed',
      ...result
    });
  } catch (error) {
    console.error('Error syncing backups:', error);
    await logError('BACKUP_ERROR', 'Failed to sync backups', error);
    res.status(500).json({ error: 'Failed to sync backups' });
  }
});

// Receive backup from remote server
router.post('/receive', async (req, res) => {
  try {
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');
    
    // Configure multer for file upload
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const backupsDir = path.join(__dirname, '../../backups/received');
        if (!fs.existsSync(backupsDir)) {
          fs.mkdirSync(backupsDir, { recursive: true });
        }
        cb(null, backupsDir);
      },
      filename: (req, file, cb) => {
        // Use original filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = file.originalname;
        const nameWithoutExt = path.parse(originalName).name;
        const ext = path.parse(originalName).ext;
        cb(null, `${nameWithoutExt}_received_${timestamp}${ext}`);
      }
    });

    const upload = multer({ 
      storage: storage,
      limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
      }
    });

    upload.single('backup')(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ error: 'File upload failed', details: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No backup file received' });
      }

      const { sucursalName, timestamp } = req.body;
      
      console.log(`Received backup from ${sucursalName}: ${req.file.filename}`);
      
      // Log the received backup
      await logError('BACKUP_RECEIVED', `Received backup from ${sucursalName}`, {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        sucursalName,
        timestamp
      });

      res.json({
        message: 'Backup received successfully',
        filename: req.file.filename,
        size: req.file.size,
        sucursalName,
        receivedAt: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Error receiving backup:', error);
    await logError('BACKUP_ERROR', 'Failed to receive backup', error);
    res.status(500).json({ error: 'Failed to receive backup' });
  }
});

// Get received backups
router.get('/received', authenticateToken, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const receivedBackupsDir = path.join(__dirname, '../../backups/received');
    
    if (!fs.existsSync(receivedBackupsDir)) {
      return res.json({ receivedBackups: [] });
    }

    const files = fs.readdirSync(receivedBackupsDir);
    const receivedBackups = files
      .filter(file => file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(receivedBackupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          receivedAt: stats.birthtime,
          sucursalName: file.split('_')[0]
        };
      })
      .sort((a, b) => b.receivedAt - a.receivedAt);

    res.json({
      receivedBackups: receivedBackups.slice(0, 20), // Last 20 received backups
      totalReceived: receivedBackups.length
    });

  } catch (error) {
    console.error('Error getting received backups:', error);
    await logError('BACKUP_ERROR', 'Failed to get received backups', error);
    res.status(500).json({ error: 'Failed to get received backups' });
  }
});

module.exports = router;
