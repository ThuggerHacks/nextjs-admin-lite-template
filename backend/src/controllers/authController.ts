import { Request, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '@/services/authService';
import { asyncHandler, successResponse, errorResponse, handleValidationErrors } from '@/utils/helpers';

class AuthController {
  // Validation rules
  registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['USER', 'ADMIN', 'MANAGER']).withMessage('Invalid role'),
    handleValidationErrors
  ];

  loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ];

  resetPasswordValidation = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
  ];

  forgotPasswordValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    handleValidationErrors
  ];

  // Controller methods
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, password, role } = req.body;

    const result = await authService.register({ email, name, password, role });

    successResponse(res, result, 'User registered successfully', 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    successResponse(res, result, 'Login successful');
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await authService.requestPasswordReset(email);

    successResponse(res, null, result.message);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const result = await authService.resetPassword(token, password);

    successResponse(res, null, result.message);
  });

  refreshToken = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;

    const result = await authService.refreshToken(userId);

    successResponse(res, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    // For JWT, logout is handled on the client side
    // You might want to implement token blacklisting here
    successResponse(res, null, 'Logout successful');
  });

  getProfile = asyncHandler(async (req: any, res: Response) => {
    const user = req.user;

    successResponse(res, { user }, 'Profile retrieved successfully');
  });
}

export const authController = new AuthController();
