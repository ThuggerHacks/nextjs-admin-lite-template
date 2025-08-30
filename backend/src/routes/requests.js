const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get all pending users (for requests page)
router.get('/', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN',]), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // For requests, we show users with PENDING or INACTIVE status
    let where = {
      sucursalId: req.user.sucursalId,
    };

    // Department-based filtering based on user role
    if (req.user.role === 'SUPERVISOR') {
      // Supervisors only see users from their department
      where.departmentId = req.user.departmentId;
    } else if (req.user.role === 'ADMIN') {
      // Admins only see users from their department (if they have one)
      if (req.user.departmentId) {
        where.departmentId = req.user.departmentId;
      }
    }
    // SUPER_ADMIN sees all users (no additional filtering)
    
    // If a specific departmentId is requested and user has permission, use it
    if (req.query.departmentId && req.user.role === 'SUPER_ADMIN') {
      where.departmentId = req.query.departmentId;
    }

    // If status is specified, filter by it, otherwise show both pending and inactive
    if (status && status !== 'all') {
      if (status === 'pending') {
        where.status = 'PENDING';
      } else if (status === 'inactive') {
        where.status = 'INACTIVE';
      } else if (status === 'approved') {
        where.status = 'ACTIVE';
      }
    } else {
      // Show both pending and inactive users by default
      where.status = {
        in: ['PENDING', 'INACTIVE']
      };
    }

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
      status: user.status === 'ACTIVE' ? 'approved' : user.status === 'INACTIVE' ? 'inactive' : 'pending',
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
router.post('/:requestId/approve', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN','SUPERVISOR']), async (req, res) => {
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
router.post('/:requestId/reject', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN','SUPERVISOR']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response } = req.body;

    console.log('Rejecting request for user:', requestId);

    const user = await prisma.user.findUnique({
      where: { id: requestId },
      include: {
        department: true,
        supervisor: true
      }
    });

    if (!user) {
      console.log('User not found for rejection:', requestId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user for rejection:', user.email);

    // First, try to deactivate the user instead of deleting
    try {
      await prisma.user.update({
        where: { id: requestId },
        data: { 
          status: 'REJECTED',
          updatedAt: new Date()
        }
      });
      console.log('User status updated to REJECTED');
    } catch (updateError) {
      console.error('Failed to update user status:', updateError);
      // If update fails, try to delete
      try {
        await prisma.user.delete({
          where: { id: requestId }
        });
        console.log('User deleted successfully');
      } catch (deleteError) {
        console.error('Failed to delete user:', deleteError);
        throw new Error(`Failed to reject user: ${deleteError.message}`);
      }
    }

    // Try to create notification (but don't fail if it doesn't work)
    try {
      await createNotification(
        requestId,
        'SYSTEM_UPDATE',
        'Account Rejected',
        `Your account registration has been rejected by ${req.user.name}. ${response || 'Your account registration has been rejected.'}`
      );
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Continue with rejection even if notification fails
    }

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

    console.log('Request rejection completed successfully');
    res.json({ request });
  } catch (error) {
    console.error('Reject request failed:', error);
    await logError('DATABASE_ERROR', 'Reject request failed', error);
    res.status(500).json({ 
      error: 'Failed to reject request',
      details: error.message 
    });
  }
});

// Update request (for response/comments)
router.put('/:requestId', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, response, priority } = req.body;

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

    // Update user status based on request status
    let userStatus = user.status;
    if (status === 'approved') {
      userStatus = 'ACTIVE';
    } else if (status === 'rejected') {
      userStatus = 'INACTIVE';
    } else if (status === 'pending') {
      userStatus = 'PENDING';
    }

    // Update user status if it changed
    if (userStatus !== user.status) {
      await prisma.user.update({
        where: { id: requestId },
        data: { status: userStatus }
      });
    }

    // If rejected, delete the user
    if (status === 'rejected') {
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
    } else if (status === 'approved') {
      // Create notification for approved user
      await createNotification(
        requestId,
        'SYSTEM_UPDATE',
        'Account Approved',
        `Your account has been approved by ${req.user.name}. Welcome to the platform!`
      );
    }

    // Return updated request data
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
      status: status,
      priority: priority || 'medium',
      createdAt: user.createdAt,
      reviewedAt: status !== 'pending' ? new Date() : null,
      reviewedBy: status !== 'pending' ? req.user.name : null,
      response: response || null
    };

    res.json({ request });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update request failed', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

module.exports = router;
