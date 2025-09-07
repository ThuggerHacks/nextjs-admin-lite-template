const prisma = require('../lib/prisma');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');

// Check for expiring items and send notifications
const checkExpiringItems = async () => {
  try {
    console.log('Checking for expiring list items...');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2); // Start of day after tomorrow
    
    console.log('Checking for items expiring between:', today.toISOString(), 'and', dayAfterTomorrow.toISOString());
    
    // Find items expiring in the next 2 days (today, tomorrow, day after tomorrow)
    const expiringItems = await prisma.listItem.findMany({
      where: {
        endDate: {
          gte: today,
          lt: dayAfterTomorrow
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
      const itemEndDate = new Date(item.endDate);
      const itemEndDateOnly = new Date(itemEndDate.getFullYear(), itemEndDate.getMonth(), itemEndDate.getDate());
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const isExpiringToday = itemEndDateOnly.getTime() === today.getTime();
      const isExpiringTomorrow = itemEndDateOnly.getTime() === tomorrow.getTime();
      const isExpiringIn2Days = itemEndDateOnly.getTime() === dayAfterTomorrow.getTime();

      console.log(`Item: ${item.name}, EndDate: ${itemEndDateOnly.toISOString()}, Today: ${today.toISOString()}, Tomorrow: ${tomorrow.toISOString()}, DayAfterTomorrow: ${dayAfterTomorrow.toISOString()}`);
      console.log(`IsToday: ${isExpiringToday}, IsTomorrow: ${isExpiringTomorrow}, IsIn2Days: ${isExpiringIn2Days}`);

      let notificationTitle, notificationDescription;

      if (isExpiringToday) {
        notificationTitle = 'Item Expira Hoje';
        notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expira hoje!`;
      } else if (isExpiringTomorrow) {
        notificationTitle = 'Item Expira Amanhã';
        notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expira amanhã!`;
      } else if (isExpiringIn2Days) {
        notificationTitle = 'Item Expira em 2 Dias';
        notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expira em 2 dias!`;
      } else {
        // Skip items that don't match our criteria
        continue;
      }

      // Send notification to all list members
      for (const member of item.list.members) {
        try {
          // Check if notification was already sent today for this item
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: member.user.id,
              type: 'EXPIRATION_WARNING',
              description: notificationDescription,
              createdAt: {
                gte: startOfDay,
                lt: endOfDay
              }
            }
          });

          if (!existingNotification) {
            console.log(`Sending notification to user ${member.user.name} (${member.user.email}) for item: ${item.name}`);
            await createNotification(
              member.user.id,
              'EXPIRATION_WARNING',
              notificationTitle,
              notificationDescription,
              item.list.sucursalId
            );
          } else {
            console.log(`Notification already sent today to user ${member.user.name} for item: ${item.name}`);
          }
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
          // Check if notification was already sent today for this item
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: member.user.id,
              type: 'EXPIRATION_ALERT',
              description: notificationDescription,
              createdAt: {
                gte: startOfDay,
                lt: endOfDay
              }
            }
          });

          if (!existingNotification) {
            console.log(`Sending expired notification to user ${member.user.name} (${member.user.email}) for item: ${item.name}`);
            await createNotification(
              member.user.id,
              'EXPIRATION_ALERT',
              notificationTitle,
              notificationDescription,
              item.list.sucursalId
            );
          } else {
            console.log(`Expired notification already sent today to user ${member.user.name} for item: ${item.name}`);
          }
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

// Manual trigger for testing
const triggerExpirationCheck = async () => {
  console.log('Manually triggering expiration check...');
  await checkExpiringItems();
  await checkExpiredItems();
};

module.exports = {
  checkExpiringItems,
  checkExpiredItems,
  triggerExpirationCheck
};
