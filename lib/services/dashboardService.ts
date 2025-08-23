import api from './api';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: Record<string, number>;
  };
  departments: {
    total: number;
    withSupervisor: number;
    withoutSupervisor: number;
  };
  files: {
    total: number;
    totalSize: number;
    byType: Record<string, number>;
  };
  goals: {
    total: number;
    published: number;
    completed: number;
    inProgress: number;
    byStatus: Record<string, number>;
  };
  reports: {
    total: number;
    pending: number;
    reviewed: number;
    archived: number;
  };
  libraries: {
    total: number;
    totalFiles: number;
  };
  scans: {
    total: number;
    withPdf: number;
    totalFiles: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
  storage: {
    used: number;
    available: number;
    total: number;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
  };
  lastChecked: string;
}

export interface UserActivity {
  userId: string;
  userName: string;
  userEmail: string;
  lastLogin?: string;
  actionsToday: number;
  actionsThisWeek: number;
  actionsThisMonth: number;
}

export const dashboardService = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 10): Promise<ActivityLog[]> => {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    return response.data.data;
  },

  // Get system health
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await api.get('/dashboard/health');
    return response.data.data;
  },

  // Get user activity
  getUserActivity: async (days: number = 7): Promise<UserActivity[]> => {
    const response = await api.get(`/dashboard/user-activity?days=${days}`);
    return response.data.data;
  },

  // Get charts data for analytics
  getChartsData: async (period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<{
    userGrowth: Array<{ date: string; count: number }>;
    fileUploads: Array<{ date: string; count: number; size: number }>;
    goalCompletion: Array<{ date: string; completed: number; created: number }>;
    reportSubmissions: Array<{ date: string; count: number }>;
  }> => {
    const response = await api.get(`/dashboard/charts?period=${period}`);
    return response.data.data;
  },

  // Get performance metrics
  getPerformanceMetrics: async (): Promise<{
    averageResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    successRate: number;
  }> => {
    const response = await api.get('/dashboard/performance');
    return response.data.data;
  },

  // Get top users by activity
  getTopUsers: async (limit: number = 5): Promise<Array<{
    userId: string;
    userName: string;
    userEmail: string;
    activityScore: number;
    goalsCompleted: number;
    reportsSubmitted: number;
    filesUploaded: number;
  }>> => {
    const response = await api.get(`/dashboard/top-users?limit=${limit}`);
    return response.data.data;
  },

  // Get alerts and warnings
  getAlerts: async (): Promise<Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }>> => {
    const response = await api.get('/dashboard/alerts');
    return response.data.data;
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId: string): Promise<void> => {
    await api.post(`/dashboard/alerts/${alertId}/acknowledge`);
  },

  // Get storage usage breakdown
  getStorageBreakdown: async (): Promise<{
    users: Array<{ userId: string; userName: string; used: number }>;
    departments: Array<{ departmentId: string; departmentName: string; used: number }>;
    libraries: Array<{ libraryId: string; libraryName: string; used: number }>;
    fileTypes: Array<{ type: string; count: number; size: number }>;
  }> => {
    const response = await api.get('/dashboard/storage-breakdown');
    return response.data.data;
  },

  // Export dashboard data
  exportData: async (format: 'csv' | 'excel' | 'pdf', sections: string[]): Promise<Blob> => {
    const response = await api.post('/dashboard/export', {
      format,
      sections,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },
};
