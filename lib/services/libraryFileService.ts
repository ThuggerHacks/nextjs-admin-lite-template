import api from './api';

export interface LibraryFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  userId: string;
  sucursalId: string;
  libraryId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LibraryFile {
  id: string;
  name: string;
  originalName?: string;
  description?: string;
  url: string;
  size: number;
  type: string;
  mimeType?: string;
  folderId?: string;
  userId: string;
  sucursalId: string;
  libraryId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateFolderRequest {
  name: string;
  parentId?: string;
}

export interface UploadFileRequest {
  file: File;
  folderId?: string;
  description?: string;
}

export interface LibraryContentResponse {
  folders: LibraryFolder[];
  files: LibraryFile[];
  parentId: string | null;
}

export const libraryFileService = {
  // Get library files and folders
  getLibraryContent: async (libraryId: string, parentId?: string): Promise<LibraryContentResponse> => {
    try {
      const response = await api.get(`/libraries/${libraryId}/files`, {
        params: { parentId }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get library content for ${libraryId}:`, error);
      throw error;
    }
  },

  // Create folder in library
  createFolder: async (libraryId: string, data: CreateFolderRequest): Promise<LibraryFolder> => {
    try {
      const response = await api.post(`/libraries/${libraryId}/folders`, data);
      return response.data.folder;
    } catch (error) {
      console.error(`Failed to create folder in library ${libraryId}:`, error);
      throw error;
    }
  },

  // Upload file to library
  uploadFile: async (libraryId: string, data: UploadFileRequest): Promise<LibraryFile> => {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.folderId) {
        formData.append('folderId', data.folderId);
      }
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await api.post(`/libraries/${libraryId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.file;
    } catch (error) {
      console.error(`Failed to upload file to library ${libraryId}:`, error);
      throw error;
    }
  },

  // Delete file from library
  deleteFile: async (libraryId: string, fileId: string): Promise<void> => {
    try {
      await api.delete(`/libraries/${libraryId}/files/${fileId}`);
    } catch (error) {
      console.error(`Failed to delete file ${fileId} from library ${libraryId}:`, error);
      throw error;
    }
  },

  // Delete folder from library
  deleteFolder: async (libraryId: string, folderId: string): Promise<void> => {
    try {
      await api.delete(`/libraries/${libraryId}/folders/${folderId}`);
    } catch (error) {
      console.error(`Failed to delete folder ${folderId} from library ${libraryId}:`, error);
      throw error;
    }
  },

  // Rename file in library
  renameFile: async (libraryId: string, fileId: string, data: { name: string }): Promise<void> => {
    try {
      await api.patch(`/libraries/${libraryId}/files/${fileId}`, data);
    } catch (error) {
      console.error(`Failed to rename file ${fileId} in library ${libraryId}:`, error);
      throw error;
    }
  },

  // Rename folder in library
  renameFolder: async (libraryId: string, folderId: string, data: { name: string }): Promise<void> => {
    try {
      await api.patch(`/libraries/${libraryId}/folders/${folderId}`, data);
    } catch (error) {
      console.error(`Failed to rename folder ${folderId} in library ${libraryId}:`, error);
      throw error;
    }
  },

  // Download file from library
  downloadFile: async (libraryId: string, fileId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/libraries/${libraryId}/files/${fileId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to download file ${fileId} from library ${libraryId}:`, error);
      throw error;
    }
  },
};
