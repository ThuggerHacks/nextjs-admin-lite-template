import api from './api';

export interface TemperatureRecord {
  id: string;
  temperature: number;
  recordedAt: string;
  userId: string;
  sucursalId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TemperatureStats {
  count: number;
  average: number;
  min: number;
  max: number;
  temperatures: Array<{
    temperature: number;
    recordedAt: string;
    userId: string;
  }>;
}

export interface CreateTemperatureRequest {
  temperature: number;
  recordedAt?: string;
}

export interface TemperatureFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const temperatureService = {
  // Get temperatures with optional filtering
  getTemperatures: async (filters: TemperatureFilters = {}): Promise<TemperatureRecord[]> => {
    const params = new URLSearchParams();
    
    if (filters.date) params.append('date', filters.date);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/temperatures?${params.toString()}`);
    return response.data.data;
  },

  // Create new temperature record
  createTemperature: async (data: CreateTemperatureRequest): Promise<TemperatureRecord> => {
    const response = await api.post('/temperatures', data);
    return response.data.data;
  },

  // Get temperature statistics for a specific date
  getTemperatureStats: async (date: string): Promise<TemperatureStats> => {
    const response = await api.get(`/temperatures/stats/${date}`);
    return response.data.data;
  },

  // Export temperatures to Excel
  exportTemperatures: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/temperatures/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete temperature record
  deleteTemperature: async (id: string): Promise<void> => {
    await api.delete(`/temperatures/${id}`);
  },
};
