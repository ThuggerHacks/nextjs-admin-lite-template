import { Request, Response } from 'express';
import { param, query, body } from 'express-validator';
import { fileService } from '@/services/fileService';
import { asyncHandler, successResponse, errorResponse, handleValidationErrors, parsePagination, paginatedResponse, formatFileSize } from '@/utils/helpers';
import path from 'path';
import fs from 'fs';

class FileController {
  // Validation rules
  getFileValidation = [
    param('id').isUUID().withMessage('Valid file ID is required'),
    handleValidationErrors
  ];

  updateFileValidation = [
    param('id').isUUID().withMessage('Valid file ID is required'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),
    handleValidationErrors
  ];

  deleteFileValidation = [
    param('id').isUUID().withMessage('Valid file ID is required'),
    handleValidationErrors
  ];

  getFilesValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().trim().isLength({ min: 1 }).withMessage('Category must not be empty'),
    handleValidationErrors
  ];

  // Controller methods
  uploadFile = asyncHandler(async (req: any, res: Response) => {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      userId: req.user.id,
      category: req.body.category,
      description: req.body.description
    };

    const file = await fileService.uploadFile(fileData);

    successResponse(res, { 
      file: {
        ...file,
        formattedSize: formatFileSize(file.size)
      }
    }, 'File uploaded successfully', 201);
  });

  uploadMultipleFiles = asyncHandler(async (req: any, res: Response) => {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No files uploaded', 400);
    }

    const uploadPromises = req.files.map((file: any) => {
      const fileData = {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        userId: req.user.id,
        category: req.body.category,
        description: req.body.description
      };

      return fileService.uploadFile(fileData);
    });

    const files = await Promise.all(uploadPromises);

    successResponse(res, { 
      files: files.map(file => ({
        ...file,
        formattedSize: formatFileSize(file.size)
      }))
    }, 'Files uploaded successfully', 201);
  });

  getFileById = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

    const file = await fileService.getFileById(id, userId);

    successResponse(res, { 
      file: {
        ...file,
        formattedSize: formatFileSize(file.size)
      }
    }, 'File retrieved successfully');
  });

  downloadFile = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

    const file = await fileService.getFileById(id, userId);

    // Check if file exists on filesystem
    if (!fs.existsSync(file.path)) {
      return errorResponse(res, 'File not found on server', 404);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  });

  getUserFiles = asyncHandler(async (req: any, res: Response) => {
    const { page, limit } = parsePagination(req);
    const userId = req.user.id;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const result = await fileService.getUserFiles(userId, page, limit, category, search);

    const filesWithFormattedSize = result.files.map(file => ({
      ...file,
      formattedSize: formatFileSize(file.size)
    }));

    paginatedResponse(res, filesWithFormattedSize, page, limit, result.total, 'User files retrieved successfully');
  });

  getAllFiles = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req);
    const filters = {
      category: req.query.category as string,
      userId: req.query.userId as string,
      search: req.query.search as string
    };

    const result = await fileService.getAllFiles(page, limit, filters);

    const filesWithFormattedSize = result.files.map(file => ({
      ...file,
      formattedSize: formatFileSize(file.size)
    }));

    paginatedResponse(res, filesWithFormattedSize, page, limit, result.total, 'Files retrieved successfully');
  });

  updateFile = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

    const file = await fileService.updateFile(id, updateData, userId);

    successResponse(res, { 
      file: {
        ...file,
        formattedSize: formatFileSize(file.size)
      }
    }, 'File updated successfully');
  });

  deleteFile = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

    const result = await fileService.deleteFile(id, userId);

    successResponse(res, null, result.message);
  });

  getFileStats = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

    const stats = await fileService.getFileStats(userId);

    const formattedStats = {
      ...stats,
      totalSize: formatFileSize(stats.totalSize),
      categoryStats: stats.categoryStats.map(stat => ({
        ...stat,
        formattedSize: formatFileSize(stat.size)
      }))
    };

    successResponse(res, { stats: formattedStats }, 'File statistics retrieved successfully');
  });

  getFilesByCategory = asyncHandler(async (req: any, res: Response) => {
    const { category } = req.params;
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

    const files = await fileService.getFilesByCategory(category, userId);

    const filesWithFormattedSize = files.map(file => ({
      ...file,
      formattedSize: formatFileSize(file.size)
    }));

    successResponse(res, { files: filesWithFormattedSize }, `Files in category '${category}' retrieved successfully`);
  });
}

export const fileController = new FileController();
