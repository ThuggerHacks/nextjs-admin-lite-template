const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;
    const where = {
      sucursalId: req.user.sucursalId
    };

    if (departmentId) {
      where.departmentId = departmentId;
    } else if (req.user.role === 'SUPERVISOR' && req.user.departmentId) {
      where.departmentId = req.user.departmentId;
    }

    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // User statistics
    const totalUsers = await prisma.user.count({
      where: {
        ...where,
        status: 'ACTIVE'
      }
    });

    const pendingUsers = await prisma.user.count({
      where: {
        ...where,
        status: 'PENDING'
      }
    });

    // Goal statistics
    const totalGoals = await prisma.goal.count({
      where: {
        ...where,
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      }
    });

    const publishedGoals = await prisma.goal.count({
      where: {
        ...where,
        status: 'PUBLISHED',
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      }
    });

    const completedGoals = await prisma.goal.count({
      where: {
        ...where,
        status: 'COMPLETED',
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      }
    });

    const inProgressGoals = await prisma.goal.count({
      where: {
        ...where,
        status: 'IN_PROGRESS',
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      }
    });

    // Report statistics
    const totalReports = await prisma.report.count({
      where: {
        sucursalId: req.user.sucursalId,
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      }
    });

    // File statistics
    const totalFiles = await prisma.file.count({
      where: {
        sucursalId: req.user.sucursalId,
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      }
    });

    const publicFiles = await prisma.file.count({
      where: {
        sucursalId: req.user.sucursalId,
        isPublic: true,
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      }
    });

    // Recent activities
    const recentGoals = await prisma.goal.findMany({
      where: {
        ...where,
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      },
      include: {
        department: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentReports = await prisma.report.findMany({
      where: {
        sucursalId: req.user.sucursalId,
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        goal: {
          include: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Department statistics (for supervisors/admins)
    let departmentStats = [];
    if (['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      const departments = await prisma.department.findMany({
        where: {
          sucursalId: req.user.sucursalId
        },
        include: {
          _count: {
            select: {
              users: true,
              goals: true
            }
          },
          users: {
            select: {
              id: true,
              name: true,
              role: true,
              status: true
            }
          }
        }
      });

      departmentStats = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        userCount: dept._count.users,
        goalCount: dept._count.goals,
        activeUsers: dept.users.filter(user => user.status === 'ACTIVE').length,
        pendingUsers: dept.users.filter(user => user.status === 'PENDING').length
      }));
    }

    res.json({
      stats: {
        totalUsers,
        pendingUsers,
        totalGoals,
        publishedGoals,
        completedGoals,
        inProgressGoals,
        totalReports,
        totalFiles,
        publicFiles
      },
      recentGoals,
      recentReports,
      departmentStats
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get dashboard stats failed', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// Get goal progress
router.get('/goals/progress', authenticateToken, async (req, res) => {
  try {
    const { departmentId } = req.query;
    const where = {
      sucursalId: req.user.sucursalId
    };

    if (departmentId) {
      where.departmentId = departmentId;
    } else if (req.user.role === 'SUPERVISOR' && req.user.departmentId) {
      where.departmentId = req.user.departmentId;
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        department: true,
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
        },
        reports: {
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
      },
      orderBy: { createdAt: 'desc' }
    });

    const goalProgress = goals.map(goal => ({
      id: goal.id,
      name: goal.name,
      status: goal.status,
      timeline: goal.timeline,
      department: goal.department,
      assignedUsers: goal.assignments.length,
      completedReports: goal.reports.length,
      progress: goal.status === 'COMPLETED' ? 100 : 
                goal.status === 'IN_PROGRESS' ? 50 : 
                goal.status === 'PUBLISHED' ? 25 : 0
    }));

    res.json({ goalProgress });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get goal progress failed', error);
    res.status(500).json({ error: 'Failed to get goal progress' });
  }
});

// Get user activity
router.get('/users/activity', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const { departmentId, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const where = {
      sucursalId: req.user.sucursalId,
      createdAt: {
        gte: startDate
      }
    };

    if (departmentId) {
      where.departmentId = departmentId;
    } else if (req.user.role === 'SUPERVISOR' && req.user.departmentId) {
      where.departmentId = req.user.departmentId;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: {
            files: true,
            reports: true,
            scans: true
          }
        }
      }
    });

    const userActivity = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      fileCount: user._count.files,
      reportCount: user._count.reports,
      scanCount: user._count.scans,
      lastActivity: user.updatedAt
    }));

    res.json({ userActivity });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get user activity failed', error);
    res.status(500).json({ error: 'Failed to get user activity' });
  }
});

// Get file statistics
router.get('/files/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {
      sucursalId: req.user.sucursalId
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const totalFiles = await prisma.file.count({ where });
    const publicFiles = await prisma.file.count({
      where: {
        ...where,
        isPublic: true
      }
    });

    const privateFiles = totalFiles - publicFiles;

    const filesByType = await prisma.file.groupBy({
      by: ['type'],
      where,
      _count: {
        type: true
      },
      _sum: {
        size: true
      }
    });

    const recentFiles = await prisma.file.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      totalFiles,
      publicFiles,
      privateFiles,
      filesByType,
      recentFiles
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get file stats failed', error);
    res.status(500).json({ error: 'Failed to get file statistics' });
  }
});

module.exports = router; 