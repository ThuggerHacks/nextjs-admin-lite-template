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
        timeout: 1800000, // 30 minutes for large files
      });
      return response.data.file;
    } catch (error) {
      console.error(`Failed to upload file to library ${libraryId}:`, error);
      throw error;
    }
  },

  // Upload large file to library with progress tracking
  uploadLargeFile: async (
    libraryId: string, 
    data: UploadFileRequest, 
    onProgress?: (progress: number) => void
  ): Promise<LibraryFile> => {
    try {
      // For files larger than 100MB, use chunked upload
      if (data.file.size > 100 * 1024 * 1024) {
        return libraryFileService.uploadFileInChunks(libraryId, data, onProgress);
      }
      
      // For smaller files, use regular upload
      return libraryFileService.uploadFile(libraryId, data);
    } catch (error) {
      console.error(`Failed to upload large file to library ${libraryId}:`, error);
      throw error;
    }
  },

  // Upload file in chunks for very large files
  uploadFileInChunks: async (
    libraryId: string, 
    data: UploadFileRequest, 
    onProgress?: (progress: number) => void
  ): Promise<LibraryFile> => {
    try {
      const chunkSize = 10 * 1024 * 1024; // 10MB chunks
      const totalChunks = Math.ceil(data.file.size / chunkSize);
      let uploadedChunks = 0;

      console.log(`📁 LibraryFileService: Uploading ${data.file.name} in ${totalChunks} chunks`);

      // Create upload session
      const sessionResponse = await api.post(`/libraries/${libraryId}/upload-session`, {
        fileName: data.file.name,
        fileSize: data.file.size,
        folderId: data.folderId
      });

      const sessionId = sessionResponse.data.sessionId;

      // Upload chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, data.file.size);
        const chunk = data.file.slice(start, end);

        // Convert Blob chunk to file for upload
        const chunkBlob = new Blob([chunk], { type: 'application/octet-stream' });
        const chunkFile = new File([chunkBlob], `chunk_${i}`, { type: 'application/octet-stream' });

        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('chunkIndex', i.toString());
        formData.append('chunk', chunkFile); // Send as file
        formData.append('fileName', data.file.name);

        await api.post(`/libraries/${libraryId}/upload-chunk`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minutes per chunk
        });

        uploadedChunks++;
        if (onProgress) {
          onProgress((uploadedChunks / totalChunks) * 100);
        }
      }

      // Complete upload
      const completeResponse = await api.post(`/libraries/${libraryId}/upload-complete`, { sessionId });
      return completeResponse.data.file;
    } catch (error) {
      console.error(`Failed to upload file in chunks to library ${libraryId}:`, error);
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
