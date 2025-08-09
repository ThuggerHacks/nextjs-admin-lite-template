import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FileUploadData {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  userId: string;
  category?: string;
  description?: string;
}

class FileService {
  async uploadFile(fileData: FileUploadData) {
    const file = await prisma.file.create({
      data: {
        originalName: fileData.originalName,
        filename: fileData.filename,
        mimetype: fileData.mimetype,
        size: fileData.size,
        path: fileData.path,
        userId: fileData.userId,
        category: fileData.category || 'general',
        description: fileData.description
      }
    });

    return file;
  }

  async getFileById(id: string, userId?: string) {
    const where: any = { id };
    
    // If userId is provided, ensure user can only access their own files
    // unless they are admin
    if (userId) {
      where.userId = userId;
    }

    const file = await prisma.file.findUnique({
      where,
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

    if (!file) {
      throw new Error('File not found');
    }

    return file;
  }

  async getUserFiles(
    userId: string,
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { userId };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originalName: true,
          filename: true,
          mimetype: true,
          size: true,
          category: true,
          description: true,
          createdAt: true
        }
      }),
      prisma.file.count({ where })
    ]);

    return { files, total, page, limit };
  }

  async getAllFiles(
    page: number = 1,
    limit: number = 10,
    filters: { category?: string; userId?: string; search?: string } = {}
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.search) {
      where.OR = [
        { originalName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.file.count({ where })
    ]);

    return { files, total, page, limit };
  }

  async updateFile(id: string, updateData: { description?: string; category?: string }, userId?: string) {
    const where: any = { id };
    
    if (userId) {
      where.userId = userId;
    }

    const file = await prisma.file.findUnique({ where });
    
    if (!file) {
      throw new Error('File not found');
    }

    const updatedFile = await prisma.file.update({
      where: { id },
      data: updateData
    });

    return updatedFile;
  }

  async deleteFile(id: string, userId?: string) {
    const where: any = { id };
    
    if (userId) {
      where.userId = userId;
    }

    const file = await prisma.file.findUnique({ where });
    
    if (!file) {
      throw new Error('File not found');
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    // Delete file record from database
    await prisma.file.delete({ where: { id } });

    return { message: 'File deleted successfully' };
  }

  async getFileStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [totalFiles, totalSize, categoryStats] = await Promise.all([
      prisma.file.count({ where }),
      prisma.file.aggregate({
        where,
        _sum: { size: true }
      }),
      prisma.file.groupBy({
        by: ['category'],
        where,
        _count: { id: true },
        _sum: { size: true }
      })
    ]);

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      categoryStats: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.id,
        size: stat._sum.size || 0
      }))
    };
  }

  async getFilesByCategory(category: string, userId?: string) {
    const where: any = { category };
    
    if (userId) {
      where.userId = userId;
    }

    const files = await prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        filename: true,
        mimetype: true,
        size: true,
        description: true,
        createdAt: true
      }
    });

    return files;
  }
}

export const fileService = new FileService();
