const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification, createDepartmentNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the directory exists
    const uploadDir = path.join(__dirname, '../../uploads/goals/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common document and image types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document and image files are allowed'));
    }
  }
});

// Get all goals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, departmentId, assignedToMe, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      sucursalId: req.user.sucursalId
    };

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (assignedToMe === 'true') {
      where.assignments = {
        some: {
          userId: req.user.id
        }
      };
    } else if (['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      if (req.user.role === 'SUPERVISOR' && req.user.departmentId) {
        // Supervisors can see goals in their department OR goals shared with them
        where.OR = [
          { departmentId: req.user.departmentId },
          {
            shares: {
              some: {
                sharedWithId: req.user.id
              }
            }
          }
        ];
      } else if (req.user.role === 'ADMIN') {
        // Admins can see goals in their department OR goals shared with them
        where.OR = [
          { departmentId: req.user.departmentId },
          {
            assignments: {
              some: {
                user: {
                  departmentId: req.user.departmentId
                }
              }
            }
          },
          {
            shares: {
              some: {
                sharedWithId: req.user.id
              }
            }
          }
        ];
      } else if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DEVELOPER') {
        // Super admins can see:
        // 1. Goals they created (published or not)
        // 2. Goals shared with them
        where.OR = [
          {
            createdById: req.user.id
          },
          {
            shares: {
              some: {
                sharedWithId: req.user.id
              }
            }
          }
        ];
      }
    } else {
      // Regular users (USER role) can see:
      // 1. Published goals assigned to them
      // 2. Goals shared with them
      // Note: Users don't create goals, only supervisors and above do
      where.OR = [
        {
          AND: [
            { isPublished: true },
            {
              assignments: {
                some: {
                  userId: req.user.id
                }
              }
            }
          ]
        },
        {
          shares: {
            some: {
              sharedWithId: req.user.id
            }
          }
        }
      ];
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        reports: {
          include: {
            submittedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            files: {
              include: {
                file: true
              }
            }
          }
        },
        shares: {
          include: {
            sharedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            sharedWith: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            assignments: true,
            reports: true
          }
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.goal.count({ where });

    // Debug: Log goals with shares
    const goalsWithShares = goals.filter(g => g.shares && g.shares.length > 0);
    console.log('Goals with shares found:', goalsWithShares.length);
    console.log('Sample goal with shares:', goalsWithShares[0]);

    res.json({
      goals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get goals error:', error);
    await logError('DATABASE_ERROR', 'Get goals failed', error);
    res.status(500).json({ error: 'Failed to get goals', details: error.message });
  }
});

// Get goal by ID
router.get('/:goalId', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        reports: {
          include: {
            submittedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            files: {
              include: {
                file: true
              }
            }
          }
        }
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const isAssigned = goal.assignments.some(assignment => assignment.userId === req.user.id);
    const canAccess = isAssigned || ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ goal });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get goal failed', error);
    res.status(500).json({ error: 'Failed to get goal' });
  }
});

