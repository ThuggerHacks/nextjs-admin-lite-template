const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { logError } = require('../utils/errorLogger');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/')
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

// Submit a general report (not goal-related)
router.post('/submit', authenticateToken, upload.array('files', 5), [
  body('title').notEmpty().withMessage('Report title is required'),
  body('description').notEmpty().withMessage('Report description is required'),
  body('type').notEmpty().withMessage('Report type is required'),
  body('submittedToId').optional().isString().withMessage('Submitted to ID must be a string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, type, submittedToId } = req.body;
    const files = req.files || [];

    // Create the report record
    const reportData = {
      title,
      description,
      type,
      status: 'PENDING',
      submittedById: req.user.id,
      sucursalId: req.user.sucursalId,
    };

    if (submittedToId) {
      // Verify the submitted to user exists and has appropriate role
      const submittedToUser = await prisma.user.findUnique({
        where: { id: submittedToId }
      });
      
      if (!submittedToUser) {
        return res.status(400).json({ error: 'Invalid supervisor selected' });
      }
      
      if (!['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(submittedToUser.role)) {
        return res.status(400).json({ error: 'Selected user cannot receive reports' });
      }
      
      reportData.submittedToId = submittedToId;
    }

    // First create files if any
    let createdFiles = [];
    if (files.length > 0) {
      for (const file of files) {
        const createdFile = await prisma.file.create({
          data: {
            name: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimeType: file.mimetype,
            userId: req.user.id,
            sucursalId: req.user.sucursalId,
          }
        });
        createdFiles.push(createdFile);
      }
    }

    // Create the general report (extend the existing Report model)
    const report = await prisma.generalReport.create({
      data: {
        ...reportData,
        attachments: {
          create: createdFiles.map(file => ({
            fileId: file.id
          }))
        }
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        submittedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        attachments: {
          include: {
            file: true
          }
        }
      }
    });

    // Create notification for the recipient
    if (submittedToId) {
      await createNotification(
        submittedToId,
        'REPORT_SUBMITTED',
        `New report submitted: ${title}`,
        `/reports/view?id=${report.id}`,
        req.user.sucursalId
      );
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Submit report error:', error);
    await logError('SUBMIT_REPORT_ERROR', 'General report submission failed', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get available supervisors for the current user
router.get('/supervisors', authenticateToken, async (req, res) => {
  try {
    let supervisors = [];

    if (req.user.role === 'USER') {
      // Users can submit to admins in their department or super admins
      supervisors = await prisma.user.findMany({
        where: {
          sucursalId: req.user.sucursalId,
          OR: [
            {
              role: 'SUPER_ADMIN'
            },
            {
              role: 'ADMIN',
              departmentId: req.user.departmentId
            },
            {
              role: 'SUPERVISOR',
              departmentId: req.user.departmentId
            }
          ]
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
        }
      });
    } else if (req.user.role === 'ADMIN') {
      // Admins can submit to super admins
      supervisors = await prisma.user.findMany({
        where: {
          sucursalId: req.user.sucursalId,
          role: 'SUPER_ADMIN'
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
        }
      });
    } else if (req.user.role === 'SUPERVISOR') {
      // Supervisors can submit to admins and super admins
      supervisors = await prisma.user.findMany({
        where: {
          sucursalId: req.user.sucursalId,
          OR: [
            { role: 'SUPER_ADMIN' },
            { role: 'ADMIN' }
          ]
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
        }
      });
    }

    res.json(supervisors);
  } catch (error) {
    console.error('Get supervisors error:', error);
    await logError('GET_SUPERVISORS_ERROR', 'Failed to get supervisors', error);
    res.status(500).json({ error: 'Failed to get supervisors' });
  }
});

// Get general reports with filtering
router.get('/general', authenticateToken, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = {
      sucursalId: req.user.sucursalId
    };

    // Filter based on user role and permissions
    if (req.user.role === 'USER') {
      // Users see only their own reports
      where.submittedById = req.user.id;
    } else if (req.user.role === 'SUPERVISOR') {
      // Supervisors see reports from their department and reports submitted to them
      where.OR = [
        { submittedById: req.user.id },
        { submittedToId: req.user.id },
        {
          submittedBy: {
            departmentId: req.user.departmentId
          }
        }
      ];
    } else if (req.user.role === 'ADMIN') {
      // Admins see reports from their department and reports submitted to them
      where.OR = [
        { submittedById: req.user.id },
        { submittedToId: req.user.id },
        {
          submittedBy: {
            departmentId: req.user.departmentId
          }
        }
      ];
    } else if (['SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      // Super admins and developers see all reports
      // where remains as is (only sucursalId filter)
    }

    // Add additional filters
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    const reports = await prisma.generalReport.findMany({
      where,
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        submittedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        attachments: {
          include: {
            file: {
              select: {
                id: true,
                name: true,
                originalName: true,
                size: true,
                mimeType: true
              }
            }
          }
        }
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.generalReport.count({ where });

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
    console.error('Get general reports error:', error);
    await logError('GET_GENERAL_REPORTS_ERROR', 'Failed to get general reports', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Respond to a general report
router.post('/general/:reportId/respond', authenticateToken, [
  body('response').notEmpty().withMessage('Response is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reportId } = req.params;
    const { response } = req.body;

    // Find the report and verify permissions
    const report = await prisma.generalReport.findUnique({
      where: { id: reportId },
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

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if user can respond to this report
    const canRespond = 
      report.submittedToId === req.user.id || // Submitted to this user
      ['SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role) || // Super admin/developer
      (req.user.role === 'ADMIN' && report.submittedBy.departmentId === req.user.departmentId); // Admin of same department

    if (!canRespond) {
      return res.status(403).json({ error: 'You are not authorized to respond to this report' });
    }

    // Update the report with response
    const updatedReport = await prisma.generalReport.update({
      where: { id: reportId },
      data: {
        response,
        status: 'RESPONDED',
        respondedAt: new Date(),
        respondedById: req.user.id
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        submittedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        respondedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification for the report submitter
    await createNotification(
      report.submittedById,
      'REPORT_RESPONDED',
      `Your report "${report.title}" has been responded to`,
      `/reports/view?id=${report.id}`,
      req.user.sucursalId
    );

    res.json(updatedReport);
  } catch (error) {
    console.error('Respond to report error:', error);
    await logError('RESPOND_REPORT_ERROR', 'Failed to respond to report', error);
    res.status(500).json({ error: 'Failed to respond to report' });
  }
});

// Get all reports
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { goalId, assignedToMe, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      sucursalId: req.user.sucursalId
    };

    if (goalId) {
      where.goalId = goalId;
    }

    if (assignedToMe === 'true') {
      where.userId = req.user.id;
    } else if (['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      if (req.user.role === 'SUPERVISOR' && req.user.departmentId) {
        where.goal = {
          departmentId: req.user.departmentId
        };
      }
    } else {
      where.userId = req.user.id;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        goal: {
          include: {
            department: true
          }
        },
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
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.report.count({ where });

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
    await logError('DATABASE_ERROR', 'Get reports failed', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Get report by ID
router.get('/:reportId', authenticateToken, async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        goal: {
          include: {
            department: true
          }
        },
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
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ report });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get report failed', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// Create report
router.post('/', authenticateToken, [
  body('title').notEmpty().withMessage('Report title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('goalId').optional().isString().withMessage('Goal ID must be a string'),
  body('fileIds').optional().isArray().withMessage('File IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, goalId, fileIds = [] } = req.body;

    if (goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: {
          assignments: true
        }
      });

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      const isAssigned = goal.assignments.some(assignment => assignment.userId === req.user.id);
      if (!isAssigned && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
        return res.status(403).json({ error: 'You are not assigned to this goal' });
      }
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        goalId,
        userId: req.user.id,
        sucursalId: req.user.sucursalId,
        files: {
          create: fileIds.map(fileId => ({
            fileId
          }))
        }
      },
      include: {
        goal: {
          include: {
            department: true
          }
        },
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
    });

    if (goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: {
          department: true
        }
      });

      await createNotification(
        req.user.id,
        'REPORT_SUBMITTED',
        'Relatório Enviado',
        `Relatório "${title}" foi enviado para a meta: "${goal.name}"`
      );
    } else {
      await createNotification(
        req.user.id,
        'REPORT_SUBMITTED',
        'Relatório Enviado',
        `Relatório "${title}" foi enviado com sucesso.`
      );
    }

    res.status(201).json({
      message: 'Report created successfully',
      report
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create report failed', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Update report
router.put('/:reportId', authenticateToken, [
  body('title').optional().notEmpty().withMessage('Report title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('fileIds').optional().isArray().withMessage('File IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reportId } = req.params;
    const { title, description, fileIds } = req.body;

    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: updateData,
      include: {
        goal: {
          include: {
            department: true
          }
        },
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
    });

    if (fileIds) {
      await prisma.reportFile.deleteMany({
        where: { reportId }
      });

      if (fileIds.length > 0) {
        await prisma.reportFile.createMany({
          data: fileIds.map(fileId => ({
            reportId,
            fileId
          }))
        });
      }
    }

    res.json({
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update report failed', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete report
router.delete('/:reportId', authenticateToken, async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId !== req.user.id && !['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.report.delete({
      where: { id: reportId }
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete report failed', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

module.exports = router; 