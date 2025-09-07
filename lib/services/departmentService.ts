import api from './api';

export interface Department {
  id: string;
  name: string;
  description?: string;
  supervisorId?: string;
  canSeeTemperatureMenu?: boolean;
  sucursalId: string;
  createdAt: string;
  updatedAt: string;
  supervisor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  }>;
  _count?: {
    users: number;
  };
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  supervisorId?: string;
  canSeeTemperatureMenu?: boolean;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  supervisorId?: string;
  canSeeTemperatureMenu?: boolean;
}

export const departmentService = {
  // Get all departments (public endpoint for registration)
  getAllDepartments: async (): Promise<Department[]> => {
    try {
      const response = await api.get('/departments/public');
      return response.data.departments || [];
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return [];
    }
  },

  getAll: async (): Promise<Department[]> => {
    try {
      const response = await api.get('/departments');
      return response.data.departments || [];
    } catch (error) {
      console.error('Failed to fetch all departments:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Department | null> => {
    try {
      const response = await api.get(`/departments/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to fetch department ${id}:`, error);
      return null;
    }
  },

  create: async (data: CreateDepartmentRequest): Promise<Department | null> => {
    try {
      const response = await api.post('/departments', data);
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to create department:', error);
      return null;
    }
  },

  update: async (id: string, data: UpdateDepartmentRequest): Promise<Department | null> => {
    try {
      console.log(`Updating department ${id} with data:`, data);
      const response = await api.put(`/departments/${id}`, data);
      console.log('Update response:', response.data);
      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to update department ${id}:`, error);
      console.error('Error response:', error.response?.data);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/departments/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete department ${id}:`, error);
      return false;
    }
  },

  getUsers: async (id: string) => {
    try {
      const response = await api.get(`/departments/${id}/users`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Failed to fetch users for department ${id}:`, error);
      return [];
    }
  },

  assignSupervisor: async (id: string, supervisorId: string): Promise<Department | null> => {
    try {
      const response = await api.patch(`/departments/${id}/supervisor`, { supervisorId });
      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to assign supervisor to department ${id}:`, error);
      return null;
    }
  },
};
