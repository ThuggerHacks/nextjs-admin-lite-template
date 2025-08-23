const prisma = require('../lib/prisma');
const currentSucursal = require('../lib/currentSucursal');

const createNotification = async (userId, type, title, description, sucursalId = null) => {
  try {
    const sucursalInfo = sucursalId || (await currentSucursal.getInfo())?.id;
    if (!sucursalInfo) {
      console.error('No sucursal info available for notification');
      return;
    }

    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        description,
        sucursalId: sucursalInfo
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

const createDepartmentNotification = async (departmentId, type, title, description, excludeUserId = null) => {
  try {
    const sucursalInfo = await currentSucursal.getInfo();
    if (!sucursalInfo) {
      console.error('No sucursal info available for notification');
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        departmentId,
        id: { not: excludeUserId },
        status: 'ACTIVE'
      }
    });

    const notifications = users.map(user => ({
      userId: user.id,
      type,
      title,
      description,
      sucursalId: sucursalInfo.id
    }));

    await prisma.notification.createMany({
      data: notifications
    });
  } catch (error) {
    console.error('Failed to create department notification:', error);
  }
};

module.exports = {
  createNotification,
  createDepartmentNotification
}; 