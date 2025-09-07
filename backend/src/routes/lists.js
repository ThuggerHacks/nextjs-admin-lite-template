const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { logError } = require('../utils/errorLogger');
const { createNotification } = require('../utils/notifications');
const { triggerExpirationCheck } = require('../services/expirationNotificationService');
const ExcelJS = require('exceljs');

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

    // Send notifications to all added members (excluding creator)
    for (const memberId of memberIds) {
      try {
        await createNotification(
          memberId,
          'LIST_MEMBER_ADDED',
          'Você foi adicionado a uma lista',
          `Você foi adicionado à lista "${name}" por ${req.user.name}.`,
          req.user.sucursalId
        );
      } catch (error) {
        console.error(`Failed to send notification to user ${memberId}:`, error);
      }
    }

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

    // Send notification to the added user
    await createNotification(
      userId,
      'LIST_MEMBER_ADDED',
      'Você foi adicionado a uma lista',
      `Você foi adicionado à lista "${list.name}" por ${req.user.name}.`,
      req.user.sucursalId
    );

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

    // Check if item expires soon and send immediate notification
    if (item.endDate) {
      const now = new Date();
      const itemEndDate = new Date(item.endDate);
      const daysDiff = Math.floor((itemEndDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff <= 2) {
        let notificationTitle, notificationDescription;
        
        if (daysDiff === 0) {
          notificationTitle = 'Item Expira Hoje';
          notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expira hoje!`;
        } else if (daysDiff === 1) {
          notificationTitle = 'Item Expira Amanhã';
          notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expira amanhã!`;
        } else if (daysDiff === 2) {
          notificationTitle = 'Item Expira em 2 Dias';
          notificationDescription = `O item "${item.name}" da lista "${item.list.name}" expira em 2 dias!`;
        }

        // Send notification to all list members (except creator)
        for (const member of item.list.members) {
          if (member.userId !== req.user.id) {
            try {
              await createNotification(
                member.userId,
                'EXPIRATION_WARNING',
                notificationTitle,
                notificationDescription,
                req.user.sucursalId
              );
            } catch (error) {
              console.error(`Failed to send immediate notification to user ${member.userId}:`, error);
            }
          }
        }
      }
    }

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

    // Check if updated item expires soon and send immediate notification
    if (updatedItem.endDate) {
      const now = new Date();
      const itemEndDate = new Date(updatedItem.endDate);
      const daysDiff = Math.floor((itemEndDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff <= 2) {
        let notificationTitle, notificationDescription;
        
        if (daysDiff === 0) {
          notificationTitle = 'Item Expira Hoje';
          notificationDescription = `O item "${updatedItem.name}" da lista "${updatedItem.list.name}" expira hoje!`;
        } else if (daysDiff === 1) {
          notificationTitle = 'Item Expira Amanhã';
          notificationDescription = `O item "${updatedItem.name}" da lista "${updatedItem.list.name}" expira amanhã!`;
        } else if (daysDiff === 2) {
          notificationTitle = 'Item Expira em 2 Dias';
          notificationDescription = `O item "${updatedItem.name}" da lista "${updatedItem.list.name}" expira em 2 dias!`;
        }

        // Send notification to all list members (except updater)
        for (const member of updatedItem.list.members) {
          if (member.userId !== req.user.id) {
            try {
              await createNotification(
                member.userId,
                'EXPIRATION_WARNING',
                notificationTitle,
                notificationDescription,
                req.user.sucursalId
              );
            } catch (error) {
              console.error(`Failed to send immediate notification to user ${member.userId}:`, error);
            }
          }
        }
      }
    }

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

// Export list items to Excel
router.get('/:listId/export', authenticateToken, async (req, res) => {
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
        }
      }
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Build filter conditions
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

    // Get filtered items
    const items = await prisma.listItem.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Itens da Lista');

    // Define columns
    worksheet.columns = [
      { header: 'Nome do Item', key: 'name', width: 30 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Valor (MZN)', key: 'value', width: 15 },
      { header: 'Data de Início', key: 'startDate', width: 15 },
      { header: 'Data de Fim', key: 'endDate', width: 15 },
      { header: 'Status de Expiração', key: 'expirationStatus', width: 20 },
      { header: 'Criado por', key: 'createdBy', width: 25 },
      { header: 'Data de Criação', key: 'createdAt', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Add data rows
    items.forEach((item, index) => {
      const now = new Date();
      const endDate = item.endDate ? new Date(item.endDate) : null;
      let expirationStatus = 'Válido';
      let statusColor = 'green';

      if (endDate) {
        const daysDiff = Math.floor((endDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) {
          expirationStatus = `Expirado há ${Math.abs(daysDiff)} dias`;
          statusColor = 'red';
        } else if (daysDiff === 0) {
          expirationStatus = 'Expira Hoje';
          statusColor = 'orange';
        } else if (daysDiff === 1) {
          expirationStatus = 'Expira Amanhã';
          statusColor = 'yellow';
        } else {
          expirationStatus = `${daysDiff} dias restantes`;
          statusColor = 'green';
        }
      }

      const row = worksheet.addRow({
        name: item.name,
        description: item.description || '',
        value: item.value ? `MZN ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '',
        startDate: item.startDate ? new Date(item.startDate).toLocaleDateString('pt-BR') : '',
        endDate: item.endDate ? new Date(item.endDate).toLocaleDateString('pt-BR') : '',
        expirationStatus: expirationStatus,
        createdBy: item.createdBy.name,
        createdAt: new Date(item.createdAt).toLocaleString('pt-BR')
      });

      // Color code expiration status
      const statusCell = row.getCell('expirationStatus');
      if (statusColor === 'red') {
        statusCell.font = { color: { argb: 'FF0000' }, bold: true };
      } else if (statusColor === 'orange') {
        statusCell.font = { color: { argb: 'FF8C00' }, bold: true };
      } else if (statusColor === 'yellow') {
        statusCell.font = { color: { argb: 'FFD700' }, bold: true };
      } else {
        statusCell.font = { color: { argb: '008000' }, bold: true };
      }

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' }
        };
      }
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Add summary section
    const summaryRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${summaryRow}`).value = 'Resumo da Lista';
    worksheet.getCell(`A${summaryRow}`).font = { bold: true, size: 14 };
    
    worksheet.getCell(`A${summaryRow + 1}`).value = `Nome da Lista: ${list.name}`;
    worksheet.getCell(`A${summaryRow + 2}`).value = `Descrição: ${list.description || 'N/A'}`;
    worksheet.getCell(`A${summaryRow + 3}`).value = `Total de Itens: ${items.length}`;
    worksheet.getCell(`A${summaryRow + 4}`).value = `Total de Membros: ${list.members.length}`;
    worksheet.getCell(`A${summaryRow + 5}`).value = `Criado por: ${list.createdBy.name}`;
    worksheet.getCell(`A${summaryRow + 6}`).value = `Data de Exportação: ${new Date().toLocaleString('pt-BR')}`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${list.name}_items_${new Date().toISOString().split('T')[0]}.xlsx"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting list items:', error);
    await logError('EXPORT_ERROR', 'Export list items failed', error);
    res.status(500).json({ error: 'Failed to export list items' });
  }
});

// Test endpoint to manually trigger expiration check
router.post('/test-expiration-check', authenticateToken, async (req, res) => {
  try {
    await triggerExpirationCheck();
    res.json({ message: 'Expiration check triggered successfully' });
  } catch (error) {
    console.error('Error triggering expiration check:', error);
    res.status(500).json({ error: 'Failed to trigger expiration check' });
  }
});

module.exports = router;