// Create goal (Supervisor/Admin only)
router.post('/', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), [
  body('name').notEmpty().withMessage('Goal name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('timeline').optional().isISO8601().withMessage('Timeline must be a valid date'),
  body('departmentId').notEmpty().withMessage('Department ID is required'),
  body('userIds').isArray().withMessage('User IDs must be an array'),
  body('isDepartmentGoal').optional().isBoolean().withMessage('isDepartmentGoal must be a boolean'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, timeline, departmentId, userIds, isDepartmentGoal, priority } = req.body;

    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    if (department.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'SUPERVISOR' && department.id !== req.user.departmentId) {
      return res.status(403).json({ error: 'Can only create goals for your department' });
    }

    // If this is a department goal, automatically assign all users from the department
    let finalUserIds = userIds;
    if (isDepartmentGoal) {
      const departmentUsers = await prisma.user.findMany({
        where: {
          departmentId: departmentId,
          status: 'ACTIVE'
        },
        select: { id: true }
      });
      finalUserIds = departmentUsers.map(user => user.id);
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(timeline || endDate),
        priority: priority || 'MEDIUM',
        status: 'PUBLISHED', // Set to published by default
        departmentId,
        createdById: req.user.id,
        sucursalId: req.user.sucursalId,
        assignments: {
          create: finalUserIds.map(userId => ({
            userId
          }))
        }
      },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Send notifications to all assigned users
    for (const userId of finalUserIds) {
      await createNotification(
        userId,
        'GOAL_ASSIGNED',
        'Nova Meta Atribuída',
        `Você foi atribuído à meta: "${goal.name}"`
      );
    }

    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create goal failed', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update goal
router.put('/:goalId', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), [
  body('name').optional().notEmpty().withMessage('Goal name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('timeline').optional().isISO8601().withMessage('Timeline must be a valid date'),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH'),
  body('userIds').optional().isArray().withMessage('User IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goalId } = req.params;
    const { name, description, startDate, endDate, timeline, status, priority, userIds } = req.body;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        department: true,
        assignments: true
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'SUPERVISOR' && goal.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Can only update goals for your department' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (timeline) updateData.endDate = new Date(timeline);
    if (status) updateData.status = status;
    if (priority) {
      updateData.priority = priority;
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (userIds) {
      await prisma.goalAssignment.deleteMany({
        where: { goalId }
      });

      await prisma.goalAssignment.createMany({
        data: userIds.map(userId => ({
          goalId,
          userId
        }))
      });

      for (const userId of userIds) {
        await createNotification(
          userId,
          'GOAL_ASSIGNED',
          'Atribuição de Meta Atualizada',
          `Você foi atribuído à meta: "${updatedGoal.name}"`
        );
      }
    }

    res.json({
      message: 'Goal updated successfully',
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    await logError('DATABASE_ERROR', 'Update goal failed', error);
    res.status(500).json({ error: 'Failed to update goal', details: error.message });
  }
});

// Delete goal
router.delete('/:goalId', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'SUPERVISOR' && goal.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Can only delete goals for your department' });
    }

    await prisma.goal.delete({
      where: { id: goalId }
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete goal failed', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Assign users to goal
router.post('/:goalId/assign', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), [
  body('userIds').isArray().withMessage('User IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goalId } = req.params;
    const { userIds } = req.body;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        department: true
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'SUPERVISOR' && goal.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Can only assign users to goals in your department' });
    }

    await prisma.goalAssignment.createMany({
      data: userIds.map(userId => ({
        goalId,
        userId
      })),
      skipDuplicates: true
    });

    for (const userId of userIds) {
      await createNotification(
        userId,
        'GOAL_ASSIGNED',
        'Goal Assigned',
        `You have been assigned to goal: "${goal.name}"`
      );
    }

    res.json({ message: 'Users assigned to goal successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Assign users to goal failed', error);
    res.status(500).json({ error: 'Failed to assign users to goal' });
  }
});

// Unassign user from goal
router.delete('/:goalId/assign/:userId', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { goalId, userId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'SUPERVISOR' && goal.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Can only unassign users from goals in your department' });
    }

    await prisma.goalAssignment.deleteMany({
      where: {
        goalId,
        userId
      }
    });

    res.json({ message: 'User unassigned from goal successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Unassign user from goal failed', error);
    res.status(500).json({ error: 'Failed to unassign user from goal' });
  }
});

// Get goal reports
router.get('/:goalId/reports', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Verify goal exists and user has access
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        assignments: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user is assigned to this goal or is admin/supervisor
    const isAssigned = goal.assignments.length > 0;
    const isAdminOrSupervisor = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);
    
    if (!isAssigned && !isAdminOrSupervisor) {
      return res.status(403).json({ error: 'You can only view reports for goals assigned to you' });
    }

    // Get goal reports
    const reports = await prisma.goalReport.findMany({
      where: { goalId },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        files: {
          include: {
            file: true
          }
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.goalReport.count({ where: { goalId } });

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get goal reports error:', error);
    await logError('DATABASE_ERROR', 'Get goal reports failed', error);
    res.status(500).json({ error: 'Failed to get goal reports', details: error.message });
  }
});

// Create goal report (general endpoint for frontend compatibility)
router.post('/:goalId/reports', authenticateToken, [
  body('title').notEmpty().withMessage('Report title is required'),
  body('description').notEmpty().withMessage('Report description is required'),
  body('isCompletion').optional().isBoolean().withMessage('Is completion must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goalId } = req.params;
    const { title, description, isCompletion } = req.body;

    // Verify goal exists and user has access
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        assignments: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user is assigned to this goal or is admin/supervisor
    const isAssigned = goal.assignments.length > 0;
    const isAdminOrSupervisor = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);
    
    if (!isAssigned && !isAdminOrSupervisor) {
      return res.status(403).json({ error: 'You can only create reports for goals assigned to you' });
    }

    // Create the goal report using the GoalReport model
    const reportData = {
      title,
      description,
      goalId,
      submittedById: req.user.id,
      isCompletion: isCompletion === 'true' || isCompletion === true,
      status: 'PENDING'
    };

    const report = await prisma.goalReport.create({
      data: reportData,
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send notification to goal creator and assigned users
    const goalWithAssignments = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        createdBy: true,
        assignments: {
          include: { user: true }
        }
      }
    });

    if (goalWithAssignments) {
      // Notify goal creator
      if (goalWithAssignments.createdById !== req.user.id) {
        await createNotification(
          goalWithAssignments.createdById,
          'GOAL_REPORT_SUBMITTED',
          'Goal Report Submitted',
          `A report has been submitted for goal: "${goalWithAssignments.name}"`
        );
      }

      // Notify other assigned users
      for (const assignment of goalWithAssignments.assignments) {
        if (assignment.userId !== req.user.id) {
          await createNotification(
            assignment.userId,
            'GOAL_REPORT_SUBMITTED',
            'Goal Report Submitted',
            `A report has been submitted for goal: "${goalWithAssignments.name}"`
          );
        }
      }
    }

    res.status(201).json({
      message: 'Report created successfully',
      report
    });
  } catch (error) {
    console.error('Goal report creation error:', error);
    await logError('DATABASE_ERROR', 'Create goal report failed', error);
    res.status(500).json({ error: 'Failed to create goal report', details: error.message });
  }
});

// Upload goal report with files
router.post('/:goalId/reports/upload', authenticateToken, (req, res, next) => {
  upload.array('files', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files. Maximum is 5 files.' });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected file field.' });
      }
      return res.status(400).json({ error: 'File upload error', details: err.message });
    } else if (err) {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    }
    next();
  });
}, [
  body('title').notEmpty().withMessage('Report title is required'),
  body('description').notEmpty().withMessage('Report description is required'),
  body('isCompletion').optional().isBoolean().withMessage('Is completion must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goalId } = req.params;
    const { title, description, isCompletion } = req.body;
    const files = req.files || [];
    
    console.log('Upload endpoint called with:', {
      goalId,
      title,
      description,
      isCompletion,
      filesCount: files.length,
      files: files.map(f => ({ filename: f.filename, originalname: f.originalname, size: f.size, mimetype: f.mimetype }))
    });

    // Verify goal exists and user has access
    console.log('Verifying goal access for user:', req.user.id, 'sucursal:', req.user.sucursalId);
    
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        assignments: {
          where: { userId: req.user.id }
        }
      }
    });

    console.log('Goal found:', goal ? { id: goal.id, name: goal.name, sucursalId: goal.sucursalId } : 'NOT FOUND');

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      console.log('Sucursal mismatch:', { goalSucursal: goal.sucursalId, userSucursal: req.user.sucursalId });
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user is assigned to this goal or is admin/supervisor
    const isAssigned = goal.assignments.length > 0;
    const isAdminOrSupervisor = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);
    
    if (!isAssigned && !isAdminOrSupervisor) {
      return res.status(403).json({ error: 'You can only upload reports for goals assigned to you' });
    }

    // Validate file uploads
    if (files && files.length > 0) {
      for (const file of files) {
        if (!file.filename || !file.originalname || !file.mimetype || !file.size) {
          return res.status(400).json({ error: 'Invalid file data received' });
        }
      }
    }

    // Create the goal report using the new GoalReport model
    const reportData = {
      title,
      description,
      goalId,
      submittedById: req.user.id,
      isCompletion: isCompletion === 'true' || isCompletion === true,
      status: 'PENDING'
    };

    const report = await prisma.goalReport.create({
      data: reportData,
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create file records if files were uploaded
    let createdFiles = [];
    if (files.length > 0) {
      for (const file of files) {
        // Store relative path for database, full path for file system access
        const relativePath = `uploads/goals/${file.filename}`;
        
        const createdFile = await prisma.file.create({
          data: {
            name: file.filename,
            originalName: file.originalname,
            url: relativePath,
            size: file.size,
            type: file.mimetype,
            mimeType: file.mimetype, // Also set mimeType for consistency
            userId: req.user.id,
            sucursalId: req.user.sucursalId
          }
        });
        
        // Create GoalReportFile record to link file to goal report
        await prisma.goalReportFile.create({
          data: {
            goalReportId: report.id,
            fileId: createdFile.id
          }
        });
        
        createdFiles.push(createdFile);
      }
    }

    // Send notification to goal creator and assigned users
    const goalWithAssignments = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        createdBy: true,
        assignments: {
          include: { user: true }
        }
      }
    });

    if (goalWithAssignments) {
      // Notify goal creator
      if (goalWithAssignments.createdById !== req.user.id) {
        await createNotification(
          goalWithAssignments.createdById,
          'GOAL_REPORT_SUBMITTED',
          'Goal Report Submitted',
          `A report has been submitted for goal: "${goalWithAssignments.name}"`
        );
      }

      // Notify other assigned users
      for (const assignment of goalWithAssignments.assignments) {
        if (assignment.userId !== req.user.id) {
          await createNotification(
            assignment.userId,
            'GOAL_REPORT_SUBMITTED',
            'Goal Report Submitted',
            `A report has been submitted for goal: "${goalWithAssignments.name}"`
          );
        }
      }
    }

    res.status(201).json({
      message: 'Report uploaded successfully',
      report: {
        ...report,
        files: createdFiles
      }
    });
  } catch (error) {
    console.error('Goal report upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Log more specific error details
    if (error.code === 'P2002') {
      await logError('DATABASE_ERROR', 'Upload goal report failed - Unique constraint violation', error);
      return res.status(400).json({ error: 'File already exists with this name' });
    } else if (error.code === 'P2003') {
      await logError('DATABASE_ERROR', 'Upload goal report failed - Foreign key constraint violation', error);
      return res.status(400).json({ error: 'Invalid goal or user reference' });
    } else if (error.code === 'P2025') {
      await logError('DATABASE_ERROR', 'Upload goal report failed - Record not found', error);
      return res.status(404).json({ error: 'Goal or user not found' });
    }
    
    await logError('DATABASE_ERROR', 'Upload goal report failed', error);
    res.status(500).json({ error: 'Failed to upload goal report', details: error.message });
  }
});

