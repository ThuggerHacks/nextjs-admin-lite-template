const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');

const router = express.Router();

// Public endpoint for departments (for registration page)
router.get('/public', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    res.json({ departments });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get public departments failed', error);
    res.status(500).json({ error: 'Failed to get departments' });
  }
});

// Get all departments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { sucursalId: req.user.sucursalId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({ departments });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get departments failed', error);
    res.status(500).json({ error: 'Failed to get departments' });
  }
});

// Get department by ID
router.get('/:departmentId', authenticateToken, async (req, res) => {
  try {
    const { departmentId } = req.params;
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    if (department.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ department });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get department failed', error);
    res.status(500).json({ error: 'Failed to get department' });
  }
});

// Create department (Admin/Developer only)
router.post('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), [
  body('name').notEmpty().withMessage('Department name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('supervisorId').optional().isString().withMessage('Supervisor ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, supervisorId } = req.body;

    const existingDepartment = await prisma.department.findFirst({
      where: {
        name,
        sucursalId: req.user.sucursalId
      }
    });

    if (existingDepartment) {
      return res.status(400).json({ error: 'Department already exists' });
    }

    // Validate supervisor if provided
    if (supervisorId) {
      const supervisor = await prisma.user.findUnique({
        where: { id: supervisorId }
      });
      
      if (!supervisor) {
        return res.status(400).json({ error: 'Supervisor not found' });
      }
      
      if (supervisor.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Supervisor must be an active user' });
      }
      
      // Check if user has appropriate role for being a supervisor
      if (!['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'].includes(supervisor.role)) {
        return res.status(400).json({ error: 'Supervisor must have Supervisor, Admin, or Super Admin role' });
      }
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        supervisorId,
        sucursalId: req.user.sucursalId
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create department failed', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update department (Admin/Developer only)
router.put('/:departmentId', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), [
  body('name').optional().notEmpty().withMessage('Department name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('supervisorId').optional().isString().withMessage('Supervisor ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { departmentId } = req.params;
    const { name, description, supervisorId } = req.body;

    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    if (department.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate supervisor if provided
    if (supervisorId) {
      const supervisor = await prisma.user.findUnique({
        where: { id: supervisorId }
      });
      
      if (!supervisor) {
        return res.status(400).json({ error: 'Supervisor not found' });
      }
      
      if (supervisor.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Supervisor must be an active user' });
      }
      
      // Check if user has appropriate role for being a supervisor
      if (!['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'].includes(supervisor.role)) {
        return res.status(400).json({ error: 'Supervisor must have Supervisor, Admin, or Super Admin role' });
      }
    }

    const updateData = {};
    if (name) {
      if (name !== department.name) {
        const existingDepartment = await prisma.department.findFirst({
          where: {
            name,
            sucursalId: req.user.sucursalId,
            id: { not: departmentId }
          }
        });
        if (existingDepartment) {
          return res.status(400).json({ error: 'Department name already exists' });
        }
      }
      updateData.name = name;
    }
    if (description !== undefined) updateData.description = description;
    if (supervisorId !== undefined) updateData.supervisorId = supervisorId;

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({
      message: 'Department updated successfully',
      data: updatedDepartment
    });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update department failed', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// Delete department (Admin/Developer only)
router.delete('/:departmentId', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        users: true
      }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    if (department.sucursalId !== req.user.sucursalId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (department.users.length > 0) {
      return res.status(400).json({ error: 'Cannot delete department with users' });
    }

    await prisma.department.delete({
      where: { id: departmentId }
    });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete department failed', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

module.exports = router; 