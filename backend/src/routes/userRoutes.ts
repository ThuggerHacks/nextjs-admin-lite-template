import express from 'express';
import { userController } from '@/controllers/userController';
import { authenticate, authorize } from '@/middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User profile routes (accessible by the user themselves)
router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateCurrentUser);

// Admin only routes
router.get('/', authorize('ADMIN'), userController.getUsersValidation, userController.getAllUsers);
router.get('/stats', authorize('ADMIN'), userController.getUserStats);
router.get('/:id', authorize('ADMIN'), userController.getUserValidation, userController.getUserById);
router.put('/:id', authorize('ADMIN'), userController.updateUserValidation, userController.updateUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUserValidation, userController.deleteUser);
router.patch('/:id/password', authorize('ADMIN'), userController.changePasswordValidation, userController.changeUserPassword);

export default router;
