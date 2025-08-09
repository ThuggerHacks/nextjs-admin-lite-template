// User types
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

// File types
export interface File {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  category: string;
  description?: string;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

// Password Reset types
export interface PasswordReset {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// File upload types
export interface FileUploadData {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  userId: string;
  category?: string;
  description?: string;
}

// Request extensions
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Query parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  role?: UserRole;
  isEmailVerified?: boolean;
  search?: string;
}

export interface FileFilters {
  category?: string;
  userId?: string;
  search?: string;
}

// Statistics types
export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  recentUsers: number;
  roleStats: Record<string, number>;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  categoryStats: Array<{
    category: string;
    count: number;
    size: number;
  }>;
}

// Email types
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

// Environment variables
export interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_SECURE: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  FROM_NAME: string;
  FROM_EMAIL: string;
}
