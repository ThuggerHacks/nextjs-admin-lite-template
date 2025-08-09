import { Request, Response } from 'express';
import { body, query, param } from 'express-validator';
import { userService } from '@/services/userService';
import { asyncHandler, successResponse, errorResponse, handleValidationErrors, parsePagination, parseSort, paginatedResponse } from '@/utils/helpers';

class UserController {
  // Validation rules
  updateUserValidation = [
    param('id').isUUID().withMessage('Valid user ID is required'),
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['USER', 'ADMIN', 'MANAGER']).withMessage('Invalid role'),
    body('isEmailVerified').optional().isBoolean().withMessage('isEmailVerified must be a boolean'),
    handleValidationErrors
  ];

  getUserValidation = [
    param('id').isUUID().withMessage('Valid user ID is required'),
    handleValidationErrors
  ];

  deleteUserValidation = [
    param('id').isUUID().withMessage('Valid user ID is required'),
    handleValidationErrors
  ];

  changePasswordValidation = [
    param('id').isUUID().withMessage('Valid user ID is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
  ];

  getUsersValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['USER', 'ADMIN', 'MANAGER']).withMessage('Invalid role filter'),
    query('isEmailVerified').optional().isBoolean().withMessage('isEmailVerified must be a boolean'),
    query('sortBy').optional().isIn(['name', 'email', 'createdAt', 'lastLoginAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    handleValidationErrors
  ];

  // Controller methods
  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req);
    const sortOptions = parseSort(req, 'createdAt');
    
    const filters = {
      role: req.query.role as string,
      isEmailVerified: req.query.isEmailVerified ? req.query.isEmailVerified === 'true' : undefined,
      search: req.query.search as string
    };

    const sortBy = Object.keys(sortOptions)[0];
    const sortOrder = Object.values(sortOptions)[0] as 'asc' | 'desc';

    const result = await userService.getAllUsers(page, limit, filters, sortBy, sortOrder);

    paginatedResponse(res, result.users, page, limit, result.total, 'Users retrieved successfully');
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    successResponse(res, { user }, 'User retrieved successfully');
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const user = await userService.updateUser(id, updateData);

    successResponse(res, { user }, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await userService.deleteUser(id);

    successResponse(res, null, result.message);
  });

  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await userService.getUserStats();

    successResponse(res, { stats }, 'User statistics retrieved successfully');
  });

  changeUserPassword = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password } = req.body;

    const result = await userService.changeUserPassword(id, password);

    successResponse(res, null, result.message);
  });

  getCurrentUser = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;

    const user = await userService.getUserById(userId);

    successResponse(res, { user }, 'Current user retrieved successfully');
  });

  updateCurrentUser = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const { name, email } = req.body; // Don't allow role changes for current user

    const user = await userService.updateUser(userId, { name, email });

    successResponse(res, { user }, 'Profile updated successfully');
  });
}

export const userController = new UserController();
