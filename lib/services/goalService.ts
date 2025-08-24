import api from './api';

export interface Goal {
  id: string;
  name: string; // Backend uses 'name' not 'title'
  description: string;
  departmentId: string;
  createdById: string;
  sucursalId: string;
  startDate: string; // Backend uses 'startDate'
  endDate: string; // Backend uses 'endDate'
  status: string;
  priority?: string;
  progress?: number; // Backend has progress field
  createdAt: string;
  updatedAt: string;
  department?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignments?: GoalAssignment[];
  reports?: GoalReport[];
}

export interface GoalAssignment {
  id: string;
  goalId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface GoalReport {
  id: string;
  goalId: string;
  submittedById: string;
  title: string;
  description: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  isCompletion: boolean;
  createdAt: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface GoalFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: string;
}

export interface GoalListResponse {
  goals: Goal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateGoalRequest {
  name: string; // Backend expects 'name'
  description: string;
  departmentId: string;
  startDate: string; // Backend expects 'startDate'
  endDate: string; // Backend expects 'endDate'
  timeline?: string; // Backend also accepts 'timeline' as endDate
  priority?: string;
  userIds: string[]; // Backend expects 'userIds'
  isDepartmentGoal?: boolean; // New field for department goals
}

export interface UpdateGoalRequest {
  name?: string;
  description?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  timeline?: string; // Backend also accepts 'timeline' as endDate
  priority?: string;
  status?: string;
  userIds?: string[];
  isDepartmentGoal?: boolean;
}

export interface CreateGoalReportRequest {
  title: string;
  description: string;
  fileId?: string;
  isCompletion?: boolean;
}

export interface UpdateGoalProgressRequest {
  progress: number;
  status: string;
}

export const goalService = {
  // Get all goals
  getAll: async (filters?: GoalFilters): Promise<GoalListResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    
    const queryString = params.toString();
    const url = queryString ? `/goals?${queryString}` : '/goals';
    
    const response = await api.get(url);
    return response.data;
  },

  // Get goal by ID
  getById: async (id: string): Promise<Goal> => {
    const response = await api.get(`/goals/${id}`);
    return response.data.goal || response.data;
  },

  // Create new goal
  create: async (data: CreateGoalRequest): Promise<Goal> => {
    const response = await api.post('/goals', data);
    return response.data;
  },

  // Update goal
  update: async (id: string, data: UpdateGoalRequest): Promise<Goal> => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  // Delete goal
  delete: async (id: string): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },

  // Publish goal
  publish: async (id: string): Promise<Goal> => {
    const response = await api.post(`/goals/${id}/publish`);
    return response.data;
  },

  // Unpublish goal
  unpublish: async (id: string): Promise<Goal> => {
    const response = await api.post(`/goals/${id}/unpublish`);
    return response.data;
  },

  // Assign users to goal
  assignUsers: async (id: string, userIds: string[]): Promise<void> => {
    await api.post(`/goals/${id}/assign`, { userIds });
  },

  // Unassign user from goal
  unassignUser: async (id: string, userId: string): Promise<void> => {
    await api.delete(`/goals/${id}/assign/${userId}`);
  },

  // Get goal assignments
  getAssignments: async (id: string): Promise<GoalAssignment[]> => {
    const response = await api.get(`/goals/${id}/assignments`);
    return response.data;
  },

  // Submit goal report
  submitReport: async (id: string, data: CreateGoalReportRequest): Promise<GoalReport> => {
    const response = await api.post(`/goals/${id}/reports`, data);
    return response.data;
  },

  // Get goal reports
  getReports: async (id: string): Promise<GoalReport[]> => {
    const response = await api.get(`/goals/${id}/reports`);
    return response.data;
  },

  // Get user's assigned goals
  getMyGoals: async (): Promise<Goal[]> => {
    const response = await api.get('/goals/my');
    return response.data;
  },

  // Mark goal as completed
  markCompleted: async (id: string): Promise<Goal> => {
    const response = await api.post(`/goals/${id}/complete`);
    return response.data;
  },

  // Update goal progress
  updateProgress: async (id: string, data: UpdateGoalProgressRequest): Promise<Goal> => {
    const response = await api.put(`/goals/${id}/progress`, data);
    return response.data.goal || response.data;
  },

  // Upload goal report with file
  uploadReport: async (id: string, data: FormData): Promise<GoalReport> => {
    const response = await api.post(`/goals/${id}/reports/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.report || response.data;
  },
};
