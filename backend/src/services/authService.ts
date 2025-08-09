import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, generateRandomToken, hashToken } from '@/utils/auth';
import { emailService } from '@/utils/emailService';

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  async register(userData: CreateUserData) {
    const { email, name, password, role = 'USER' } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        isEmailVerified: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    return { user, token };
  }

  async login(loginData: LoginData) {
    const { email, password } = loginData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };

    return { user: userResponse, token };
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const hashedToken = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt
      }
    });

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = hashToken(token);

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        expiresAt: { gt: new Date() },
        used: false
      },
      include: { user: true }
    });

    if (!resetRecord) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true }
      })
    ]);

    return { message: 'Password reset successfully' };
  }

  async refreshToken(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { token };
  }
}

export const authService = new AuthService();
