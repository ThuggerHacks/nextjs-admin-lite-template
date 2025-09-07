const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
// Remove getCurrentSucursal import as it's not available in backend
const ExcelJS = require('exceljs');

const router = express.Router();
const prisma = new PrismaClient();

// Get temperatures with optional date filtering
router.get('/', authenticateToken, [
  query('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, startDate, endDate, limit = 300 } = req.query;
    const sucursalId = req.user.sucursalId;

    let whereClause = {
      sucursalId: sucursalId
    };

    // Handle date filtering
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.recordedAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (startDate && endDate) {
      whereClause.recordedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const temperatures = await prisma.temperature.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        recordedAt: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: temperatures
    });
  } catch (error) {
    console.error('Error fetching temperatures:', error);
    res.status(500).json({ error: 'Failed to fetch temperatures' });
  }
});

// Create new temperature record
router.post('/', authenticateToken, [
  body('temperature').isFloat({ min: 0, max: 100 }).withMessage('Temperature must be between 0 and 100 degrees Celsius'),
  body('recordedAt').optional().isISO8601().withMessage('Recorded date must be a valid ISO date'),
], async (req, res) => {
  try {
    console.log('Temperature creation request:', req.body);
    console.log('User from token:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { temperature, recordedAt } = req.body;
    const userId = req.user.id;
    const sucursalId = req.user.sucursalId;

    console.log('Creating temperature record:', { temperature, recordedAt, userId, sucursalId });

    const temperatureRecord = await prisma.temperature.create({
      data: {
        temperature: parseFloat(temperature),
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        userId: userId,
        sucursalId: sucursalId
      },
      include: {
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
      success: true,
      data: temperatureRecord,
      message: 'Temperature recorded successfully'
    });
  } catch (error) {
    console.error('Error creating temperature record:', error);
    res.status(500).json({ error: 'Failed to create temperature record' });
  }
});

// Get temperature statistics for a specific date
router.get('/stats/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const sucursalId = req.user.sucursalId;

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const temperatures = await prisma.temperature.findMany({
      where: {
        sucursalId: sucursalId,
        recordedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        recordedAt: 'asc'
      }
    });

    if (temperatures.length === 0) {
      return res.json({
        success: true,
        data: {
          count: 0,
          average: 0,
          min: 0,
          max: 0,
          temperatures: []
        }
      });
    }

    const temps = temperatures.map(t => t.temperature);
    const stats = {
      count: temperatures.length,
      average: temps.reduce((a, b) => a + b, 0) / temps.length,
      min: Math.min(...temps),
      max: Math.max(...temps),
      temperatures: temperatures.map(t => ({
        temperature: t.temperature,
        recordedAt: t.recordedAt,
        userId: t.userId
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching temperature stats:', error);
    res.status(500).json({ error: 'Failed to fetch temperature statistics' });
  }
});

// Export temperatures to Excel
router.get('/export', authenticateToken, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
], async (req, res) => {
  try {
    console.log('Starting temperature export...');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = req.query;
    const sucursalId = req.user.sucursalId;
    console.log('Export parameters:', { startDate, endDate, sucursalId });

    let whereClause = {
      sucursalId: sucursalId
    };

    if (startDate && endDate) {
      whereClause.recordedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const temperatures = await prisma.temperature.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        recordedAt: 'desc'
      }
    });

    console.log(`Found ${temperatures.length} temperature records for export`);

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados de Temperatura');

    // Define columns with Portuguese headers
    worksheet.columns = [
      { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
      { header: 'Registrado Em', key: 'recordedAt', width: 25 },
      { header: 'Nome do Usuário', key: 'userName', width: 25 },
      { header: 'Email do Usuário', key: 'userEmail', width: 35 }
    ];

    // Add data rows
    temperatures.forEach(temp => {
      worksheet.addRow({
        temperature: temp.temperature,
        recordedAt: temp.recordedAt.toLocaleString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        userName: temp.user.name,
        userEmail: temp.user.email
      });
    });

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' } // Blue background
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' } // White text
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });

    // Style data rows with alternating colors and borders
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const isEvenRow = (rowNumber - 1) % 2 === 0;
        
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEvenRow ? 'FFF8F9FA' : 'FFFFFFFF' } // Light gray for even rows, white for odd
          };
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
      }
    });

    // Add summary statistics
    if (temperatures.length > 0) {
      const temps = temperatures.map(t => t.temperature);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      
      // Add empty row
      worksheet.addRow([]);
      
      // Add summary rows
      const summaryRows = [
        ['RESUMO', '', '', '', ''],
        ['Total de Registros', temperatures.length, '', '', ''],
        ['Temperatura Mínima', `${minTemp.toFixed(1)}°C`, '', '', ''],
        ['Temperatura Máxima', `${maxTemp.toFixed(1)}°C`, '', '', ''],
        ['Temperatura Média', `${avgTemp.toFixed(1)}°C`, '', '', '']
      ];
      
      summaryRows.forEach((rowData, index) => {
        const row = worksheet.addRow(rowData);
        
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE7F3FF' } // Light blue background
          };
          cell.font = {
            bold: index === 0, // Bold for "RESUMO" row
            color: { argb: 'FF000000' }
          };
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
      });
    }

    // Add a temperature chart data worksheet (without actual chart for now)
    if (temperatures.length > 0 && temperatures.length < 1000) { // Limit to prevent memory issues
      try {
        console.log('Creating chart data worksheet...');
        // Prepare chart data - create hourly data points
        const chartData = [];
        const hourlyData = {};
        
        // Group temperatures by hour
        temperatures.forEach(temp => {
          const hour = new Date(temp.recordedAt).getHours();
          if (!hourlyData[hour]) {
            hourlyData[hour] = [];
          }
          hourlyData[hour].push(temp.temperature);
        });
        
        // Create hourly averages for the chart
        for (let hour = 0; hour < 24; hour++) {
          const temps = hourlyData[hour] || [];
          const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
          
          chartData.push({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            temperature: avgTemp || 0 // Use 0 instead of null
          });
        }
        
        // Add chart data to a new worksheet
        const chartWorksheet = workbook.addWorksheet('Dados do Gráfico');
        
        // Add chart data
        chartWorksheet.addRow(['Hora', 'Temperatura (°C)']);
        chartData.forEach(data => {
          chartWorksheet.addRow([data.hour, data.temperature]);
        });
        
        // Style chart worksheet
        chartWorksheet.getRow(1).eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
          };
          cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' }
          };
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Style data rows
        chartWorksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            row.eachCell((cell) => {
              cell.alignment = {
                horizontal: 'center',
                vertical: 'middle'
              };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            });
          }
        });
        
        // Set column widths
        chartWorksheet.columns = [
          { header: 'Hora', key: 'hour', width: 15 },
          { header: 'Temperatura (°C)', key: 'temperature', width: 20 }
        ];
        
        console.log('Chart data worksheet created successfully');
      } catch (chartError) {
        console.error('Error creating chart data worksheet:', chartError);
        // Continue without chart data
      }
    }

    // Generate Excel buffer
    try {
      const excelBuffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      const filename = `dados_temperatura_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(excelBuffer);
    } catch (excelError) {
      console.error('Error generating Excel buffer:', excelError);
      res.status(500).json({ error: 'Failed to generate Excel file' });
    }
  } catch (error) {
    console.error('Error exporting temperatures:', error);
    res.status(500).json({ error: 'Failed to export temperature data' });
  }
});

// Delete temperature record (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const { id } = req.params;
    const sucursalId = req.user.sucursalId;

    const temperature = await prisma.temperature.findFirst({
      where: {
        id: id,
        sucursalId: sucursalId
      }
    });

    if (!temperature) {
      return res.status(404).json({ error: 'Temperature record not found' });
    }

    await prisma.temperature.delete({
      where: { id: id }
    });

    res.json({
      success: true,
      message: 'Temperature record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting temperature record:', error);
    res.status(500).json({ error: 'Failed to delete temperature record' });
  }
});

module.exports = router;
