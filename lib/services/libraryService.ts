import api from './api';

export interface Library {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  sucursalId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  members?: LibraryMember[];
  files?: LibraryFile[];
}

export interface LibraryMember {
  id: string;
  libraryId: string;
  userId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LibraryFile {
  id: string;
  name: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateLibraryRequest {
  name: string;
  description?: string;
}

export interface UpdateLibraryRequest {
  name?: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: string;
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
}

export interface UpdateMemberPermissionsRequest {
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
}

export const libraryService = {
  // Get all libraries
  getAll: async (): Promise<Library[]> => {
    const response = await api.get('/libraries');
    return response.data.data;
  },

  // Get library by ID
  getById: async (id: string): Promise<Library> => {
    const response = await api.get(`/libraries/${id}`);
    return response.data.data;
  },

  // Create new library
  create: async (data: CreateLibraryRequest): Promise<Library> => {
    const response = await api.post('/libraries', data);
    return response.data.data;
  },

  // Update library
  update: async (id: string, data: UpdateLibraryRequest): Promise<Library> => {
    const response = await api.put(`/libraries/${id}`, data);
    return response.data.data;
  },

  // Delete library
  delete: async (id: string): Promise<void> => {
    await api.delete(`/libraries/${id}`);
  },

  // Get library members
  getMembers: async (id: string): Promise<LibraryMember[]> => {
    const response = await api.get(`/libraries/${id}/members`);
    return response.data.data;
  },

  // Add member to library
  addMember: async (id: string, data: AddMemberRequest): Promise<LibraryMember> => {
    const response = await api.post(`/libraries/${id}/members`, data);
    return response.data.data;
  },

  // Update member permissions
  updateMemberPermissions: async (
    id: string,
    memberId: string,
    data: UpdateMemberPermissionsRequest
  ): Promise<LibraryMember> => {
    const response = await api.put(`/libraries/${id}/members/${memberId}`, data);
    return response.data.data;
  },

  // Remove member from library
  removeMember: async (id: string, memberId: string): Promise<void> => {
    await api.delete(`/libraries/${id}/members/${memberId}`);
  },

  // Get library files
  getFiles: async (id: string): Promise<LibraryFile[]> => {
    const response = await api.get(`/libraries/${id}/files`);
    return response.data.data;
  },

  // Upload file to library
  uploadFile: async (id: string, file: globalThis.File): Promise<LibraryFile> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/libraries/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Remove file from library
  removeFile: async (id: string, fileId: string): Promise<void> => {
    await api.delete(`/libraries/${id}/files/${fileId}`);
  },

  // Get libraries where user is a member
  getMyLibraries: async (): Promise<Library[]> => {
    const response = await api.get('/libraries/my');
    return response.data.data;
  },

  // Search libraries
  search: async (query: string): Promise<Library[]> => {
    const response = await api.get(`/libraries/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },
};
