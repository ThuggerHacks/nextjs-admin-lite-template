import api from './api';

export interface Sucursal {
  id: string;
  name: string;
  description?: string;
  location: string;
  serverUrl: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastPing?: string;
  _count?: {
    users: number;
    departments: number;
    files: number;
    libraries: number;
    goals: number;
  };
}

export interface SucursalConnection {
  id: string;
  sourceSucursalId: string;
  targetSucursalId: string;
  createdAt: string;
  sourceSucursal: {
    id: string;
    name: string;
    location: string;
  };
  targetSucursal: {
    id: string;
    name: string;
    location: string;
  };
}

export interface CreateSucursalRequest {
  name: string;
  description?: string;
  location: string;
  serverUrl: string;
}

export interface UpdateSucursalRequest {
  name?: string;
  description?: string;
  location?: string;
  serverUrl?: string;
  isActive?: boolean;
}

export interface CreateConnectionRequest {
  targetSucursalId: string;
}

export interface SucursalStats {
  users: number;
  departments: number;
  files: number;
  libraries: number;
  goals: number;
  storage: {
    used: number;
    total: number;
  };
}

export const sucursalService = {
  // Get all sucursals
  getAll: async (): Promise<Sucursal[]> => {
    const response = await api.get('/sucursals');
    return response.data.data;
  },

  // Get sucursal by ID
  getById: async (id: string): Promise<Sucursal> => {
    const response = await api.get(`/sucursals/${id}`);
    return response.data.data;
  },

  // Create new sucursal
  create: async (data: CreateSucursalRequest): Promise<Sucursal> => {
    const response = await api.post('/sucursals', data);
    return response.data.data;
  },

  // Update sucursal
  update: async (id: string, data: UpdateSucursalRequest): Promise<Sucursal> => {
    const response = await api.put(`/sucursals/${id}`, data);
    return response.data.data;
  },

  // Delete sucursal
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sucursals/${id}`);
  },

  // Get current sucursal
  getCurrent: async (): Promise<Sucursal> => {
    const response = await api.get('/sucursals/current');
    return response.data.data;
  },

  // Get sucursal statistics
  getStats: async (id: string): Promise<SucursalStats> => {
    const response = await api.get(`/sucursals/${id}/stats`);
    return response.data.data;
  },

  // Test sucursal connection
  testConnection: async (id: string): Promise<{ success: boolean; latency?: number; error?: string }> => {
    const response = await api.post(`/sucursals/${id}/test-connection`);
    return response.data.data;
  },

  // Ping sucursal
  ping: async (id: string): Promise<{ timestamp: string }> => {
    const response = await api.post(`/sucursals/${id}/ping`);
    return response.data.data;
  },

  // Get sucursal connections
  getConnections: async (id: string): Promise<SucursalConnection[]> => {
    const response = await api.get(`/sucursals/${id}/connections`);
    return response.data.data;
  },

  // Create connection between sucursals
  createConnection: async (id: string, data: CreateConnectionRequest): Promise<SucursalConnection> => {
    const response = await api.post(`/sucursals/${id}/connections`, data);
    return response.data.data;
  },

  // Remove connection
  removeConnection: async (connectionId: string): Promise<void> => {
    await api.delete(`/sucursals/connections/${connectionId}`);
  },

  // Get active sucursals
  getActive: async (): Promise<Sucursal[]> => {
    const response = await api.get('/sucursals/active');
    return response.data.data;
  },

  // Activate sucursal
  activate: async (id: string): Promise<Sucursal> => {
    const response = await api.post(`/sucursals/${id}/activate`);
    return response.data.data;
  },

  // Deactivate sucursal
  deactivate: async (id: string): Promise<Sucursal> => {
    const response = await api.post(`/sucursals/${id}/deactivate`);
    return response.data.data;
  },

  // Sync data with another sucursal
  syncWith: async (id: string, targetSucursalId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/sucursals/${id}/sync`, { targetSucursalId });
    return response.data.data;
  },

  // Get sucursal health status
  getHealth: async (id: string): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message?: string;
    }>;
  }> => {
    const response = await api.get(`/sucursals/${id}/health`);
    return response.data.data;
  },
};
