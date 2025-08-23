import { apiService } from '@/lib/axios';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  isRead: boolean;
  sucursalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  description: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const notificationService = {
  // Get all notifications for current user with pagination
  getAll: async (params?: { page?: number; limit?: number; isRead?: boolean }): Promise<NotificationListResponse> => {
    const response = await apiService.get<NotificationListResponse>('/notifications', { params });
    return response.data;
  },

  // Get notification by ID
  getById: async (id: string): Promise<{ notification: Notification }> => {
    const response = await apiService.get<{ notification: Notification }>(`/notifications/${id}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<{ message: string; notification: Notification }> => {
    const response = await apiService.patch<{ message: string; notification: Notification }>(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await apiService.patch<{ message: string }>('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete<{ message: string }>(`/notifications/${id}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiService.get<{ count: number }>('/notifications/count/unread');
    return response.data;
  },

  // Get notifications by type (for filtered views)
  getByType: async (type: string, params?: { page?: number; limit?: number }): Promise<NotificationListResponse> => {
    const response = await apiService.get<NotificationListResponse>(`/notifications/type/${type}`, { params });
    return response.data;
  },

  // Get unread notifications only
  getUnread: async (params?: { page?: number; limit?: number }): Promise<NotificationListResponse> => {
    const response = await apiService.get<NotificationListResponse>('/notifications', {
      params: { ...params, isRead: false }
    });
    return response.data;
  },

  // Get read notifications only
  getRead: async (params?: { page?: number; limit?: number }): Promise<NotificationListResponse> => {
    const response = await apiService.get<NotificationListResponse>('/notifications', {
      params: { ...params, isRead: true }
    });
    return response.data;
  },

  // Create notification (for internal use - typically called by backend)
  create: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await apiService.post<Notification>('/notifications', data);
    return response.data;
  },
};
