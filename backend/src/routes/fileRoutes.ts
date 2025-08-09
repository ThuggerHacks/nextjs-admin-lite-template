import express from 'express';
import { fileController } from '@/controllers/fileController';
import { authenticate, authorize } from '@/middlewares/auth';
import { uploadSingle, uploadMultiple } from '@/middlewares/upload';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// File upload routes
router.post('/upload', uploadSingle('file'), fileController.uploadFile);
router.post('/upload-multiple', uploadMultiple('files', 5), fileController.uploadMultipleFiles);

// File management routes
router.get('/my-files', fileController.getFilesValidation, fileController.getUserFiles);
router.get('/stats', fileController.getFileStats);
router.get('/category/:category', fileController.getFilesByCategory);
router.get('/:id', fileController.getFileValidation, fileController.getFileById);
router.get('/:id/download', fileController.getFileValidation, fileController.downloadFile);
router.put('/:id', fileController.updateFileValidation, fileController.updateFile);
router.delete('/:id', fileController.deleteFileValidation, fileController.deleteFile);

// Admin routes
router.get('/', authorize('ADMIN'), fileController.getFilesValidation, fileController.getAllFiles);

export default router;
