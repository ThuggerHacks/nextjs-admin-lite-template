const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');
const currentSucursal = require('../lib/currentSucursal');
const upload = require('../middleware/upload'); // Added for avatar upload
const userFileUpload = require('../middleware/userFileUpload'); // Added for user file upload
const path = require('path'); // Added for path manipulation

const router = express.Router();

// Get all users (Admin/Supervisor only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, departmentId } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      sucursalId: req.user.sucursalId
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

    if (role) where.role = role;
    if (status) where.status = status;
    // Only allow departmentId override for SUPER_ADMIN
    if (departmentId && req.user.role === 'SUPER_ADMIN') {
      where.departmentId = departmentId;
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

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get users failed', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user profile (current user)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        department: true,
        supervisor: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get profile failed', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile (current user)
router.put('/profile', authenticateToken, [
  body('name').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    return typeof value === 'string' && value.trim().length > 0;
  }).withMessage('Name cannot be empty'),
  body('email').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }).withMessage('Valid email is required'),
  body('phone').optional().custom((value) => {
    if (value === null || value === undefined) return true;
    return typeof value === 'string';
  }).withMessage('Phone must be a string or null'),
  body('address').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    return typeof value === 'string';
  }).withMessage('Address must be a string'),
  body('departmentId').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    return typeof value === 'string';
  }).withMessage('Department ID must be a string'),
  body('avatar').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    return typeof value === 'string';
  }).withMessage('Avatar must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, address, departmentId, avatar } = req.body;
    const userId = req.user.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });
        if (emailExists) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      updateData.email = email;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (departmentId !== undefined) updateData.departmentId = departmentId;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        department: true,
        supervisor: true
      }
    });

    await createNotification(
      userId,
      'SYSTEM_UPDATE',
      'Perfil Atualizado',
      'Seu perfil foi atualizado com sucesso.'
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update profile failed', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password (current user)
router.put('/profile/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bcrypt = require('bcryptjs');

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    await createNotification(
      userId,
      'SYSTEM_UPDATE',
      'Senha Alterada',
      'Sua senha foi alterada com sucesso.'
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Change password failed', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Upload avatar (current user)
router.post('/profile/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const avatarUrl = `/uploads/users/${req.file.filename}`;

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      include: {
        department: true,
        supervisor: true
      }
    });

    await createNotification(
      userId,
      'SYSTEM_UPDATE',
      'Avatar Atualizado',
      'Seu avatar foi atualizado com sucesso.'
    );

    res.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Upload avatar failed', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        supervisor: true,
        subordinates: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.id !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get user failed', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Create user (Admin/Supervisor only)
router.post('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', ]), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['USER', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']).withMessage('Invalid role'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PENDING']).withMessage('Invalid status'),
  body('departmentId').notEmpty().withMessage('Department is required'),
  body('phone').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    return typeof value === 'string';
  }).withMessage('Phone must be a string'),
  body('isDepartmentAdmin').optional().isBoolean().withMessage('isDepartmentAdmin must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, status, departmentId, phone, isDepartmentAdmin } = req.body;
    const bcrypt = require('bcryptjs');

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password if provided, otherwise generate random one
    const userPassword = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'USER',
      status: status || 'ACTIVE',
      departmentId,
      phone,
      sucursalId: req.user.sucursalId
    };

    const newUser = await prisma.user.create({
      data: userData,
      include: {
        department: true,
        supervisor: true
      }
    });

    // Handle department admin assignment
    if (isDepartmentAdmin && departmentId) {
      await prisma.department.update({
        where: { id: departmentId },
        data: { supervisorId: newUser.id }
      });
    }

    // Create root folder for user
    await prisma.folder.create({
      data: {
        name: `${name}'s Files`,
        userId: newUser.id,
        sucursalId: req.user.sucursalId,
        parentId: null
      }
    });

    await createNotification(
      newUser.id,
      'USER_CREATION',
      'Account Created',
      `Your account has been created by ${req.user.name}. Welcome to the platform!`
    );

    // Notify super admins and department supervisors about new user creation
    try {
      // Get all super admins
      const superAdmins = await prisma.user.findMany({
        where: {
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          sucursalId: req.user.sucursalId
        }
      });

      // Get department supervisors
      const departmentSupervisors = await prisma.user.findMany({
        where: {
          departmentId: departmentId,
          role: { in: ['SUPERVISOR', 'ADMIN'] },
          status: 'ACTIVE',
          sucursalId: req.user.sucursalId,
          id: { not: newUser.id } // Don't notify the user themselves
        }
      });

      // Create notifications for super admins
      for (const admin of superAdmins) {
        await createNotification(
          admin.id,
          'USER_REGISTRATION',
          'New User Created',
          `A new user ${newUser.name} has been created in ${newUser.department?.name || 'the system'} and is awaiting approval.`
        );
      }

      // Create notifications for department supervisors/admins
      for (const supervisor of departmentSupervisors) {
        await createNotification(
          supervisor.id,
          'USER_REGISTRATION',
          'New User in Your Department',
          `A new user ${newUser.name} has been created in your department (${newUser.department?.name}) and is awaiting approval.`
        );
      }
    } catch (notificationError) {
      console.error('Failed to send notifications for new user:', notificationError);
      // Don't fail the user creation if notifications fail
    }

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      tempPassword: password ? undefined : userPassword
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create user failed', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:userId', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['USER', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']).withMessage('Invalid role'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PENDING']).withMessage('Invalid status'),
  body('departmentId').optional().isString().withMessage('Department ID must be a string'),
  body('supervisorId').optional().isString().withMessage('Supervisor ID must be a string'),
  body('phone').optional().custom((value) => {
    if (value === null || value === undefined) return true;
    return typeof value === 'string';
  }).withMessage('Phone must be a string or null'),
  body('isDepartmentAdmin').optional().isBoolean().withMessage('isDepartmentAdmin must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { name, email, role, status, departmentId, supervisorId, phone, isDepartmentAdmin } = req.body;

    if (userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });
        if (emailExists) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      updateData.email = email;
    }
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (departmentId !== undefined) updateData.departmentId = departmentId;
    if (supervisorId !== undefined) updateData.supervisorId = supervisorId;
    if (phone !== undefined) updateData.phone = phone;

    // Handle department admin assignment
    if (isDepartmentAdmin !== undefined) {
      const userDepartmentId = departmentId || existingUser.departmentId;
      
      if (isDepartmentAdmin && userDepartmentId) {
        // Verify department exists
        const department = await prisma.department.findUnique({
          where: { id: userDepartmentId }
        });
        
        if (!department) {
          return res.status(400).json({ error: 'Department not found' });
        }
        
        // Make user supervisor of their department
        await prisma.department.update({
          where: { id: userDepartmentId },
          data: { 
            supervisors: {
              connect: { id: userId }
            }
          }
        });
        
        // Also update user role to SUPERVISOR if not already ADMIN or SUPER_ADMIN
        if (!['ADMIN', 'SUPER_ADMIN'].includes(existingUser.role)) {
          updateData.role = 'SUPERVISOR';
        }
      } else if (!isDepartmentAdmin) {
        // Remove as supervisor if they were one
        const department = await prisma.department.findFirst({
          where: { 
            supervisors: {
              some: { id: userId }
            }
          }
        });
        if (department) {
          await prisma.department.update({
            where: { id: department.id },
            data: { 
              supervisors: {
                disconnect: { id: userId }
              }
            }
          });
        }
        
        // If user was only a supervisor (not admin), demote to USER
        if (existingUser.role === 'SUPERVISOR') {
          updateData.role = 'USER';
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        department: true,
        supervisor: true
      }
    });

    await createNotification(
      userId,
      'SYSTEM_UPDATE',
      'Perfil Atualizado',
      'Seu perfil foi atualizado.'
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('User update error details:', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
      body: req.body,
      user: req.user?.id
    });
    await logError('DATABASE_ERROR', 'Update user failed', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// Delete user (Admin/Supervisor only)
router.delete('/:userId', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting super admins unless requester is also super admin
    if (user.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot delete super admin user' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete user failed', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get users by department
router.get('/department/:departmentId', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { departmentId } = req.params;
    const users = await prisma.user.findMany({
      where: {
        departmentId,
        sucursalId: req.user.sucursalId
      },
      include: {
        department: true,
        supervisor: true
      }
    });

    res.json({ users });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get department users failed', error);
    res.status(500).json({ error: 'Failed to get department users' });
  }
});

// Promote user to super admin
router.post('/:userId/promote-to-superadmin', authenticateToken, requireRole(['SUPER_ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'User is already a super admin' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'SUPER_ADMIN' },
      include: {
        department: true,
        supervisor: true
      }
    });

    await createNotification(
      userId,
      'SYSTEM_UPDATE',
      'Promoted to Super Admin',
      'You have been promoted to Super Admin role.'
    );

    res.json({
      message: 'User promoted to super admin successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Super admin promotion error details:', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
      user: req.user?.id
    });
    await logError('DATABASE_ERROR', 'Promote to super admin failed', error);
    res.status(500).json({ error: 'Failed to promote user to super admin', details: error.message });
  }
});

