const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Get all error logs (Developer only)
router.get('/', authenticateToken, requireRole(['DEVELOPER','SUPER_ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, errorType, sucursalId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (errorType) {
      where.errorType = errorType;
    }

    if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const errorLogs = await prisma.errorLog.findMany({
      where,
      include: {
        sucursal: {
          select: {
            id: true,
            name: true,
            serverUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(offset),
      take: parseInt(limit)
    });

    const total = await prisma.errorLog.count({ where });

    res.json({
      errorLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get error logs failed', error);
    res.status(500).json({ error: 'Failed to get error logs' });
  }
});

// Get error log by ID
router.get('/:errorLogId', authenticateToken, requireRole(['DEVELOPER']), async (req, res) => {
  try {
    const { errorLogId } = req.params;
    const errorLog = await prisma.errorLog.findUnique({
      where: { id: errorLogId },
      include: {
        sucursal: {
          select: {
            id: true,
            name: true,
            serverUrl: true
          }
        }
      }
    });

    if (!errorLog) {
      return res.status(404).json({ error: 'Error log not found' });
    }

    res.json({ errorLog });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get error log failed', error);
    res.status(500).json({ error: 'Failed to get error log' });
  }
});

// Get error statistics
router.get('/stats/summary', authenticateToken, requireRole(['DEVELOPER']), async (req, res) => {
  try {
    const { sucursalId, startDate, endDate } = req.query;

    const where = {};

    if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const totalErrors = await prisma.errorLog.count({ where });

    const errorsByType = await prisma.errorLog.groupBy({
      by: ['errorType'],
      where,
      _count: {
        errorType: true
      }
    });

    const errorsBySucursal = await prisma.errorLog.groupBy({
      by: ['sucursalId'],
      where,
      _count: {
        sucursalId: true
      }
    });

    const recentErrors = await prisma.errorLog.findMany({
      where,
      include: {
        sucursal: {
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
      totalErrors,
      errorsByType,
      errorsBySucursal,
      recentErrors
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get error statistics failed', error);
    res.status(500).json({ error: 'Failed to get error statistics' });
  }
});

// Delete error log
router.delete('/:errorLogId', authenticateToken, requireRole(['DEVELOPER']), async (req, res) => {
  try {
    const { errorLogId } = req.params;

    const errorLog = await prisma.errorLog.findUnique({
      where: { id: errorLogId }
    });

    if (!errorLog) {
      return res.status(404).json({ error: 'Error log not found' });
    }

    await prisma.errorLog.delete({
      where: { id: errorLogId }
    });

    res.json({ message: 'Error log deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete error log failed', error);
    res.status(500).json({ error: 'Failed to delete error log' });
  }
});

// Clear error logs
router.delete('/clear/all', authenticateToken, requireRole(['DEVELOPER']), async (req, res) => {
  try {
    const { sucursalId, beforeDate } = req.query;

    const where = {};

    if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    if (beforeDate) {
      where.createdAt = {
        lte: new Date(beforeDate)
      };
    }

    const deletedCount = await prisma.errorLog.deleteMany({ where });

    res.json({
      message: 'Error logs cleared successfully',
      deletedCount: deletedCount.count
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Clear error logs failed', error);
    res.status(500).json({ error: 'Failed to clear error logs' });
  }
});

module.exports = router; 