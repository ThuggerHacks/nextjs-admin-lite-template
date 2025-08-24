const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get comprehensive dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const where = {
      sucursalId: req.user.sucursalId
    };

    // User statistics
    const totalUsers = await prisma.user.count({
      where: {
        ...where,
        status: 'ACTIVE'
      }
    });

    const activeUsers = await prisma.user.count({
      where: {
        ...where,
        status: 'ACTIVE'
      }
    });

    const inactiveUsers = await prisma.user.count({
      where: {
        ...where,
        status: 'INACTIVE'
      }
    });

    const pendingUsers = await prisma.user.count({
      where: {
        ...where,
        status: 'PENDING'
      }
    });

    const newUsersThisMonth = await prisma.user.count({
      where: {
        ...where,
        createdAt: {
          gte: startDate
        }
      }
    });

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: {
        ...where,
        status: 'ACTIVE'
      },
      _count: {
        role: true
      }
    });

    const roleCounts = {};
    usersByRole.forEach(item => {
      roleCounts[item.role.toLowerCase()] = item._count.role;
    });

    // Department statistics
    const totalDepartments = await prisma.department.count({
      where: {
        sucursalId: req.user.sucursalId
      }
    });

    const departmentsWithSupervisor = await prisma.department.count({
      where: {
        sucursalId: req.user.sucursalId,
        supervisorId: {
          not: null
        }
      }
    });

    const departmentsWithoutSupervisor = totalDepartments - departmentsWithSupervisor;

    // File statistics
    const totalFiles = await prisma.file.count({
      where: {
        sucursalId: req.user.sucursalId
      }
    });

    const filesByType = await prisma.file.groupBy({
      by: ['type'],
      where: {
        sucursalId: req.user.sucursalId
      },
      _count: {
        type: true
      },
      _sum: {
        size: true
      }
    });

    const fileTypeCounts = {};
    let totalSize = 0;
    filesByType.forEach(item => {
      fileTypeCounts[item.type] = item._count.type;
      totalSize += item._sum.size || 0;
    });

    const uploadedToday = await prisma.file.count({
      where: {
        sucursalId: req.user.sucursalId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const uploadedThisWeek = await prisma.file.count({
      where: {
        sucursalId: req.user.sucursalId,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });

    // Goal statistics
    const totalGoals = await prisma.goal.count({
      where: {
        ...where
      }
    });

    const publishedGoals = await prisma.goal.count({
      where: {
        ...where,
        status: 'PUBLISHED'
      }
    });

    const completedGoals = await prisma.goal.count({
      where: {
        ...where,
        status: 'COMPLETED'
      }
    });

    const inProgressGoals = await prisma.goal.count({
      where: {
        ...where,
        status: 'IN_PROGRESS'
      }
    });

    const overdueGoals = await prisma.goal.count({
      where: {
        ...where,
        status: 'IN_PROGRESS',
        timeline: {
          lt: new Date()
        }
      }
    });

    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Report statistics
    const totalReports = await prisma.report.count({
      where: {
        sucursalId: req.user.sucursalId
      }
    });

    const pendingReports = await prisma.report.count({
      where: {
        sucursalId: req.user.sucursalId,
        status: 'PENDING'
      }
    });

    const reviewedReports = await prisma.report.count({
      where: {
        sucursalId: req.user.sucursalId,
        status: 'REVIEWED'
      }
    });

    const archivedReports = await prisma.report.count({
      where: {
        sucursalId: req.user.sucursalId,
        status: 'ARCHIVED'
      }
    });

    const submittedToday = await prisma.report.count({
      where: {
        sucursalId: req.user.sucursalId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const responseRate = totalReports > 0 ? Math.round(((totalReports - pendingReports) / totalReports) * 100) : 0;

    // Library statistics
    const totalLibraries = await prisma.library.count({
      where: {
        sucursalId: req.user.sucursalId
      }
    });

    const libraryFiles = await prisma.library.aggregate({
      where: {
        sucursalId: req.user.sucursalId
      },
      _sum: {
        fileCount: true
      }
    });

    const activeLibraryUsers = await prisma.user.count({
      where: {
        ...where,
        status: 'ACTIVE',
        files: {
          some: {
            sucursalId: req.user.sucursalId
          }
        }
      }
    });

    // Scan statistics
    const totalScans = await prisma.scan.count({
      where: {
        sucursalId: req.user.sucursalId
      }
    });

    const scansWithPdf = await prisma.scan.count({
      where: {
        sucursalId: req.user.sucursalId,
        pdfGenerated: true
      }
    });

    const scansToday = await prisma.scan.count({
      where: {
        sucursalId: req.user.sucursalId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const scansThisWeek = await prisma.scan.count({
      where: {
        sucursalId: req.user.sucursalId,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });

    const scanSuccessRate = totalScans > 0 ? Math.round((scansWithPdf / totalScans) * 100) : 0;

    // Notification statistics
    const totalNotifications = await prisma.notification.count({
      where: {
        userId: req.user.id
      }
    });

    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: req.user.id,
        read: false
      }
    });

    // Storage statistics (mock for now, can be enhanced with real storage monitoring)
    const storageUsed = Math.round(totalSize / (1024 * 1024 * 1024) * 100) / 100; // Convert to GB
    const storageTotal = 100; // 100 GB total storage
    const storageAvailable = storageTotal - storageUsed;
    const usagePercentage = Math.round((storageUsed / storageTotal) * 100);

    // System health (mock for now, can be enhanced with real system monitoring)
    const systemHealth = {
      uptime: 99.9,
      memory: Math.round(Math.random() * 30 + 50), // 50-80%
      cpu: Math.round(Math.random() * 20 + 10), // 10-30%
      disk: usagePercentage
    };

    // Calculate growth rate
    const previousPeriodUsers = await prisma.user.count({
      where: {
        ...where,
        createdAt: {
          lt: startDate,
          gte: new Date(startDate.getTime() - (parseInt(period) * 24 * 60 * 60 * 1000))
        }
      }
    });

    const growthRate = previousPeriodUsers > 0 ? 
      Math.round(((newUsersThisMonth - previousPeriodUsers) / previousPeriodUsers) * 100) : 
      newUsersThisMonth > 0 ? 100 : 0;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        pending: pendingUsers,
        byRole: roleCounts,
        newThisMonth: newUsersThisMonth,
        growthRate: growthRate
      },
      departments: {
        total: totalDepartments,
        withSupervisor: departmentsWithSupervisor,
        withoutSupervisor: departmentsWithoutSupervisor,
        activeUsers: activeUsers
      },
      files: {
        total: totalFiles,
        totalSize: storageUsed,
        byType: fileTypeCounts,
        uploadedToday: uploadedToday,
        uploadedThisWeek: uploadedThisWeek
      },
      goals: {
        total: totalGoals,
        published: publishedGoals,
        completed: completedGoals,
        inProgress: inProgressGoals,
        overdue: overdueGoals,
        completionRate: completionRate
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        reviewed: reviewedReports,
        archived: archivedReports,
        submittedToday: submittedToday,
        responseRate: responseRate
      },
      libraries: {
        total: totalLibraries,
        totalFiles: libraryFiles._sum.fileCount || 0,
        activeUsers: activeLibraryUsers
      },
      scans: {
        total: totalScans,
        withPdf: scansWithPdf,
        totalFiles: totalScans,
        today: scansToday,
        thisWeek: scansThisWeek,
        successRate: scanSuccessRate
      },
      storage: {
        used: storageUsed,
        available: storageAvailable,
        total: storageTotal,
        usagePercentage: usagePercentage
      },
      system: systemHealth
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get dashboard stats failed', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// Get recent activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, period = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const where = {
      sucursalId: req.user.sucursalId,
      createdAt: {
        gte: startDate
      }
    };

    // Get recent goals
    const recentGoals = await prisma.goal.findMany({
      where: {
        ...where
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 3)
    });

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      where: {
        ...where
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 3)
    });

    // Get recent files
    const recentFiles = await prisma.file.findMany({
      where: {
        ...where
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 3)
    });

    // Get recent scans
    const recentScans = await prisma.scan.findMany({
      where: {
        ...where
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 3)
    });

    // Combine and format activities
    const activities = [
      ...recentGoals.map(goal => ({
        id: goal.id,
        userId: goal.createdBy.id,
        action: `created goal "${goal.name}"`,
        resource: 'goal',
        timestamp: goal.createdAt,
        user: goal.createdBy
      })),
      ...recentReports.map(report => ({
        id: report.id,
        userId: report.user.id,
        action: `submitted report "${report.title}"`,
        resource: 'report',
        timestamp: report.createdAt,
        user: report.user
      })),
      ...recentFiles.map(file => ({
        id: file.id,
        userId: file.user.id,
        action: `uploaded file "${file.name}"`,
        resource: 'document',
        timestamp: file.createdAt,
        user: file.user
      })),
      ...recentScans.map(scan => ({
        id: scan.id,
        userId: scan.user.id,
        action: `scanned document`,
        resource: 'scan',
        timestamp: scan.createdAt,
        user: scan.user
      }))
    ];

    // Sort by timestamp and take limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json(limitedActivities);
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get recent activity failed', error);
    res.status(500).json({ error: 'Failed to get recent activity' });
  }
});

// Get system alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    // For now, return mock alerts. This can be enhanced with real system monitoring
    const alerts = [
      {
        id: '1',
        type: 'info',
        title: 'System running normally',
        message: 'All systems are operating within normal parameters',
        timestamp: new Date(),
        acknowledged: true
      }
    ];

    // Check for real alerts (e.g., low storage, high CPU, etc.)
    const storageUsed = await prisma.file.aggregate({
      where: {
        sucursalId: req.user.sucursalId
      },
      _sum: {
        size: true
      }
    });

    const totalSize = storageUsed._sum.size || 0;
    const sizeInGB = totalSize / (1024 * 1024 * 1024);

    if (sizeInGB > 80) {
      alerts.push({
        id: '2',
        type: 'warning',
        title: 'Storage space running low',
        message: `Storage usage is at ${Math.round(sizeInGB)}% of capacity`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Check for pending reports that need attention
    const pendingReports = await prisma.report.count({
      where: {
        sucursalId: req.user.sucursalId,
        status: 'PENDING'
      }
    });

    if (pendingReports > 20) {
      alerts.push({
        id: '3',
        type: 'warning',
        title: 'High number of pending reports',
        message: `${pendingReports} reports are pending review`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    res.json(alerts);
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get system alerts failed', error);
    res.status(500).json({ error: 'Failed to get system alerts' });
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