// Update goal progress
router.put('/:goalId/progress', authenticateToken, [
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('status').optional().isString().withMessage('Status must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goalId } = req.params;
    const { progress, status } = req.body;

    // Verify goal exists and user has access
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        assignments: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user is assigned to this goal or is admin/supervisor
    const isAssigned = goal.assignments.length > 0;
    const isAdminOrSupervisor = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);
    
    if (!isAssigned && !isAdminOrSupervisor) {
      return res.status(403).json({ error: 'You can only update progress for goals assigned to you' });
    }

    // Update the goal progress
    const updateData = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (progress !== undefined) {
      updateData.progress = parseInt(progress);
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Goal progress updated successfully',
      goal: updatedGoal
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update goal progress failed', error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
});

// Publish goal
router.post('/:goalId/publish', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'SUPERVISOR' && goal.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Can only publish goals for your department' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { status: 'PUBLISHED' },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Goal published successfully',
      goal: updatedGoal
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Publish goal failed', error);
    res.status(500).json({ error: 'Failed to publish goal' });
  }
});

// Unpublish goal
router.post('/:goalId/unpublish', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'SUPERVISOR' && goal.departmentId !== req.user.departmentId) {
      return res.status(403).json({ error: 'Can only unpublish goals for your department' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { status: 'DRAFT' },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Goal unpublished successfully',
      goal: updatedGoal
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Unpublish goal failed', error);
    res.status(500).json({ error: 'Failed to unpublish goal' });
  }
});