// Reset user password
router.post('/:userId/reset-password', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const { userId } = req.params;
    const bcrypt = require('bcryptjs');

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    await createNotification(
      userId,
      'SYSTEM_UPDATE',
      'Password Reset',
      `Your password has been reset. New temporary password: ${tempPassword}`
    );

    res.json({
      message: 'Password reset successfully',
      tempPassword
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Reset password failed', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get user files
router.get('/:userId/files', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER','SUPERVISOR','USER']), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's root folder
    const rootFolder = await prisma.folder.findFirst({
      where: {
        userId: userId,
        parentId: null
      }
    });

    if (!rootFolder) {
      // Create root folder for user if it doesn't exist
      const newRootFolder = await prisma.folder.create({
        data: {
          name: `${user.name}'s Files`,
          description: `Root folder for ${user.name}`,
          userId: userId,
          sucursalId: user.sucursalId,
          parentId: null
        }
      });
      
      return res.json({ files: [], folders: [newRootFolder], rootFolder: newRootFolder });
    }

    // Get all folders for the user first
    const folders = await prisma.folder.findMany({
      where: { userId: userId },
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            files: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all files that belong to any of the user's folders OR are directly associated with the user
    const folderIds = folders.map(folder => folder.id);
    console.log('🔍 User folders:', folderIds);
    
    // First, let's check all files for this user to see what's in the database
    const allUserFiles = await prisma.file.findMany({
      where: { userId: userId },
      select: { id: true, name: true, folderId: true, createdAt: true }
    });
    console.log('🔍 All files for user:', allUserFiles);
    
    const files = await prisma.file.findMany({
      where: {
        OR: [
          {
            folderId: {
              in: folderIds
            }
          },
          {
            userId: userId,
            folderId: null // Root-level files
          }
        ]
      },
      include: {
        folder: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 Found files:', files.length);
    console.log('🔍 Files data:', files);

    res.json({ files, folders, rootFolder });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get user files failed', error);
    res.status(500).json({ error: 'Failed to get user files' });
  }
});

// Export users to CSV
router.get('/export-csv', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { sucursalId: req.user.sucursalId },
      include: {
        department: true,
        supervisor: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert to CSV format
    const csvData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department?.name || 'N/A',
      supervisor: user.supervisor?.name || 'N/A',
      phone: user.phone || 'N/A',
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'Never'
    }));

    res.json({ users: csvData });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Export users failed', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
});

// Create folder for specific user
router.post('/:userId/folders', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'SUPERVISOR']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, description = '', parentId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has permission to create folders for this user
    if (req.user.role === 'SUPERVISOR' && req.user.departmentId !== user.departmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if folder already exists
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: userId,
        name: name,
        parentId: parentId || null
      }
    });

    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists in this location' });
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        parentId: parentId || null,
        userId: userId,
        sucursalId: user.sucursalId
      },
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            files: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create user folder failed', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Upload file for specific user
router.post('/:userId/files', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'SUPERVISOR']), userFileUpload.single('file'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { folderId, description = '' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has permission to upload files for this user
    if (req.user.role === 'SUPERVISOR' && req.user.departmentId !== user.departmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 50MB limit' });
    }

    // Create API URL for database storage
    const serverUrl = req.protocol + '://' + req.get('host');
    const apiUrl = `${serverUrl}/api/uploads/users/${userId}/${file.filename}`;

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        name: file.originalname,
        description,
        url: apiUrl,
        size: file.size,
        type: path.extname(file.originalname).substring(1) || 'unknown',
        mimeType: file.mimetype,
        isPublic: false,
        folderId: folderId || null,
        userId: userId,
        sucursalId: user.sucursalId
      },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileRecord
    });
  } catch (error) {
    console.error('File upload error details:', error);
    await logError('DATABASE_ERROR', 'Upload user file failed', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Chunked upload session for user files
router.post('/:userId/upload-session', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'SUPERVISOR']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { fileName, fileSize, folderId } = req.body;

    if (!fileName || !fileSize) {
      return res.status(400).json({ error: 'fileName and fileSize are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has permission to upload files for this user
    if (req.user.role === 'SUPERVISOR' && req.user.departmentId !== user.departmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create upload session
    const sessionId = `user_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create temporary directory for chunks
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'users', userId, 'chunks', sessionId);
    const fs = require('fs');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Store session info (in production, you might want to use Redis or database)
    global.uploadSessions = global.uploadSessions || {};
    global.uploadSessions[sessionId] = {
      userId,
      fileName,
      fileSize: parseInt(fileSize),
      folderId: folderId || null,
      chunks: [],
      createdAt: new Date(),
      uploadDir,
      totalChunks: Math.ceil(parseInt(fileSize) / (5 * 1024 * 1024)) // 5MB chunks
    };

    res.json({
      sessionId,
      message: 'Upload session created successfully',
      totalChunks: global.uploadSessions[sessionId].totalChunks
    });
  } catch (error) {
    console.error('Create upload session error:', error);
    await logError('DATABASE_ERROR', 'Create upload session failed', error);
    res.status(500).json({ error: 'Failed to create upload session' });
  }
});

// Upload chunk for user files
router.post('/:userId/upload-chunk', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'SUPERVISOR']), userFileUpload.single('chunk'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId, chunkIndex, totalChunks } = req.body;
    const chunkFile = req.file;

    if (!sessionId || chunkIndex === undefined || !totalChunks || !chunkFile) {
      return res.status(400).json({ error: 'sessionId, chunkIndex, totalChunks, and chunk are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has permission to upload files for this user
    if (req.user.role === 'SUPERVISOR' && req.user.departmentId !== user.departmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate session
    if (!global.uploadSessions || !global.uploadSessions[sessionId]) {
      return res.status(400).json({ error: 'Invalid upload session' });
    }

    const session = global.uploadSessions[sessionId];
    if (session.userId !== userId) {
      return res.status(400).json({ error: 'Session user mismatch' });
    }

    // The chunk file is already saved to disk by multer, so we just need to move it to the session directory
    const chunkPath = path.join(session.uploadDir, `chunk_${chunkIndex}`);
    
    try {
      // Move the uploaded chunk file to the session directory
      const fs = require('fs');
      await fs.promises.rename(chunkFile.path, chunkPath);
      console.log('Chunk file moved to session directory:', chunkPath);
    } catch (moveError) {
      console.error('Failed to move chunk file:', moveError);
      // Try to copy instead if rename fails
      try {
        const fs = require('fs');
        await fs.promises.copyFile(chunkFile.path, chunkPath);
        await fs.promises.unlink(chunkFile.path); // Clean up original
        console.log('Chunk file copied to session directory:', chunkPath);
      } catch (copyError) {
        console.error('Failed to copy chunk file:', copyError);
        console.error('Chunk file details:', {
          originalPath: chunkFile.path,
          targetPath: chunkPath,
          chunkSize: chunkFile.size,
          sessionId,
          chunkIndex
        });
        return res.status(500).json({ error: 'Failed to save chunk file' });
      }
    }

    // Update session
    session.chunks[parseInt(chunkIndex)] = chunkPath;

    res.json({
      chunkIndex: parseInt(chunkIndex),
      uploadedChunks: session.chunks.filter(Boolean).length,
      totalChunks: totalChunks
    });
  } catch (error) {
    console.error('Upload chunk error:', error);
    await logError('DATABASE_ERROR', 'Upload chunk failed', error);
    res.status(500).json({ error: 'Failed to save chunk file' });
  }
});

// Complete chunked upload for user files
router.post('/:userId/upload-complete', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'SUPERVISOR']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId, description = '' } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has permission to upload files for this user
    if (req.user.role === 'SUPERVISOR' && req.user.departmentId !== user.departmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate session
    if (!global.uploadSessions || !global.uploadSessions[sessionId]) {
      return res.status(400).json({ error: 'Invalid upload session' });
    }

    const session = global.uploadSessions[sessionId];
    if (session.userId !== userId) {
      return res.status(400).json({ error: 'Session user mismatch' });
    }

    // Check if all chunks are present
    const expectedChunks = session.totalChunks;
    if (session.chunks.filter(Boolean).length !== expectedChunks) {
      return res.status(400).json({ 
        error: 'Not all chunks received', 
        uploaded: session.chunks.filter(Boolean).length,
        total: expectedChunks
      });
    }

    // Combine chunks into final file
    const fs = require('fs');
    const combinedFileName = `${Date.now()}-${session.fileName}`;
    const finalFilePath = path.join(session.uploadDir, combinedFileName);
    const finalFileStream = fs.createWriteStream(finalFilePath);

    // Combine chunks in order
    for (let i = 0; i < expectedChunks; i++) {
      const chunkPath = session.chunks[i];
      if (!chunkPath || !fs.existsSync(chunkPath)) {
        return res.status(400).json({ error: `Chunk ${i} not found` });
      }
      
      const chunkData = await fs.promises.readFile(chunkPath);
      finalFileStream.write(chunkData);
    }
    
    finalFileStream.end();

    // Wait for file to be written
    await new Promise((resolve, reject) => {
      finalFileStream.on('finish', resolve);
      finalFileStream.on('error', reject);
    });

    // Move final file to user uploads directory
    const userUploadDir = path.join(__dirname, '..', '..', 'uploads', 'users', userId);
    const finalUserPath = path.join(userUploadDir, combinedFileName);
    
    // Ensure unique filename
    let counter = 1;
    let uniquePath = finalUserPath;
    while (fs.existsSync(uniquePath)) {
      const ext = path.extname(combinedFileName);
      const name = path.basename(combinedFileName, ext);
      uniquePath = path.join(userUploadDir, `${name}_${counter}${ext}`);
      counter++;
    }

    fs.renameSync(finalFilePath, uniquePath);
    const finalFileName = path.basename(uniquePath);

    // Create API URL for database storage
    const serverUrl = req.protocol + '://' + req.get('host');
    const apiUrl = `${serverUrl}/api/uploads/users/${userId}/${finalFileName}`;

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        name: session.fileName, // Keep original filename for display
        description,
        url: apiUrl,
        size: session.fileSize,
        type: path.extname(session.fileName).substring(1) || 'unknown',
        mimeType: 'application/octet-stream', // Will be updated when file is processed
        isPublic: false,
        folderId: session.folderId,
        userId: userId,
        sucursalId: user.sucursalId
      },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Clean up session
    delete global.uploadSessions[sessionId];
    try {
      await fs.promises.rm(session.uploadDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('Failed to cleanup session directory:', cleanupError);
    }

    res.json({
      message: 'File uploaded successfully',
      file: fileRecord
    });
  } catch (error) {
    console.error('Complete upload error:', error);
    await logError('DATABASE_ERROR', 'Complete upload failed', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});


module.exports = router; 