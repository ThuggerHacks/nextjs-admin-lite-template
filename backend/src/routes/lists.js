const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');
const { createNotification } = require('../utils/notifications');

const router = express.Router();

// Get all lists for user (lists they created or are member of)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const lists = await prisma.list.findMany({
      where: {
        sucursalId: req.user.sucursalId,
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        items: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            members: true,
            items: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ lists });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get lists failed', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// Get single list by ID
router.get('/:listId', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        sucursalId: req.user.sucursalId,
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        items: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            members: true,
            items: true
          }
        }
      }
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ list });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get list failed', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

// Create new list
router.post('/', authenticateToken, [
  body('name').trim().notEmpty().withMessage('List name is required'),
  body('description').optional().trim(),
  body('memberIds').optional().isArray().withMessage('Member IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, memberIds = [] } = req.body;

    // Create list with creator as admin member
    const list = await prisma.list.create({
      data: {
        name,
        description,
        createdById: req.user.id,
        sucursalId: req.user.sucursalId,
        members: {
          create: [
            {
              userId: req.user.id,
              role: 'ADMIN'
            },
            ...memberIds.map(userId => ({
              userId,
              role: 'MEMBER'
            }))
          ]
        }
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            members: true,
            items: true
          }
        }
      }
    });

    res.status(201).json({ list });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create list failed', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Update list
router.put('/:listId', authenticateToken, [
  body('name').optional().trim().notEmpty().withMessage('List name cannot be empty'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listId } = req.params;
    const { name, description } = req.body;

    // Check if user is admin of the list
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        sucursalId: req.user.sucursalId,
        members: {
          some: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      }
    });

    if (!list) {
      return res.status(403).json({ error: 'You do not have permission to edit this list' });
    }

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        items: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            members: true,
            items: true
          }
        }
      }
    });

    res.json({ list: updatedList });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update list failed', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete list
router.delete('/:listId', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;

    // Check if user is admin of the list
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        sucursalId: req.user.sucursalId,
        members: {
          some: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      }
    });

    if (!list) {
      return res.status(403).json({ error: 'You do not have permission to delete this list' });
    }

    await prisma.list.delete({
      where: { id: listId }
    });

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete list failed', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Add member to list
router.post('/:listId/members', authenticateToken, [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listId } = req.params;
    const { userId } = req.body;

    // Check if user is admin of the list
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        sucursalId: req.user.sucursalId,
        members: {
          some: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      }
    });

    if (!list) {
      return res.status(403).json({ error: 'You do not have permission to add members to this list' });
    }

    // Check if user is already a member
    const existingMember = await prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId,
          userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this list' });
    }

    const member = await prisma.listMember.create({
      data: {
        listId,
        userId,
        role: 'MEMBER'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ member });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Add member failed', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from list
router.delete('/:listId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { listId, userId } = req.params;

    // Check if user is admin of the list
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        sucursalId: req.user.sucursalId,
        members: {
          some: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      }
    });

    if (!list) {
      return res.status(403).json({ error: 'You do not have permission to remove members from this list' });
    }

    // Cannot remove the creator
    if (list.createdById === userId) {
      return res.status(400).json({ error: 'Cannot remove the list creator' });
    }

    await prisma.listMember.delete({
      where: {
        listId_userId: {
          listId,
          userId
        }
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Remove member failed', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get list items with filters
router.get('/:listId/items', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;
    const { startDate, endDate, name } = req.query;

    // Check if user has access to the list
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        sucursalId: req.user.sucursalId,
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const where = { listId };

    if (startDate || endDate) {
      where.OR = [];
      if (startDate) {
        where.OR.push({ startDate: { gte: new Date(startDate) } });
      }
      if (endDate) {
        where.OR.push({ endDate: { lte: new Date(endDate) } });
      }
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    const items = await prisma.listItem.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ items });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get list items failed', error);
    res.status(500).json({ error: 'Failed to fetch list items' });
  }
});

// Create list item
router.post('/:listId/items', authenticateToken, [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('description').optional().trim(),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listId } = req.params;
    const { name, description, value, startDate, endDate } = req.body;

    // Check if user has access to the list
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        sucursalId: req.user.sucursalId,
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const item = await prisma.listItem.create({
      data: {
        listId,
        name,
        description,
        value: value ? parseFloat(value) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ item });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Create list item failed', error);
    res.status(500).json({ error: 'Failed to create list item' });
  }
});

// Update list item
router.put('/:listId/items/:itemId', authenticateToken, [
  body('name').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('description').optional().trim(),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listId, itemId } = req.params;
    const { name, description, value, startDate, endDate } = req.body;

    // Check if user can edit this item (creator or list admin)
    const item = await prisma.listItem.findFirst({
      where: {
        id: itemId,
        listId,
        OR: [
          { createdById: req.user.id },
          {
            list: {
              members: {
                some: {
                  userId: req.user.id,
                  role: 'ADMIN'
                }
              }
            }
          }
        ]
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found or you do not have permission to edit it' });
    }

    const updatedItem = await prisma.listItem.update({
      where: { id: itemId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(value !== undefined && { value: value ? parseFloat(value) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ item: updatedItem });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Update list item failed', error);
    res.status(500).json({ error: 'Failed to update list item' });
  }
});

// Delete list item
router.delete('/:listId/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { listId, itemId } = req.params;

    // Check if user can delete this item (creator or list admin)
    const item = await prisma.listItem.findFirst({
      where: {
        id: itemId,
        listId,
        OR: [
          { createdById: req.user.id },
          {
            list: {
              members: {
                some: {
                  userId: req.user.id,
                  role: 'ADMIN'
                }
              }
            }
          }
        ]
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found or you do not have permission to delete it' });
    }

    await prisma.listItem.delete({
      where: { id: itemId }
    });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Delete list item failed', error);
    res.status(500).json({ error: 'Failed to delete list item' });
  }
});

// Get expiring items (for notifications)
router.get('/:listId/expiring', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;
    const { days = 1 } = req.query;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringItems = await prisma.listItem.findMany({
      where: {
        listId,
        endDate: {
          lte: futureDate,
          gte: new Date()
        }
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        list: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        }
      }
    });

    res.json({ expiringItems });
  } catch (error) {
    await logError('DATABASE_ERROR', 'Get expiring items failed', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

module.exports = router;