// Download goal report file
router.get('/reports/:reportId/files/:fileId/download', authenticateToken, async (req, res) => {
  try {
    const { reportId, fileId } = req.params;

    // Get the goal report and verify access
    const report = await prisma.goalReport.findUnique({
      where: { id: reportId },
      include: {
        goal: {
          include: {
            assignments: true
          }
        },
        files: {
          where: { fileId: fileId },
          include: {
            file: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = report.files[0].file;

    // Check access permissions
    const isAssigned = report.goal.assignments.some(assignment => assignment.userId === req.user.id);
    const isCreator = report.submittedById === req.user.id;
    const isAdmin = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);
    
    if (!isAssigned && !isCreator && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists on disk
    const filePath = path.resolve(file.url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.name}"`);
    res.setHeader('Content-Type', file.mimeType || file.type || 'application/octet-stream');
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    await logError('DATABASE_ERROR', 'Download goal report file failed', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Publish goal endpoint
router.patch('/:goalId/publish', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;

    // Check if goal exists and user has permission to publish
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        createdBy: true
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Only the creator, supervisors, admins, or super admins can publish
    const canPublish = goal.createdById === req.user.id || 
                      ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canPublish) {
      return res.status(403).json({ error: 'Access denied. Only goal creator or supervisors can publish goals.' });
    }

    // Update goal to published
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        isPublished: true,
        publishedAt: new Date()
      },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Send notifications to assigned users
    if (updatedGoal.assignments && updatedGoal.assignments.length > 0) {
      for (const assignment of updatedGoal.assignments) {
        await createNotification(
          assignment.userId,
          'GOAL_PUBLISHED',
          `Goal "${updatedGoal.name}" has been published and is now available`,
          `/goals/view`,
          req.user.sucursalId
        );
      }
    }

    res.json({ 
      message: 'Goal published successfully',
      goal: updatedGoal 
    });
  } catch (error) {
    console.error('Publish goal error:', error);
    await logError('PUBLISH_GOAL_ERROR', 'Failed to publish goal', error);
    res.status(500).json({ error: 'Failed to publish goal' });
  }
});

// Share goal endpoint
router.post('/:goalId/share', authenticateToken, [
  body('sharedWithIds').isArray({ min: 1 }).withMessage('Must share with at least one user'),
  body('message').optional().isString().withMessage('Message must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goalId } = req.params;
    const { sharedWithIds, message } = req.body;

    // Check if goal exists and is completed
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        department: true,
        createdBy: true
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Only completed goals can be shared
    if (goal.status?.toLowerCase() !== 'completed' && goal.status?.toLowerCase() !== 'done') {
      return res.status(400).json({ error: 'Only completed goals can be shared' });
    }

    // Only supervisors, admins, or super admins can share goals
    const canShare = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);

    if (!canShare) {
      return res.status(403).json({ error: 'Access denied. Only supervisors and above can share goals.' });
    }

    // Verify all recipients exist and have appropriate roles
    const recipients = await prisma.user.findMany({
      where: { 
        id: { in: sharedWithIds },
        sucursalId: req.user.sucursalId 
      }
    });

    if (recipients.length !== sharedWithIds.length) {
      return res.status(400).json({ error: 'One or more selected users are invalid' });
    }

    // Create shares (ignore duplicates)
    const sharePromises = sharedWithIds.map(async (userId) => {
      try {
        return await prisma.goalShare.create({
          data: {
            goalId,
            sharedById: req.user.id,
            sharedWithId: userId,
            message: message || null
          }
        });
      } catch (error) {
        // Ignore duplicate shares
        if (error.code === 'P2002') {
          return null;
        }
        throw error;
      }
    });

    const shares = await Promise.all(sharePromises);
    const createdShares = shares.filter(share => share !== null);

    // Send notifications to recipients
    for (const recipient of recipients) {
      await createNotification(
        recipient.id,
        'GOAL_SHARED',
        `Goal "${goal.name}" has been shared with you by ${req.user.name}`,
        `/goals/view`,
        req.user.sucursalId
      );
    }

    res.json({ 
      message: `Goal shared with ${createdShares.length} user(s)`,
      shares: createdShares 
    });
  } catch (error) {
    console.error('Share goal error:', error);
    await logError('SHARE_GOAL_ERROR', 'Failed to share goal', error);
    res.status(500).json({ error: 'Failed to share goal' });
  }
});

// Get users available for sharing
router.get('/users/shareable', authenticateToken, async (req, res) => {
  try {
    // Only supervisors, admins, and super admins can access this endpoint
    const canShare = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);
    
    if (!canShare) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let users = [];

    if (req.user.role === 'SUPERVISOR' || req.user.role === 'ADMIN') {
      // Supervisors and admins can share with super admins
      users = await prisma.user.findMany({
        where: {
          sucursalId: req.user.sucursalId,
          role: { in: ['SUPER_ADMIN', 'DEVELOPER'] },
          id: { not: req.user.id } // Exclude self
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { role: 'desc' },
          { name: 'asc' }
        ]
      });
    } else if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DEVELOPER') {
      // Super admins can share with anyone
      users = await prisma.user.findMany({
        where: {
          sucursalId: req.user.sucursalId,
          id: { not: req.user.id } // Exclude self
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { role: 'desc' },
          { name: 'asc' }
        ]
      });
    }

    res.json(users);
  } catch (error) {
    console.error('Get shareable users error:', error);
    await logError('GET_SHAREABLE_USERS_ERROR', 'Failed to get shareable users', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user's assigned goals
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const goals = await prisma.goal.findMany({
      where: {
        sucursalId: req.user.sucursalId,
        assignments: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.goal.count({
      where: {
        sucursalId: req.user.sucursalId,
        assignments: {
          some: {
            userId: req.user.id
          }
        }
      }
    });

    res.json({
      goals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my goals error:', error);
    await logError('DATABASE_ERROR', 'Get my goals failed', error);
    res.status(500).json({ error: 'Failed to get my goals' });
  }
});

// Get goal assignments
router.get('/:goalId/assignments', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const assignments = await prisma.goalAssignment.findMany({
      where: { goalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get goal assignments error:', error);
    await logError('DATABASE_ERROR', 'Get goal assignments failed', error);
    res.status(500).json({ error: 'Failed to get goal assignments' });
  }
});

// Mark goal as completed
router.post('/:goalId/complete', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        assignments: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user is assigned to this goal or is admin/supervisor
    const isAssigned = goal.assignments.length > 0;
    const isAdminOrSupervisor = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role);
    
    if (!isAssigned && !isAdminOrSupervisor) {
      return res.status(403).json({ error: 'You can only complete goals assigned to you' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Goal marked as completed successfully',
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Complete goal error:', error);
    await logError('DATABASE_ERROR', 'Complete goal failed', error);
    res.status(500).json({ error: 'Failed to complete goal' });
  }
});

module.exports = router; 