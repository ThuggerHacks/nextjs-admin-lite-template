import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation result handler middleware
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

/**
 * Success response utility
 */
export const successResponse = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response utility
 */
export const errorResponse = (
  res: Response,
  message: string = 'Internal server error',
  statusCode: number = 500,
  details?: any
): void => {
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details })
  });
};

/**
 * Paginated response utility
 */
export const paginatedResponse = (
  res: Response,
  data: any[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success'
): void => {
  const totalPages = Math.ceil(total / limit);
  
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
};

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * File size formatter
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate slug from string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

/**
 * Parse pagination parameters
 */
export const parsePagination = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Parse sort parameters
 */
export const parseSort = (req: Request, defaultField: string = 'createdAt') => {
  const sortBy = (req.query.sortBy as string) || defaultField;
  const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';
  
  return { [sortBy]: sortOrder };
};
