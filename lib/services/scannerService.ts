import api from './api';

export interface Scan {
  id: string;
  title: string;
  createdById: string;
  sucursalId: string;
  pdfPath?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  files: ScanFile[];
}

export interface ScanFile {
  id: string;
  scanId: string;
  fileId: string;
  order: number;
  file: {
    id: string;
    name: string;
    originalName: string;
    path: string;
    mimeType: string;
    size: number;
  };
}

export interface CreateScanRequest {
  title: string;
  files: globalThis.File[];
}

export interface UpdateScanRequest {
  title?: string;
}

export interface AddFilesToScanRequest {
  files: globalThis.File[];
  startOrder?: number;
}

export interface ReorderFilesRequest {
  fileOrders: Array<{
    fileId: string;
    order: number;
  }>;
}

export const scannerService = {
  // Get all scans
  getAll: async (): Promise<Scan[]> => {
    const response = await api.get('/scans');
    return response.data.data;
  },

  // Get scan by ID
  getById: async (id: string): Promise<Scan> => {
    const response = await api.get(`/scans/${id}`);
    return response.data.data;
  },

  // Create new scan
  create: async (data: CreateScanRequest): Promise<Scan> => {
    const formData = new FormData();
    formData.append('title', data.title);
    
    data.files.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await api.post('/scans', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Update scan
  update: async (id: string, data: UpdateScanRequest): Promise<Scan> => {
    const response = await api.put(`/scans/${id}`, data);
    return response.data.data;
  },

  // Delete scan
  delete: async (id: string): Promise<void> => {
    await api.delete(`/scans/${id}`);
  },

  // Add files to existing scan
  addFiles: async (id: string, data: AddFilesToScanRequest): Promise<Scan> => {
    const formData = new FormData();
    
    data.files.forEach((file) => {
      formData.append('files', file);
    });

    if (data.startOrder !== undefined) {
      formData.append('startOrder', data.startOrder.toString());
    }

    const response = await api.post(`/scans/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Remove file from scan
  removeFile: async (scanId: string, fileId: string): Promise<void> => {
    await api.delete(`/scans/${scanId}/files/${fileId}`);
  },

  // Reorder files in scan
  reorderFiles: async (id: string, data: ReorderFilesRequest): Promise<Scan> => {
    const response = await api.put(`/scans/${id}/reorder`, data);
    return response.data.data;
  },

  // Generate PDF from scan
  generatePDF: async (id: string): Promise<{ pdfPath: string }> => {
    const response = await api.post(`/scans/${id}/generate-pdf`);
    return response.data.data;
  },

  // Download scan as PDF
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/scans/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get scan files
  getFiles: async (id: string): Promise<ScanFile[]> => {
    const response = await api.get(`/scans/${id}/files`);
    return response.data.data;
  },

  // Preview scan file
  previewFile: async (scanId: string, fileId: string): Promise<Blob> => {
    const response = await api.get(`/scans/${scanId}/files/${fileId}/preview`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get user's scans
  getMyScans: async (): Promise<Scan[]> => {
    const response = await api.get('/scans/my');
    return response.data.data;
  },

  // Search scans
  search: async (query: string): Promise<Scan[]> => {
    const response = await api.get(`/scans/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // Get scan statistics
  getStats: async (): Promise<{
    total: number;
    withPdf: number;
    totalFiles: number;
    totalSize: number;
  }> => {
    const response = await api.get('/scans/stats');
    return response.data.data;
  },
};
