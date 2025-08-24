import api from './api';
import { User, UserRole } from '@/types';
import { apiService } from '@/lib/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  departmentId: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    // Set auth token in axios instance
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
    }
    return response.data;
  },

  // Register new user
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout(): void {
    // Clear all storage immediately without API calls
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    apiService.clearAuthToken();
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await apiService.get<{ user: User }>('/auth/profile');
    return response.data.user;
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<{ user: User }>('/auth/profile', data);
    return response.data.user;
  },

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiService.put<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<{ profilePicture: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.upload<{ profilePicture: string }>('/auth/upload-profile-picture', formData);
    return response.data;
  },

  // Verify token validity
  async verifyToken(): Promise<boolean> {
    try {
      const response = await apiService.get('/auth/verify');
      return response.data.valid;
    } catch {
      return false;
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Approve user (Admin/Supervisor only)
  async approveUser(userId: string): Promise<{ message: string; user: User; rootFolder: any }> {
    const response = await apiService.patch<{ message: string; user: User; rootFolder: any }>(`/auth/approve/${userId}`);
    return response.data;
  },
};
