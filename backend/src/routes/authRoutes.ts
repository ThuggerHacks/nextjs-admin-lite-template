import express from 'express';
import { authController } from '@/controllers/authController';
import { authenticate } from '@/middlewares/auth';

const router = express.Router();

// Public routes
router.post('/register', authController.registerValidation, authController.register);
router.post('/login', authController.loginValidation, authController.login);
router.post('/forgot-password', authController.forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', authController.resetPasswordValidation, authController.resetPassword);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);

export default router;
