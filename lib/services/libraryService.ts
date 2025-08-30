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
};
