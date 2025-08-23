const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');
const currentSucursal = require('../lib/currentSucursal');

const router = express.Router();

// Register user
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['USER', 'SUPERVISOR', 'ADMIN']).withMessage('Invalid role'),
  body('departmentId').optional().isString().withMessage('Department ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, departmentId } = req.body;

    let sucursalInfo;
    try {
      sucursalInfo = await currentSucursal.getInfo();
    } catch (error) {
      console.error('Failed to get sucursal info:', error.message);
      return res.status(500).json({
        error: 'System configuration error. Please contact your administrator.',
        details: 'Sucursal not properly configured'
      });
    }

    if (!sucursalInfo) {
      return res.status(500).json({
        error: 'System configuration error. Please contact your administrator.',
        details: 'Sucursal not configured'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        departmentId,
        sucursalId: sucursalInfo.id,
        status: 'PENDING'
      },
      include: {
        department: true,
        supervisor: true
      }
    });

    await createNotification(
      user.id,
      'USER_CREATION',
      'Conta Criada',
      'Sua conta foi criada e está aguardando aprovação.'
    );

    // Notify super admins and department supervisors about new user registration
    try {
      // Get all super admins
      const superAdmins = await prisma.user.findMany({
        where: {
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          sucursalId: sucursalInfo.id
        }
      });

      // Get department supervisors if user has a department
      let departmentSupervisors = [];
      if (departmentId) {
        departmentSupervisors = await prisma.user.findMany({
          where: {
            departmentId: departmentId,
            role: { in: ['SUPERVISOR', 'ADMIN'] },
            status: 'ACTIVE',
            sucursalId: sucursalInfo.id
          }
        });
      }

      // Create notifications for super admins
      for (const admin of superAdmins) {
        await createNotification(
          admin.id,
          'USER_REGISTRATION',
          'New User Registration',
          `A new user ${user.name} has registered and is awaiting approval for ${user.department?.name || 'the system'}.`
        );
      }

      // Create notifications for department supervisors/admins
      for (const supervisor of departmentSupervisors) {
        await createNotification(
          supervisor.id,
          'USER_REGISTRATION',
          'New User Registration in Your Department',
          `A new user ${user.name} has registered for your department (${user.department?.name}) and is awaiting approval.`
        );
      }
    } catch (notificationError) {
      console.error('Failed to send notifications for new user registration:', notificationError);
      // Don't fail the registration if notifications fail
    }

    res.status(201).json({
      message: 'User registered successfully. Pending approval.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department
      }
    });
  } catch (error) {
    await logError('VALIDATION_ERROR', 'User registration failed', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
        supervisor: true,
        sucursal: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account not active. Please wait for approval.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        supervisor: user.supervisor,
        sucursal: user.sucursal
      }
    });
  } catch (error) {
    await logError('AUTHENTICATION_ERROR', 'Login failed', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        department: true,
        supervisor: true,
        sucursal: true
      }
    });

    res.json({ user });
  } catch (error) {
    await logError('AUTHENTICATION_ERROR', 'Get current user failed', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Approve user (Supervisor/Admin only)
router.patch('/approve/:userId', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status === 'ACTIVE') {
      return res.status(400).json({ error: 'User is already active' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
      include: {
        department: true,
        supervisor: true
      }
    });

    // Create root folder for the user
    const rootFolder = await prisma.folder.create({
      data: {
        name: updatedUser.name,
        description: `Root folder for ${updatedUser.name}`,
        userId: updatedUser.id,
        sucursalId: updatedUser.sucursalId
      }
    });

    // Update user's last login
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() }
    });

    await createNotification(
      user.id,
      'USER_CREATION',
      'Conta Aprovada',
      'Sua conta foi aprovada e está agora ativa.'
    );

    res.json({
      message: 'User approved successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
        role: updatedUser.role
      },
      rootFolder
    });
  } catch (error) {
    await logError('AUTHORIZATION_ERROR', 'User approval failed', error);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// Change password
router.patch('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    await logError('AUTHENTICATION_ERROR', 'Password change failed', error);
    res.status(500).json({ error: 'Password change failed' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // If authenticateToken middleware passes, the token is valid
    // req.user contains the decoded user information
    res.json({ 
      valid: true, 
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    await logError('AUTHENTICATION_ERROR', 'Token verification failed', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get user profile endpoint
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        createdAt: true,
        lastLogin: true,
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    await logError('AUTHENTICATION_ERROR', 'Profile fetch failed', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router; 