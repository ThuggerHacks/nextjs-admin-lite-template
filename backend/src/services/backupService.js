const fs = require('fs');
const path = require('path');
const axios = require('axios');
const prisma = require('../lib/prisma');
const { logError } = require('../utils/errorLogger');

class BackupService {
  constructor() {
    this.isRunning = false;
  }

  // Create database backup
  async createBackup(sucursalId) {
    try {
      console.log(`Creating backup for sucursal ${sucursalId}...`);
      
      // Get sucursal info
      const sucursal = await prisma.sucursal.findUnique({
        where: { id: sucursalId }
      });

      if (!sucursal) {
        throw new Error(`Sucursal ${sucursalId} not found`);
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
      
      console.log(`Backup created locally: ${backupFilename}`);
      
      // Always store locally first, then try to sync if remote URL is configured
      if (sucursal.remoteUrl) {
        try {
          await this.sendBackupToRemote(backupPath, backupFilename, sucursal.remoteUrl);
          
          // Clean up local backup after successful remote send
          fs.unlinkSync(backupPath);
          
          console.log(`Backup sent to remote server: ${sucursal.remoteUrl}`);
          return { success: true, sentToRemote: true, filename: backupFilename };
        } catch (remoteError) {
          console.error('Failed to send backup to remote server (will retry later):', remoteError);
          
          // Keep local backup for later sync
          return { 
            success: true, 
            sentToRemote: false, 
            filename: backupFilename,
            localPath: backupPath,
            error: remoteError.message
          };
        }
      } else {
        return { 
          success: true, 
          sentToRemote: false, 
          filename: backupFilename,
          localPath: backupPath
        };
      }

    } catch (error) {
      console.error('Error creating backup:', error);
      await logError('BACKUP_ERROR', 'Failed to create database backup', error);
      return { success: false, error: error.message };
    }
  }

  // Send backup to remote server
  async sendBackupToRemote(backupPath, filename, remoteUrl) {
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

  // Create backups for all sucursals with remote URLs
  async createAllBackups() {
    if (this.isRunning) {
      console.log('Backup process already running, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      console.log('Starting backup process for all sucursals...');
      
      // Get all sucursals
      const sucursals = await prisma.sucursal.findMany({
        select: { id: true, name: true, remoteUrl: true }
      });

      const results = [];
      
      for (const sucursal of sucursals) {
        try {
          const result = await this.createBackup(sucursal.id);
          results.push({
            sucursalId: sucursal.id,
            sucursalName: sucursal.name,
            ...result
          });
        } catch (error) {
          console.error(`Failed to backup sucursal ${sucursal.name}:`, error);
          results.push({
            sucursalId: sucursal.id,
            sucursalName: sucursal.name,
            success: false,
            error: error.message
          });
        }
      }

      console.log('Backup process completed:', results);
      return results;

    } catch (error) {
      console.error('Error in backup process:', error);
      await logError('BACKUP_ERROR', 'Failed to create backups for all sucursals', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Check internet connectivity
  async checkConnectivity() {
    try {
      // Try to ping a reliable service
      await axios.get('https://www.google.com', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Sync all pending local backups to remote servers
  async syncPendingBackups() {
    try {
      console.log('Starting sync of pending backups...');
      
      // Check internet connectivity first
      const hasInternet = await this.checkConnectivity();
      if (!hasInternet) {
        console.log('No internet connection, skipping backup sync');
        return { synced: 0, failed: 0, skipped: true, reason: 'No internet connection' };
      }
      
      // Get all sucursals with remote URLs
      const sucursals = await prisma.sucursal.findMany({
        where: {
          remoteUrl: { not: null }
        },
        select: { id: true, name: true, remoteUrl: true }
      });

      const backupsDir = path.join(__dirname, '../../backups');
      
      if (!fs.existsSync(backupsDir)) {
        console.log('No backups directory found');
        return { synced: 0, failed: 0 };
      }

      const files = fs.readdirSync(backupsDir);
      const backupFiles = files
        .filter(file => file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(backupsDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            createdAt: stats.birthtime,
            sucursalName: file.split('_')[0]
          };
        })
        .sort((a, b) => a.createdAt - b.createdAt); // Oldest first

      let synced = 0;
      let failed = 0;

      // Group backups by sucursal and sync them
      for (const sucursal of sucursals) {
        const sucursalBackups = backupFiles.filter(file => 
          file.sucursalName === sucursal.name
        );

        console.log(`Found ${sucursalBackups.length} pending backups for ${sucursal.name}`);

        for (const backup of sucursalBackups) {
          try {
            await this.sendBackupToRemote(backup.path, backup.name, sucursal.remoteUrl);
            
            // Delete local backup after successful sync
            fs.unlinkSync(backup.path);
            console.log(`Successfully synced and deleted: ${backup.name}`);
            synced++;
            
          } catch (error) {
            console.error(`Failed to sync backup ${backup.name}:`, error.message);
            failed++;
          }
        }
      }

      console.log(`Sync completed: ${synced} synced, ${failed} failed`);
      return { synced, failed };

    } catch (error) {
      console.error('Error syncing pending backups:', error);
      await logError('BACKUP_ERROR', 'Failed to sync pending backups', error);
      return { synced: 0, failed: 0, error: error.message };
    }
  }

  // Clean up old local backups (keep last 10 per sucursal)
  async cleanupOldBackups() {
    try {
      const backupsDir = path.join(__dirname, '../../backups');
      
      if (!fs.existsSync(backupsDir)) {
        return;
      }

      const files = fs.readdirSync(backupsDir);
      const backupFiles = files
        .filter(file => file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(backupsDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            createdAt: stats.birthtime,
            sucursalName: file.split('_')[0]
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt); // Newest first

      // Group by sucursal name
      const groupedBackups = {};
      backupFiles.forEach(file => {
        if (!groupedBackups[file.sucursalName]) {
          groupedBackups[file.sucursalName] = [];
        }
        groupedBackups[file.sucursalName].push(file);
      });

      // Keep only last 10 backups per sucursal
      Object.values(groupedBackups).forEach(sucursalBackups => {
        if (sucursalBackups.length > 10) {
          const toDelete = sucursalBackups.slice(10);
          toDelete.forEach(file => {
            try {
              fs.unlinkSync(file.path);
              console.log(`Deleted old backup: ${file.name}`);
            } catch (error) {
              console.error(`Failed to delete backup ${file.name}:`, error);
            }
          });
        }
      });

    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }
}

module.exports = new BackupService();
