const prisma = require('../lib/prisma');
const currentSucursal = require('../lib/currentSucursal');
const axios = require('axios');

const logError = async (errorType, description, errorDetails = null) => {
  try {
    const sucursalInfo = await currentSucursal.getInfo();
    if (!sucursalInfo) {
      console.error('No sucursal info available for error logging');
      return;
    }

    // Create error log in database
    const errorLog = await prisma.errorLog.create({
      data: {
        sucursalId: sucursalInfo.id,
        errorType,
        description,
        errorDetails: errorDetails ? JSON.stringify(errorDetails) : null,
        sentToRemote: false
      }
    });

    // Try to send to remote server immediately (if configured)
    if (sucursalInfo.remoteUrl) {
      try {
        await sendErrorToRemote(errorLog, sucursalInfo.remoteUrl);
        
        // Mark as sent if successful
        await prisma.errorLog.update({
          where: { id: errorLog.id },
          data: { sentToRemote: true }
        });
        
        console.log(`Error log sent to remote server: ${sucursalInfo.remoteUrl}`);
      } catch (remoteError) {
        console.error('Failed to send error log to remote server (will retry later):', remoteError.message);
        // Keep sentToRemote as false for later retry
      }
    }
  } catch (error) {
    console.error('Failed to log error:', error);
  }
};

// Send error log to remote server
const sendErrorToRemote = async (errorLog, remoteUrl) => {
  try {
    const response = await axios.post(`${remoteUrl}/api/error-logs/receive`, {
      logs: [{
        id: errorLog.id,
        errorType: errorLog.errorType,
        description: errorLog.description,
        errorDetails: errorLog.errorDetails,
        createdAt: errorLog.createdAt
      }]
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Remote server returned status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    throw new Error(`Failed to send error log to remote server: ${error.message}`);
  }
};

// Retry sending unsent error logs (can be called by cron or manually)
const retryUnsentErrorLogs = async () => {
  try {
    const sucursalInfo = await currentSucursal.getInfo();
    if (!sucursalInfo || !sucursalInfo.remoteUrl) {
      return;
    }

    // Get unsent error logs
    const unsentLogs = await prisma.errorLog.findMany({
      where: {
        sucursalId: sucursalInfo.id,
        sentToRemote: false
      },
      take: 50, // Limit to 50 logs per batch
      orderBy: { createdAt: 'asc' } // Oldest first
    });

    if (unsentLogs.length === 0) {
      return;
    }

    console.log(`Retrying ${unsentLogs.length} unsent error logs...`);

    try {
      await sendErrorLogsToRemote(unsentLogs, sucursalInfo.remoteUrl);
      
      // Mark all as sent
      await prisma.errorLog.updateMany({
        where: {
          id: { in: unsentLogs.map(log => log.id) }
        },
        data: { sentToRemote: true }
      });

      console.log(`Successfully sent ${unsentLogs.length} error logs to remote server`);
    } catch (error) {
      console.error('Failed to retry unsent error logs:', error.message);
    }
  } catch (error) {
    console.error('Error in retryUnsentErrorLogs:', error);
  }
};

// Send multiple error logs to remote server
const sendErrorLogsToRemote = async (logs, remoteUrl) => {
  try {
    const response = await axios.post(`${remoteUrl}/api/error-logs/receive`, {
      logs: logs.map(log => ({
        id: log.id,
        errorType: log.errorType,
        description: log.description,
        errorDetails: log.errorDetails,
        createdAt: log.createdAt
      }))
    }, {
      timeout: 30000, // 30 second timeout for batch
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Remote server returned status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    throw new Error(`Failed to send error logs to remote server: ${error.message}`);
  }
};

module.exports = { logError, retryUnsentErrorLogs }; 