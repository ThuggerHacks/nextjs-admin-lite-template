import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  departmentId?: string;
  supervisorId?: string;
  sucursalId: string;
  phone?: string;
  address?: string;
  avatar?: string;
  lastLogin?: string;
  isDepartmentAdmin?: boolean;
  managedDepartments?: string[];
  createdAt: string;
  updatedAt: string;
  department?: {
    id: string;
    name: string;
    description?: string;
  };
  supervisor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  subordinates?: User[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role?: 'USER' | 'SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN';
  departmentId?: string;
  supervisorId?: string;
  phone?: string;
  address?: string;
  isDepartmentAdmin?: boolean;
  managedDepartments?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'USER' | 'SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN';
  departmentId?: string;
  supervisorId?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  isDepartmentAdmin?: boolean;
  managedDepartments?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  byRole: {
    USER: number;
    SUPERVISOR: number;
    ADMIN: number;
    SUPER_ADMIN: number;
    DEVELOPER: number;
  };
  byDepartment: Array<{
    departmentId: string;
    departmentName: string;
    count: number;
  }>;
}

export const userService = {
  // Get all users with pagination and filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    departmentId?: string;
  }): Promise<UsersResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.role) queryParams.append('role', params.role);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.departmentId) queryParams.append('departmentId', params.departmentId);

      const response = await api.get(`/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.user;
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw error;
    }
  },

  // Create new user
  create: async (data: CreateUserRequest): Promise<User> => {
    try {
      const response = await api.post('/users', data);
      return response.data.user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  // Update user
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data.user;
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/users/profile');
      return response.data.user;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<UpdateUserRequest>): Promise<User> => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data.user;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    try {
      await api.post('/users/change-password', data);
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },

  // Promote user to super admin
  promoteToSuperAdmin: async (userId: string): Promise<User> => {
    try {
      const response = await api.post(`/users/${userId}/promote-to-superadmin`);
      return response.data.user;
    } catch (error) {
      console.error(`Failed to promote user ${userId} to super admin:`, error);
      throw error;
    }
  },

  // Reset password (admin only)
  resetPassword: async (userId: string): Promise<{ tempPassword: string }> => {
    try {
      const response = await api.post(`/users/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      console.error(`Failed to reset password for user ${userId}:`, error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (data: ResetPasswordRequest): Promise<void> => {
    try {
      await api.post('/users/request-password-reset', data);
    } catch (error) {
      console.error('Failed to request password reset:', error);
      throw error;
    }
  },

  // Approve user (admin/supervisor only)
  approve: async (userId: string): Promise<User> => {
    try {
      const response = await api.post(`/users/${userId}/approve`);
      return response.data.user;
    } catch (error) {
      console.error(`Failed to approve user ${userId}:`, error);
      throw error;
    }
  },

  // Reject user (admin/supervisor only)
  reject: async (userId: string, reason?: string): Promise<void> => {
    try {
      await api.post(`/users/${userId}/reject`, { reason });
    } catch (error) {
      console.error(`Failed to reject user ${userId}:`, error);
      throw error;
    }
  },

  // Promote user to admin
  promoteToAdmin: async (userId: string): Promise<User> => {
    try {
      const response = await api.post(`/users/${userId}/promote-admin`);
      return response.data.user;
    } catch (error) {
      console.error(`Failed to promote user ${userId} to admin:`, error);
      throw error;
    }
  },

  // Get user files
  getUserFiles: async (userId: string): Promise<{ files: any[], folders: any[], rootFolder: any }> => {
    try {
      const response = await api.get(`/users/${userId}/files`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get files for user ${userId}:`, error);
      throw error;
    }
  },

  // Demote user from admin
  demoteFromAdmin: async (userId: string): Promise<User> => {
    try {
      const response = await api.post(`/users/${userId}/demote-admin`);
      return response.data.user;
    } catch (error) {
      console.error(`Failed to demote user ${userId} from admin:`, error);
      throw error;
    }
  },

  // Promote user to super admin
  promoteToSuperAdmin: async (userId: string): Promise<User> => {
    try {
      const response = await api.post(`/users/${userId}/promote-to-superadmin`);
      return response.data.user;
    } catch (error) {
      console.error(`Failed to promote user ${userId} to super admin:`, error);
      throw error;
    }
  },

  // Get user statistics
  getStats: async (): Promise<UserStats> => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
      throw error;
    }
  },

  // Get users by department
  getByDepartment: async (departmentId: string): Promise<User[]> => {
    try {
      const response = await api.get(`/departments/${departmentId}/users`);
      return response.data.users || [];
    } catch (error) {
      console.error(`Failed to fetch users for department ${departmentId}:`, error);
      throw error;
    }
  },

  // Get subordinates (for supervisors)
  getSubordinates: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users/subordinates');
      return response.data.users || [];
    } catch (error) {
      console.error('Failed to fetch subordinates:', error);
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ avatar: string }> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  },



  // Bulk operations
  bulkCreate: async (users: CreateUserRequest[]): Promise<User[]> => {
    try {
      const response = await api.post('/users/bulk', { users });
      return response.data.users || [];
    } catch (error) {
      console.error('Failed to bulk create users:', error);
      throw error;
    }
  },

  bulkUpdate: async (updates: Array<{ id: string; data: UpdateUserRequest }>): Promise<User[]> => {
    try {
      const response = await api.put('/users/bulk', { updates });
      return response.data.users || [];
    } catch (error) {
      console.error('Failed to bulk update users:', error);
      throw error;
    }
  },

  bulkDelete: async (userIds: string[]): Promise<void> => {
    try {
      await api.post('/users/bulk-delete', { userIds });
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
      throw error;
    }
  },

  // Export users
  exportToCSV: async (filters?: {
    role?: string;
    status?: string;
    departmentId?: string;
  }): Promise<string> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.departmentId) queryParams.append('departmentId', filters.departmentId);

      const response = await api.get(`/users/export/csv?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return 'Export completed';
    } catch (error) {
      console.error('Failed to export users:', error);
      throw error;
    }
  },

  // Search users
  search: async (query: string, filters?: {
    role?: string;
    status?: string;
    departmentId?: string;
  }): Promise<User[]> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.departmentId) queryParams.append('departmentId', filters.departmentId);

      const response = await api.get(`/users/search?${queryParams.toString()}`);
      return response.data.users || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  },
};
