const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get all notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, isRead } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      sucursalId: req.user.sucursalId
    };

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: parseInt(offset),
      take: parseInt(limit)
    });

    const total = await prisma.notification.count({ where });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get notifications failed', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Get notification by ID
router.get('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ notification });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get notification failed', error);
    res.status(500).json({ error: 'Failed to get notification' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Mark notification as read failed', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        sucursalId: req.user.sucursalId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Mark all notifications as read failed', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete notification failed', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get unread notification count
router.get('/count/unread', authenticateToken, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        sucursalId: req.user.sucursalId,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get unread notification count failed', error);
    res.status(500).json({ error: 'Failed to get unread notification count' });
  }
});

module.exports = router; 