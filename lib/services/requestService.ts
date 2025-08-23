import api from './api';

export interface UserRequest {
  id: string;
  type: 'account' | 'access' | 'support' | 'feature';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  response?: string;
}

export interface CreateRequestData {
  type: 'account' | 'access' | 'support' | 'feature';
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateRequestData {
  status?: 'pending' | 'approved' | 'rejected' | 'in_review';
  response?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  inReview: number;
  byType: {
    account: number;
    access: number;
    support: number;
    feature: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface RequestsResponse {
  requests: UserRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const requestService = {
  // Get all requests (admin only)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    priority?: string;
  }): Promise<RequestsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.priority) queryParams.append('priority', params.priority);

      const response = await api.get(`/requests?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      throw error;
    }
  },

  // Get request by ID
  getById: async (id: string): Promise<UserRequest> => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data.request;
    } catch (error) {
      console.error(`Failed to fetch request ${id}:`, error);
      throw error;
    }
  },

  // Create new request
  create: async (data: CreateRequestData): Promise<UserRequest> => {
    try {
      const response = await api.post('/requests', data);
      return response.data.request;
    } catch (error) {
      console.error('Failed to create request:', error);
      throw error;
    }
  },

  // Update request
  update: async (id: string, data: UpdateRequestData): Promise<UserRequest> => {
    try {
      const response = await api.put(`/requests/${id}`, data);
      return response.data.request;
    } catch (error) {
      console.error(`Failed to update request ${id}:`, error);
      throw error;
    }
  },

  // Delete request
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/requests/${id}`);
    } catch (error) {
      console.error(`Failed to delete request ${id}:`, error);
      throw error;
    }
  },

  // Approve request
  approve: async (id: string, response?: string): Promise<UserRequest> => {
    try {
      const responseData = await api.post(`/requests/${id}/approve`, { response });
      return responseData.data.request;
    } catch (error) {
      console.error(`Failed to approve request ${id}:`, error);
      throw error;
    }
  },

  // Reject request
  reject: async (id: string, response?: string): Promise<UserRequest> => {
    try {
      const responseData = await api.post(`/requests/${id}/reject`, { response });
      return responseData.data.request;
    } catch (error) {
      console.error(`Failed to reject request ${id}:`, error);
      throw error;
    }
  },

  // Get user's own requests
  getMyRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<RequestsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await api.get(`/requests/my?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch my requests:', error);
      throw error;
    }
  },

  // Get request statistics
  getStats: async (): Promise<RequestStats> => {
    try {
      const response = await api.get('/requests/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch request statistics:', error);
      throw error;
    }
  },

  // Bulk update requests
  bulkUpdate: async (updates: Array<{ id: string; data: UpdateRequestData }>): Promise<UserRequest[]> => {
    try {
      const response = await api.put('/requests/bulk', { updates });
      return response.data.requests || [];
    } catch (error) {
      console.error('Failed to bulk update requests:', error);
      throw error;
    }
  },

  // Search requests
  search: async (query: string, filters?: {
    status?: string;
    type?: string;
    priority?: string;
  }): Promise<UserRequest[]> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.priority) queryParams.append('priority', filters.priority);

      const response = await api.get(`/requests/search?${queryParams.toString()}`);
      return response.data.requests || [];
    } catch (error) {
      console.error('Failed to search requests:', error);
      throw error;
    }
  },

  // Get requests by department
  getByDepartment: async (departmentId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<RequestsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await api.get(`/requests/department/${departmentId}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch requests for department ${departmentId}:`, error);
      throw error;
    }
  },
};
