import { apiService } from '@/lib/axios';

export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  userId: string;
  sucursalId: string;
  createdAt: string;
  updatedAt: string;
  parent?: Folder;
  children?: Folder[];
  files?: File[];
  _count?: {
    children: number;
    files: number;
  };
}

export interface File {
  id: string;
  name: string;
  originalName?: string;
  description?: string;
  url: string;
  size: number;
  type: string;
  mimeType?: string;
  isPublic: boolean;
  folderId?: string;
  userId: string;
  sucursalId: string;
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  parentId?: string;
}

export interface RenameFolderRequest {
  name: string;
}

export interface MoveFolderRequest {
  parentId?: string;
}

export interface CreateFileRequest {
  name: string;
  url: string;
  description?: string;
  folderId?: string;
  isPublic?: boolean;
  size?: number;
  type?: string;
}

export interface UpdateFileRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface RenameFileRequest {
  name: string;
}

export interface MoveFileRequest {
  folderId?: string;
}

export interface UploadFileRequest {
  file: globalThis.File;
  folderId?: string;
  isPublic?: boolean;
}

export interface FileListResponse {
  files: File[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FolderTreeResponse {
  tree: Folder[];
}

export const fileService = {
  // Folder operations
  async getAllFolders(params?: { parentId?: string }): Promise<{ folders: Folder[] }> {
    const response = await apiService.get<{ folders: Folder[] }>('/folders', { params });
    return response.data;
  },

  async getFolderById(folderId: string): Promise<{ folder: Folder }> {
    const response = await apiService.get<{ folder: Folder }>(`/folders/${folderId}`);
    return response.data;
  },

  async createFolder(folderData: CreateFolderRequest): Promise<{ message: string; folder: Folder }> {
    const response = await apiService.post<{ message: string; folder: Folder }>('/folders', folderData);
    return response.data;
  },

  async updateFolder(folderId: string, folderData: UpdateFolderRequest): Promise<{ message: string; folder: Folder }> {
    const response = await apiService.put<{ message: string; folder: Folder }>(`/folders/${folderId}`, folderData);
    return response.data;
  },

  async renameFolder(folderId: string, data: RenameFolderRequest): Promise<{ message: string; folder: Folder }> {
    const response = await apiService.patch<{ message: string; folder: Folder }>(`/folders/${folderId}/rename`, data);
    return response.data;
  },

  async moveFolder(folderId: string, data: MoveFolderRequest): Promise<{ message: string; folder: Folder }> {
    const response = await apiService.patch<{ message: string; folder: Folder }>(`/folders/${folderId}/move`, data);
    return response.data;
  },

  async deleteFolder(folderId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(`/folders/${folderId}`);
    return response.data;
  },

  async getFolderTree(folderId?: string): Promise<FolderTreeResponse> {
    const url = folderId ? `/folders/tree/${folderId}` : '/folders/tree';
    const response = await apiService.get<FolderTreeResponse>(url);
    return response.data;
  },

  // File operations
  async getAllFiles(params?: {
    folderId?: string;
    isPublic?: string;
    page?: number;
    limit?: number;
  }): Promise<FileListResponse> {
    const response = await apiService.get<FileListResponse>('/files', { params });
    return response.data;
  },

  async getFileById(fileId: string): Promise<{ file: File }> {
    const response = await apiService.get<{ file: File }>(`/files/${fileId}`);
    return response.data;
  },

  async createFile(fileData: CreateFileRequest): Promise<{ message: string; file: File }> {
    const response = await apiService.post<{ message: string; file: File }>('/files', fileData);
    return response.data;
  },

  async updateFile(fileId: string, fileData: UpdateFileRequest): Promise<{ message: string; file: File }> {
    const response = await apiService.put<{ message: string; file: File }>(`/files/${fileId}`, fileData);
    return response.data;
  },

  async renameFile(fileId: string, data: RenameFileRequest): Promise<{ message: string; file: File }> {
    const response = await apiService.patch<{ message: string; file: File }>(`/files/${fileId}/rename`, data);
    return response.data;
  },

  async moveFile(fileId: string, data: MoveFileRequest): Promise<{ message: string; file: File }> {
    const response = await apiService.patch<{ message: string; file: File }>(`/files/${fileId}/move`, data);
    return response.data;
  },

  async deleteFile(fileId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(`/files/${fileId}`);
    return response.data;
  },

  async getPublicFiles(params?: { page?: number; limit?: number }): Promise<FileListResponse> {
    const response = await apiService.get<FileListResponse>('/files/public/files', { params });
    return response.data;
  },

  // Upload file (two-step process)
  async uploadFile(file: globalThis.File, folderId?: string): Promise<{ message: string; file: File }> {
    console.log('📁 FileService: Starting upload with folderId:', folderId);
    
    // First, upload the file to get the URL
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    console.log('📁 FileService: Uploading file to /uploads');
    const uploadResponse = await apiService.upload<{ file: File }>('/uploads', formData);
    console.log('📁 FileService: Upload response:', uploadResponse.data);

    // Then create the file record with the URL
    const fileData: CreateFileRequest = {
      name: file.name,
      url: uploadResponse.data.file.url,
      size: file.size,
      type: file.type,
      folderId,
    };

    console.log('📁 FileService: Creating file record with data:', fileData);
    return this.createFile(fileData);
  },

  // Download file
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await apiService.download(`/files/${fileId}/download`);
    return response;
  },

  // Get all documents for documents view
  async getAllDocuments(params?: {
    type?: 'public' | 'department' | 'personal' | 'all';
    departmentId?: string;
    page?: number;
    limit?: number;
  }): Promise<FileListResponse> {
    const response = await apiService.get<FileListResponse>('/files/documents/all', { params });
    return response.data;
  },

  // Get all folders for documents view
  async getDocumentFolders(params?: {
    type?: 'public' | 'department' | 'personal' | 'all';
    departmentId?: string;
  }): Promise<{ folders: Folder[] }> {
    const response = await apiService.get<{ folders: Folder[] }>('/folders/documents/all', { params });
    return response.data;
  },

  // Get documents and folders for documents view
  async getDocumentsAndFolders(params?: {
    type?: 'public' | 'department' | 'personal' | 'all';
    departmentId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    files: File[];
    folders: Folder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const [filesResponse, foldersResponse] = await Promise.all([
      this.getAllDocuments(params),
      this.getDocumentFolders(params)
    ]);

    return {
      files: filesResponse.files,
      folders: foldersResponse.folders,
      pagination: filesResponse.pagination
    };
  },
};
