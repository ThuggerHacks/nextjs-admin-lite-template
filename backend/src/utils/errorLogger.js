const prisma = require('../lib/prisma');
const currentSucursal = require('../lib/currentSucursal');

const logError = async (errorType, description, errorDetails = null) => {
  try {
    const sucursalInfo = await currentSucursal.getInfo();
    if (!sucursalInfo) {
      console.error('No sucursal info available for error logging');
      return;
    }

    await prisma.errorLog.create({
      data: {
        sucursalId: sucursalInfo.id,
        errorType,
        description,
        errorDetails: errorDetails ? JSON.stringify(errorDetails) : null
      }
    });
  } catch (error) {
    console.error('Failed to log error:', error);
  }
};

module.exports = { logError }; 