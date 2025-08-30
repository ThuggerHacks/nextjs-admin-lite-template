import api from './api';

export interface Library {
  id: string;
  name: string;
  description?: string;
  userId: string; // This is the creator ID
  sucursalId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  members: LibraryMember[];
  _count?: {
    members: number;
  };
}

export interface LibraryMember {
  id: string;
  libraryId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
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
  libraryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateLibraryRequest {
  name: string;
  description?: string;
  userIds?: string[]; // Array of user IDs to add as members
}

export interface UpdateLibraryRequest {
  name?: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: string;
}

export const libraryService = {
  // Get all libraries (user will only see libraries they're members of)
  getAll: async (): Promise<Library[]> => {
    try {
      const response = await api.get('/libraries');
      return response.data.libraries || [];
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
      throw error;
    }
  },

  // Get library by ID
  getById: async (id: string): Promise<Library> => {
    try {
      const response = await api.get(`/libraries/${id}`);
      return response.data.library;
    } catch (error) {
      console.error(`Failed to fetch library ${id}:`, error);
      throw error;
    }
  },

  // Create new library
  create: async (data: CreateLibraryRequest): Promise<Library> => {
    try {
      const response = await api.post('/libraries', data);
      return response.data.library;
    } catch (error) {
      console.error('Failed to create library:', error);
      throw error;
    }
  },

  // Update library
  update: async (id: string, data: UpdateLibraryRequest): Promise<Library> => {
    try {
      const response = await api.put(`/libraries/${id}`, data);
      return response.data.library;
    } catch (error) {
      console.error(`Failed to update library ${id}:`, error);
      throw error;
    }
  },

  // Delete library
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/libraries/${id}`);
    } catch (error) {
      console.error(`Failed to delete library ${id}:`, error);
      throw error;
    }
  },

  // Add member to library
  addMember: async (id: string, data: AddMemberRequest): Promise<LibraryMember> => {
    try {
      const response = await api.post(`/libraries/${id}/members`, data);
      return response.data.member;
    } catch (error) {
      console.error(`Failed to add member to library ${id}:`, error);
      throw error;
    }
  },

  // Remove member from library
  removeMember: async (libraryId: string, userId: string): Promise<void> => {
    try {
      await api.delete(`/libraries/${libraryId}/members/${userId}`);
    } catch (error) {
      console.error(`Failed to remove member from library ${libraryId}:`, error);
      throw error;
    }
  },

  // Get libraries where user is a member (including created ones)
  getMyLibraries: async (): Promise<Library[]> => {
    try {
      // The backend already filters libraries based on user membership
      const response = await api.get('/libraries');
      return response.data.libraries || [];
    } catch (error) {
      console.error('Failed to fetch my libraries:', error);
      throw error;
    }
  },

  // Remove file from library
  removeFile: async (libraryId: string, fileId: string): Promise<void> => {
    try {
      await api.delete(`/libraries/${libraryId}/files/${fileId}`);
    } catch (error) {
      console.error(`Failed to remove file ${fileId} from library ${libraryId}:`, error);
      throw error;
    }
  },

  // Upload file to library
  uploadFile: async (libraryId: string, file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/libraries/${libraryId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 1800000, // 30 minutes for large files
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to upload file to library ${libraryId}:`, error);
      throw error;
    }
  },

  // Upload large file to library with progress tracking
  uploadLargeFile: async (
    libraryId: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    try {
      // For files larger than 100MB, use chunked upload
      if (file.size > 100 * 1024 * 1024) {
        return libraryService.uploadFileInChunks(libraryId, file, onProgress);
      }
      
      // For smaller files, use regular upload
      return libraryService.uploadFile(libraryId, file);
    } catch (error) {
      console.error(`Failed to upload large file to library ${libraryId}:`, error);
      throw error;
    }
  },

  // Upload file in chunks for very large files
  uploadFileInChunks: async (
    libraryId: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    try {
      const chunkSize = 10 * 1024 * 1024; // 10MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedChunks = 0;

      console.log(`📁 LibraryService: Uploading ${file.name} in ${totalChunks} chunks`);

      // Create upload session
      const sessionResponse = await api.post(`/libraries/${libraryId}/upload-session`, {
        fileName: file.name,
        fileSize: file.size
      });

      const sessionId = sessionResponse.data.sessionId;

      // Upload chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('chunkIndex', i.toString());
        formData.append('chunk', chunk);
        formData.append('fileName', file.name);

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
      return completeResponse.data;
    } catch (error) {
      console.error(`Failed to upload file in chunks to library ${libraryId}:`, error);
      throw error;
    }
  },
};
