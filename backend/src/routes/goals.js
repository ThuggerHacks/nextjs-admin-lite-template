const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification, createDepartmentNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

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
        where.departmentId = req.user.departmentId;
      }
    } else {
      where.assignments = {
        some: {
          userId: req.user.id
        }
      };
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
    await logError('DATABASE_ERROR', 'Get goals failed', error);
    res.status(500).json({ error: 'Failed to get goals' });
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
            user: {
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
  body('timeline').isISO8601().withMessage('Timeline must be a valid date'),
  body('departmentId').notEmpty().withMessage('Department ID is required'),
  body('userIds').isArray().withMessage('User IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, timeline, departmentId, userIds } = req.body;

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

    const goal = await prisma.goal.create({
      data: {
        name,
        description,
        timeline: new Date(timeline),
        departmentId,
        createdById: req.user.id,
        sucursalId: req.user.sucursalId,
        assignments: {
          create: userIds.map(userId => ({
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

    for (const userId of userIds) {
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
  body('timeline').optional().isISO8601().withMessage('Timeline must be a valid date'),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  body('userIds').optional().isArray().withMessage('User IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goalId } = req.params;
    const { name, description, timeline, status, userIds } = req.body;

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
    if (timeline) updateData.timeline = new Date(timeline);
    if (status) updateData.status = status;

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
    await logError('DATABASE_ERROR', 'Update goal failed', error);
    res.status(500).json({ error: 'Failed to update goal' });
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

module.exports = router; 