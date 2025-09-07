const prisma = require('../lib/prisma');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');

// Check for expiring items and send notifications
const checkExpiringItems = async () => {
  try {
    console.log('Checking for expiring list items...');
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find items expiring today or tomorrow
    const expiringItems = await prisma.listItem.findMany({
      where: {
        endDate: {
          gte: today,
          lte: tomorrow
        }
      },
      include: {
        list: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`Found ${expiringItems.length} expiring items`);

    for (const item of expiringItems) {
      const isExpiringToday = item.endDate.toDateString() === today.toDateString();
      const isExpiringTomorrow = item.endDate.toDateString() === tomorrow.toDateString();

      let notificationTitle, notificationDescription;

      if (isExpiringToday) {
        notificationTitle = 'Item Expira Hoje';
        notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expira hoje!`;
      } else if (isExpiringTomorrow) {
        notificationTitle = 'Item Expira Amanhã';
        notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expira amanhã!`;
      }

      // Send notification to all list members
      for (const member of item.list.members) {
        try {
          await createNotification(
            member.user.id,
            'EXPIRATION_WARNING',
            notificationTitle,
            notificationDescription,
            item.list.sucursalId
          );
        } catch (error) {
          console.error(`Failed to send notification to user ${member.user.id}:`, error);
        }
      }
    }

    console.log('Expiration check completed');
  } catch (error) {
    await logError('CRON_ERROR', 'Check expiring items failed', error);
    console.error('Error checking expiring items:', error);
  }
};

// Check for expired items and send notifications
const checkExpiredItems = async () => {
  try {
    console.log('Checking for expired list items...');
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Find items that expired today
    const expiredItems = await prisma.listItem.findMany({
      where: {
        endDate: {
          lt: today
        }
      },
      include: {
        list: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`Found ${expiredItems.length} expired items`);

    for (const item of expiredItems) {
      const notificationTitle = 'Item Expirado';
      const notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expirou!`;

      // Send notification to all list members
      for (const member of item.list.members) {
        try {
          await createNotification(
            member.user.id,
            'EXPIRATION_ALERT',
            notificationTitle,
            notificationDescription,
            item.list.sucursalId
          );
        } catch (error) {
          console.error(`Failed to send notification to user ${member.user.id}:`, error);
        }
      }
    }

    console.log('Expired items check completed');
  } catch (error) {
    await logError('CRON_ERROR', 'Check expired items failed', error);
    console.error('Error checking expired items:', error);
  }
};

module.exports = {
  checkExpiringItems,
  checkExpiredItems
};
