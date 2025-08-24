import api from './api';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

export interface Report {
  id: string;
  title: string;
  description: string;
  submittedById: string;
  reviewerId?: string;
  fileId?: string;
  sucursalId: string;
  status: string;
  reviewedAt?: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
  file?: {
    id: string;
    name: string;
    originalName: string;
    path: string;
  };
}

// New interface for general reports
export interface GeneralReport {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'PENDING' | 'RESPONDED' | 'ARCHIVED';
  submittedAt: string;
  respondedAt?: string;
  response?: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    department?: {
      id: string;
      name: string;
    };
  };
  submittedTo?: {
    id: string;
    name: string;
    email: string;
  };
  respondedBy?: {
    id: string;
    name: string;
    email: string;
  };
  attachments: Array<{
    id: string;
    file: {
      id: string;
      name: string;
      originalName: string;
      size: number;
      mimeType: string;
    };
  }>;
}

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: {
    id: string;
    name: string;
  };
}

export interface CreateReportRequest {
  title: string;
  description: string;
  fileId?: string;
}

export interface UpdateReportRequest {
  title?: string;
  description?: string;
  fileId?: string;
}

export interface ReviewReportRequest {
  response: string;
  status: 'REVIEWED' | 'ARCHIVED';
}

export interface ReportStats {
  total: number;
  pending: number;
  reviewed: number;
  archived: number;
}

export const reportService = {
  // Upload files and get URLs
  uploadFiles: async (files: File[], onProgress?: (fileIndex: number, progress: number) => void): Promise<{ success: boolean; fileUrls?: string[]; error?: string }> => {
    try {
      const token = localStorage.getItem('token');
      const fileUrls: string[] = [];
      
      // Upload files one by one to get individual progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(i, percentCompleted);
            }
          },
        });

        if (response.data && response.data.file && response.data.file.url) {
          fileUrls.push(response.data.file.url);
        }
      }

      return { success: true, fileUrls };
    } catch (error: any) {
      console.error('Upload files error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to upload files'
      };
    }
  },

  // Submit a general report
  submitGeneralReport: async (reportData: {
    title: string;
    description: string;
    type: string;
    submittedToId?: string;
    submittedToIds?: string[];
    files?: File[];
    onUploadProgress?: (progress: number) => void;
  }): Promise<{ success: boolean; report?: GeneralReport; error?: string }> => {
    try {
      const token = localStorage.getItem('token');
      
      // First upload files if any
      let fileUrls: string[] = [];
      if (reportData.files && reportData.files.length > 0) {
        const uploadResult = await reportService.uploadFiles(reportData.files, (fileIndex, progress) => {
          // Calculate overall progress
          const baseProgress = (fileIndex / reportData.files!.length) * 100;
          const currentFileProgress = (progress / reportData.files!.length);
          const totalProgress = Math.min(baseProgress + currentFileProgress, 100);
          
          if (reportData.onUploadProgress) {
            reportData.onUploadProgress(totalProgress);
          }
        });

        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }

        fileUrls = uploadResult.fileUrls || [];
      }

      // Then submit the report with file metadata
      const fileMetadata = reportData.files ? reportData.files.map((file, index) => ({
        url: fileUrls[index],
        originalName: file.name,
        size: file.size,
        mimeType: file.type
      })) : [];

      const payload = {
        title: reportData.title,
        description: reportData.description,
        type: reportData.type,
        submittedToIds: reportData.submittedToIds,
        fileMetadata: fileMetadata
      };

      // Backward compatibility for single supervisor
      if (reportData.submittedToId) {
        payload.submittedToIds = [reportData.submittedToId];
      }

      const response = await axios.post(`${API_BASE_URL}/reports/submit`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return { success: true, report: response.data };
    } catch (error: any) {
      console.error('Submit general report error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to submit report' 
      };
    }
  },

  // Get general reports
  getGeneralReports: async (filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; reports?: GeneralReport[]; total?: number; error?: string }> => {
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`${API_BASE_URL}/reports/general?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return { 
        success: true, 
        reports: response.data.reports,
        total: response.data.pagination?.total 
      };
    } catch (error: any) {
      console.error('Get general reports error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch reports' 
      };
    }
  },

  // Respond to a general report
  respondToGeneralReport: async (reportId: string, response: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/reports/general/${reportId}/respond`, {
        response
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Respond to general report error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to respond to report' 
      };
    }
  },

  // Get available supervisors for report submission
  getSupervisors: async (): Promise<{ success: boolean; supervisors?: Supervisor[]; error?: string }> => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/reports/supervisors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return { success: true, supervisors: response.data };
    } catch (error: any) {
      console.error('Get supervisors error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch supervisors' 
      };
    }
  },

  // Legacy methods for goal-related reports (keeping for compatibility)
  // Get all reports
  getAll: async (): Promise<Report[]> => {
    const response = await api.get('/reports');
    return response.data.data;
  },

  // Get report by ID
  getById: async (id: string): Promise<Report> => {
    const response = await api.get(`/reports/${id}`);
    return response.data.data;
  },

  // Create new report
  create: async (data: CreateReportRequest): Promise<Report> => {
    const response = await api.post('/reports', data);
    return response.data.data;
  },

  // Update report
  update: async (id: string, data: UpdateReportRequest): Promise<Report> => {
    const response = await api.put(`/reports/${id}`, data);
    return response.data.data;
  },

  // Delete report
  delete: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },

  // Review report (supervisor/admin only)
  review: async (id: string, data: ReviewReportRequest): Promise<Report> => {
    const response = await api.post(`/reports/${id}/review`, data);
    return response.data.data;
  },

  // Get reports submitted by current user
  getMyReports: async (): Promise<Report[]> => {
    const response = await api.get('/reports/my');
    return response.data.data;
  },

  // Get reports assigned for review
  getForReview: async (): Promise<Report[]> => {
    const response = await api.get('/reports/for-review');
    return response.data.data;
  },

  // Get reports by status
  getByStatus: async (status: string): Promise<Report[]> => {
    const response = await api.get(`/reports/status/${status}`);
    return response.data.data;
  },

  // Get report statistics
  getStats: async (): Promise<ReportStats> => {
    const response = await api.get('/reports/stats');
    return response.data.data;
  },

  // Upload file for report
  uploadFile: async (file: globalThis.File): Promise<{ fileId: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Get reports with pagination
  getPaginated: async (page: number = 1, limit: number = 10, status?: string): Promise<{
    reports: Report[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await api.get(`/reports/paginated?${params.toString()}`);
    return response.data.data;
  },

  // Search reports
  search: async (query: string): Promise<Report[]> => {
    const response = await api.get(`/reports/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },
};
