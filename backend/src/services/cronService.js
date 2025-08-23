const cron = require('node-cron');
const axios = require('axios');
const prisma = require('../lib/prisma');
const { logError } = require('../utils/errorLogger');
const currentSucursal = require('../lib/currentSucursal');

class CronService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('Cron service is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting cron service...');

    // Run every 12 hours (twice a day) - sync existing connections and discover new sucursals
    cron.schedule('0 */12 * * *', async () => {
      console.log('Running sucursal sync cron job...');
      await this.syncSucursals();
      await this.discoverNewSucursals();
    });

    console.log('Cron service started successfully');
  }

  stop() {
    if (!this.isRunning) {
      console.log('Cron service is not running');
      return;
    }

    this.isRunning = false;
    cron.getTasks().forEach(task => task.destroy());
    console.log('Cron service stopped');
  }

  async syncSucursals() {
    try {
      const currentSucursalInfo = await currentSucursal.getInfo();
      if (!currentSucursalInfo) {
        console.log('No current sucursal info available for sync');
        return;
      }

      const connections = await prisma.sucursalConnection.findMany({
        where: {
          OR: [
            { sourceSucursalId: currentSucursalInfo.id },
            { targetSucursalId: currentSucursalInfo.id }
          ]
        },
        include: {
          sourceSucursal: true,
          targetSucursal: true
        }
      });

      for (const connection of connections) {
        const targetSucursal = connection.sourceSucursalId === currentSucursalInfo.id 
          ? connection.targetSucursal 
          : connection.sourceSucursal;

        if (targetSucursal && targetSucursal.serverUrl) {
          try {
            await this.syncWithSucursal(targetSucursal);
          } catch (error) {
            console.error(`Failed to sync with sucursal ${targetSucursal.name}:`, error);
            await logError('NETWORK_ERROR', `Failed to sync with sucursal ${targetSucursal.name}`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in sucursal sync cron job:', error);
      await logError('DATABASE_ERROR', 'Sucursal sync cron job failed', error);
    }
  }

  async discoverNewSucursals() {
    try {
      const currentSucursalInfo = await currentSucursal.getInfo();
      if (!currentSucursalInfo) {
        console.log('No current sucursal info available for discovery');
        return;
      }

      // Get all sucursals that might have new connections
      const allSucursals = await prisma.sucursal.findMany({
        where: {
          id: { not: currentSucursalInfo.id }
        }
      });

      for (const sucursal of allSucursals) {
        if (sucursal.serverUrl) {
          try {
            // Try to fetch new sucursals from this sucursal
            const response = await axios.get(`${sucursal.serverUrl}/api/sucursals`, {
              timeout: 10000,
              headers: {
                'Authorization': `Bearer ${this.getSystemToken()}` // You might need to implement this
              }
            });

            if (response.data && response.data.sucursals) {
              for (const remoteSucursal of response.data.sucursals) {
                if (remoteSucursal.id !== currentSucursalInfo.id) {
                  await this.upsertSucursal(remoteSucursal);
                }
              }
            }
          } catch (error) {
            console.error(`Failed to discover sucursals from ${sucursal.name}:`, error.message);
            await logError('NETWORK_ERROR', `Failed to discover sucursals from ${sucursal.name}`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in sucursal discovery cron job:', error);
      await logError('DATABASE_ERROR', 'Sucursal discovery cron job failed', error);
    }
  }

  async syncWithSucursal(targetSucursal) {
    try {
      const response = await axios.get(`${targetSucursal.serverUrl}/api/sucursals/current/info`, {
        timeout: 10000
      });

      if (response.data && response.data.sucursal) {
        const sucursalData = response.data.sucursal;
        
        await this.upsertSucursal(sucursalData);
        console.log(`Successfully synced with sucursal: ${sucursalData.name}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.log(`Sucursal ${targetSucursal.name} is not reachable`);
      } else {
        throw error;
      }
    }
  }

  async upsertSucursal(sucursalData) {
    try {
      await prisma.sucursal.upsert({
        where: { id: sucursalData.id },
        update: {
          name: sucursalData.name,
          description: sucursalData.description,
          location: sucursalData.location,
          serverUrl: sucursalData.serverUrl,
          updatedAt: new Date()
        },
        create: {
          id: sucursalData.id,
          name: sucursalData.name,
          description: sucursalData.description,
          location: sucursalData.location,
          serverUrl: sucursalData.serverUrl
        }
      });
    } catch (error) {
      console.error(`Failed to upsert sucursal ${sucursalData.name}:`, error);
      await logError('DATABASE_ERROR', `Failed to upsert sucursal ${sucursalData.name}`, error);
    }
  }

  // Helper method to get system token for API calls
  getSystemToken() {
    // This should be implemented based on your authentication strategy
    // For now, returning null - you might want to create a system user or use a different approach
    return null;
  }

  async manualSync() {
    console.log('Starting manual sucursal sync...');
    await this.syncSucursals();
    await this.discoverNewSucursals();
    console.log('Manual sucursal sync completed');
  }
}

const cronService = new CronService();

module.exports = cronService; 