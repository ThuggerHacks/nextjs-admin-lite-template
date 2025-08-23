const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get all pending users (for requests page)
router.get('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'PENDING' } = req.query;
    const offset = (page - 1) * limit;

    // For requests, we show users with PENDING status
    const where = {
      sucursalId: req.user.sucursalId,
      status: status
    };

    const users = await prisma.user.findMany({
      where,
      include: {
        department: true,
        supervisor: true
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    // Convert users to requests format
    const requests = users.map(user => ({
      id: user.id,
      type: 'account',
      title: `New User Registration: ${user.name}`,
      description: `${user.name} has registered and is waiting for approval to join ${user.department?.name || 'the company'}.`,
      requestedBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department?.name || 'No Department'
      },
      status: user.status === 'ACTIVE' ? 'approved' : user.status === 'INACTIVE' ? 'rejected' : 'pending',
      priority: 'medium',
      createdAt: user.createdAt,
      reviewedAt: null,
      reviewedBy: null,
      response: null
    }));

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get requests failed', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get request by ID
router.get('/:requestId', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: requestId },
      include: {
        department: true,
        supervisor: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Convert user to request format
    const request = {
      id: user.id,
      type: 'account',
      title: `New User Registration: ${user.name}`,
      description: `${user.name} has registered and is waiting for approval to join ${user.department?.name || 'the company'}.`,
      requestedBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department?.name || 'No Department'
      },
      status: user.status === 'ACTIVE' ? 'approved' : user.status === 'INACTIVE' ? 'rejected' : 'pending',
      priority: 'medium',
      createdAt: user.createdAt,
      reviewedAt: null,
      reviewedBy: null,
      response: null
    };

    res.json({ request });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get request failed', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

// Approve request (approve user)
router.post('/:requestId/approve', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: requestId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user status to ACTIVE
    const updatedUser = await prisma.user.update({
      where: { id: requestId },
      data: {
        status: 'ACTIVE'
      },
      include: {
        department: true,
        supervisor: true
      }
    });

    // Create notification for the user
    const notificationData = {
      userId: requestId,
      type: 'SYSTEM_UPDATE',
      title: 'Account Approved',
      message: `Your account has been approved by ${req.user.name}. Welcome to the platform!`,
      data: {
        approvedBy: req.user.name,
        response: response || 'Your account has been successfully approved.'
      }
    };

    // Convert to request format
    const request = {
      id: updatedUser.id,
      type: 'account',
      title: `New User Registration: ${updatedUser.name}`,
      description: `${updatedUser.name} has registered and is waiting for approval to join ${updatedUser.department?.name || 'the company'}.`,
      requestedBy: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        department: updatedUser.department?.name || 'No Department'
      },
      status: 'approved',
      priority: 'medium',
      createdAt: updatedUser.createdAt,
      reviewedAt: new Date(),
      reviewedBy: req.user.name,
      response: response || 'Account approved successfully'
    };

    res.json({ request });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Approve request failed', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// Reject request (reject and remove user)
router.post('/:requestId/reject', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: requestId },
      include: {
        department: true,
        supervisor: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification for the user before deletion
    await createNotification(
      requestId,
      'SYSTEM_UPDATE',
      'Account Rejected',
      `Your account registration has been rejected by ${req.user.name}. ${response || 'Your account registration has been rejected.'}`
    );

    // Delete the user completely when rejected
    await prisma.user.delete({
      where: { id: requestId }
    });

    // Return rejection confirmation
    const request = {
      id: user.id,
      type: 'account',
      title: `New User Registration: ${user.name}`,
      description: `${user.name} has registered and is waiting for approval to join ${user.department?.name || 'the company'}.`,
      requestedBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department?.name || 'No Department'
      },
      status: 'rejected',
      priority: 'medium',
      createdAt: user.createdAt,
      reviewedAt: new Date(),
      reviewedBy: req.user.name,
      response: response || 'Account registration rejected and user removed'
    };

    res.json({ request });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Reject request failed', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// Update request (for response/comments)
router.put('/:requestId', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response, priority } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: requestId },
      include: {
        department: true,
        supervisor: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For now, we'll store response in a comment or note
    // Since we don't have a requests table, we'll just return success
    const request = {
      id: user.id,
      type: 'account',
      title: `New User Registration: ${user.name}`,
      description: `${user.name} has registered and is waiting for approval to join ${user.department?.name || 'the company'}.`,
      requestedBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department?.name || 'No Department'
      },
      status: user.status === 'ACTIVE' ? 'approved' : user.status === 'INACTIVE' ? 'rejected' : 'pending',
      priority: priority || 'medium',
      createdAt: user.createdAt,
      reviewedAt: user.status !== 'PENDING' ? new Date() : null,
      reviewedBy: user.status !== 'PENDING' ? 'Admin' : null,
      response: response || null
    };

    res.json({ request });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update request failed', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

module.exports = router;
