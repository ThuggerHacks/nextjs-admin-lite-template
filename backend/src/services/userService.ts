import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  isEmailVerified?: boolean;
}

interface UserFilters {
  role?: string;
  isEmailVerified?: boolean;
  search?: string;
}

class UserService {
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filters: UserFilters = {},
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filters.role) {
      where.role = filters.role;
    }
    
    if (filters.isEmailVerified !== undefined) {
      where.isEmailVerified = filters.isEmailVerified;
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return { users, total, page, limit };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateData: UpdateUserData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      });

      if (emailExists) {
        throw new Error('Email already in use');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id }
    });

    return { message: 'User deleted successfully' };
  }

  async getUserStats() {
    const [totalUsers, verifiedUsers, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isEmailVerified: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    return {
      totalUsers,
      verifiedUsers,
      recentUsers,
      roleStats: roleStats.reduce((acc, item) => {
        acc[item.role] = item._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async changeUserPassword(id: string, newPassword: string) {
    const { hashPassword } = await import('@/utils/auth');
    
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return { message: 'Password updated successfully' };
  }
}

export const userService = new UserService();
