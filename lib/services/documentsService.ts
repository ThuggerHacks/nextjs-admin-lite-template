import { fileService, Folder, File } from './fileService';
import { userService } from './userService';
import { apiService } from '@/lib/axios';

export interface DocumentItem {
  id: string;
  name: string;
  description?: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  url?: string;
  content?: string; // Added for rich text documents
  isPublic: boolean;
  userId: string;
  userName: string;
  userDepartment?: string;
  folderId?: string;
  parentId?: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  children?: DocumentItem[];
  _count?: {
    children: number;
    files: number;
  };
}

export interface DocumentsResponse {
  items: DocumentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DocumentFilters {
  type?: 'public' | 'department' | 'personal' | 'all';
  departmentId?: string;
  parentId?: string;
  search?: string;
  sortBy?: 'name' | 'date' | 'size' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateDocumentRequest {
  name: string;
  description?: string;
  parentId?: string;
  isPublic?: boolean;
}

export interface UpdateDocumentRequest {
  name?: string;
  description?: string;
  parentId?: string;
  isPublic?: boolean;
}

export const documentsService = {
  // Get all documents with filters
  async getAllDocuments(filters: DocumentFilters = {}): Promise<DocumentsResponse> {
    try {
      const params = {
        type: filters.type || 'all',
        departmentId: filters.departmentId,
        page: filters.page || 1,
        limit: filters.limit || 50,
        search: filters.search,
        sortBy: filters.sortBy || 'name',
        sortOrder: filters.sortOrder || 'asc'
      };

      // Get all files and folders regardless of ownership
      const response = await fileService.getDocumentsAndFolders(params);
      
      console.log('📁 DocumentsService: Raw response:', response);
      console.log('📁 DocumentsService: Files count:', response.files.length);
      console.log('📁 DocumentsService: Folders count:', response.folders.length);
      
      // Convert to unified DocumentItem format
      let items: DocumentItem[] = [
        ...response.folders.map(folder => ({
          id: folder.id,
          name: folder.name,
          description: folder.description,
          type: 'folder' as const,
          isPublic: false, // Folders are not public by default
          userId: folder.userId,
          userName: 'Unknown', // Folder doesn't have user info
          userDepartment: undefined,
          parentId: folder.parentId || undefined,
          path: `/${folder.name}`,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          children: [],
          _count: folder._count
        })),
        ...response.files.map(file => ({
          id: file.id,
          name: file.name,
          description: file.description,
          type: 'file' as const,
          size: file.size,
          mimeType: file.type,
          url: file.url,
          content: undefined, // File doesn't have content property
          isPublic: file.isPublic,
          userId: file.userId,
          userName: file.user?.name || 'Unknown',
          userDepartment: undefined,
          folderId: file.folderId || undefined,
          parentId: file.folderId || undefined,
          path: `/${file.name}`,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }))
      ];

      // Filter by parentId if specified
      if (filters.parentId !== undefined) {
        items = items.filter(item => item.parentId === filters.parentId);
      } else if (filters.parentId === null) {
        // Show root level items (no parent)
        items = items.filter(item => !item.parentId);
      }

      // Sort items
      const sortedItems = this.sortItems(items, filters.sortBy || 'name', filters.sortOrder || 'asc');

      return {
        items: sortedItems,
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Failed to get documents:', error);
      throw error;
    }
  },

  // Get documents by type
  async getDocumentsByType(type: 'public' | 'department' | 'personal', departmentId?: string): Promise<DocumentItem[]> {
    const response = await this.getAllDocuments({ type, departmentId });
    return response.items;
  },

  // Get user's personal documents
  async getUserDocuments(userId: string): Promise<DocumentItem[]> {
    try {
      const userFilesData = await userService.getUserFiles(userId);
      
      const items: DocumentItem[] = [
        ...(userFilesData.folders || []).map(folder => ({
          id: folder.id,
          name: folder.name,
          description: folder.description,
          type: 'folder' as const,
          isPublic: false,
          userId: folder.userId,
          userName: 'You',
          parentId: folder.parentId || undefined,
          path: `/${folder.name}`,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          children: [],
          _count: folder._count
        })),
        ...(userFilesData.files || []).map(file => ({
          id: file.id,
          name: file.name,
          description: file.description,
          type: 'file' as const,
          size: file.size,
          mimeType: file.type,
          url: file.url,
          isPublic: file.isPublic,
          userId: file.userId,
          userName: 'You',
          folderId: file.folderId || undefined,
          parentId: file.folderId || undefined,
          path: `/${file.name}`,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }))
      ];

      return items;
    } catch (error) {
      console.error('Failed to get user documents:', error);
      throw error;
    }
  },

  // Create folder
  async createFolder(data: CreateDocumentRequest, userId?: string): Promise<DocumentItem> {
    try {
      // Create folder for current user
      const response = await fileService.createFolder({
        name: data.name,
        description: data.description,
        parentId: data.parentId
      });

      const folder = response.folder;
      return {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        type: 'folder' as const,
        isPublic: false,
        userId: folder.userId,
        userName: 'You',
        parentId: folder.parentId || undefined,
        path: `/${folder.name}`,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        children: [],
        _count: { children: 0, files: 0 }
      };
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  },

  // Upload file
  async uploadFile(file: globalThis.File, parentId?: string, isPublic: boolean = false): Promise<DocumentItem> {
    try {
      const response = await fileService.uploadFile(file, parentId);
      
      return {
        id: response.file.id,
        name: response.file.name,
        description: response.file.description,
        type: 'file' as const,
        size: response.file.size,
        mimeType: response.file.type,
        url: response.file.url,
        isPublic: response.file.isPublic,
        userId: response.file.userId,
        userName: 'You',
        folderId: response.file.folderId,
        parentId: response.file.folderId,
        path: `/${response.file.name}`,
        createdAt: response.file.createdAt,
        updatedAt: response.file.updatedAt
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  },

  // Create upload session for large files
  async createUploadSession(fileName: string, fileSize: number, parentId?: string): Promise<{ sessionId: string }> {
    try {
      const response = await apiService.post('/api/uploads/session', {
        fileName,
        fileSize,
        parentId
      });
      
      return { sessionId: response.data.sessionId };
    } catch (error) {
      console.error('Failed to create upload session:', error);
      throw error;
    }
  },

  // Upload chunk for large files
  async uploadChunk(sessionId: string, chunkIndex: number, chunk: Blob, fileName: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('chunk', chunk, `chunk_${chunkIndex}`); // Send as file with proper filename
      formData.append('fileName', fileName);

      await apiService.post('/api/uploads/chunk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for large chunks
      });
    } catch (error) {
      console.error(`Failed to upload chunk ${chunkIndex}:`, error);
      throw error;
    }
  },

  // Complete upload session
  async completeUpload(sessionId: string): Promise<DocumentItem> {
    try {
      const response = await apiService.post('/api/uploads/complete', { sessionId });
      
      return {
        id: response.data.file.id,
        name: response.data.file.name,
        description: response.data.file.description,
        type: 'file' as const,
        size: response.data.file.size,
        mimeType: response.data.file.type,
        url: response.data.file.url,
        isPublic: response.data.file.isPublic,
        userId: response.data.file.userId,
        userName: 'You',
        folderId: response.data.file.folderId,
        parentId: response.data.file.folderId,
        path: `/${response.data.file.name}`,
        createdAt: response.data.file.createdAt,
        updatedAt: response.data.file.updatedAt
      };
    } catch (error) {
      console.error('Failed to complete upload:', error);
      throw error;
    }
  },

  // Rename item
  async renameItem(itemId: string, newName: string, isFolder: boolean): Promise<DocumentItem> {
    try {
      let response;
      if (isFolder) {
        response = await fileService.renameFolder(itemId, { name: newName });
      } else {
        response = await fileService.renameFile(itemId, { name: newName });
      }

      const item = 'folder' in response ? response.folder : response.file;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        type: isFolder ? 'folder' as const : 'file' as const,
        size: (item as any).size,
        mimeType: (item as any).type,
        url: (item as any).url,
        isPublic: (item as any).isPublic || false,
        userId: item.userId,
        userName: 'You',
        folderId: (item as any).folderId,
        parentId: (item as any).parentId || (item as any).folderId || undefined,
        path: `/${item.name}`,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    } catch (error) {
      console.error('Failed to rename item:', error);
      throw error;
    }
  },

  // Delete item
  async deleteItem(itemId: string, isFolder: boolean): Promise<void> {
    try {
      if (isFolder) {
        await fileService.deleteFolder(itemId);
      } else {
        await fileService.deleteFile(itemId);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  },

  // Move item
  async moveItem(itemId: string, newParentId: string | null, isFolder: boolean): Promise<DocumentItem> {
    try {
      let response;
      if (isFolder) {
        response = await fileService.moveFolder(itemId, { parentId: newParentId || undefined });
      } else {
        response = await fileService.moveFile(itemId, { folderId: newParentId || undefined });
      }

      const item = 'folder' in response ? response.folder : response.file;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        type: isFolder ? 'folder' as const : 'file' as const,
        size: (item as any).size,
        mimeType: (item as any).type,
        url: (item as any).url,
        isPublic: (item as any).isPublic || false,
        userId: item.userId,
        userName: 'You',
        folderId: (item as any).folderId,
        parentId: (item as any).parentId || (item as any).folderId || undefined,
        path: `/${item.name}`,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    } catch (error) {
      console.error('Failed to move item:', error);
      throw error;
    }
  },

  // Copy folder
  async copyFolder(folderId: string, targetParentId?: string): Promise<DocumentItem> {
    try {
      // Get the original folder to copy
      const originalFolder = await fileService.getFolderById(folderId);
      
      console.log('📁 Copying folder:', { 
        originalName: originalFolder.folder.name, 
        originalDescription: originalFolder.folder.description,
        targetParentId 
      });
      
      // Ensure description is a string (not undefined or null)
      const folderDescription = typeof originalFolder.folder.description === 'string' 
        ? originalFolder.folder.description 
        : '';
      
      // Create a new folder with the same properties but in the target location
      const copyResponse = await fileService.createFolder({
        name: `${originalFolder.folder.name} (Copy)`,
        description: folderDescription,
        parentId: targetParentId
      });
      
      const folder = copyResponse.folder;
      return {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        type: 'folder' as const,
        isPublic: false,
        userId: folder.userId,
        userName: 'You',
        parentId: folder.parentId || undefined,
        path: `/${folder.name}`,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        children: [],
        _count: { children: 0, files: 0 }
      };
    } catch (error) {
      console.error('Failed to copy folder:', error);
      throw error;
    }
  },

  // Copy file
  async copyFile(fileId: string, targetFolderId?: string): Promise<DocumentItem> {
    try {
      // Get the original file to copy
      const originalFile = await fileService.getFileById(fileId);
      
      console.log('📄 Copying file:', { 
        originalName: originalFile.file.name, 
        originalDescription: originalFile.file.description,
        targetFolderId 
      });
      
      // Ensure description is a string (not undefined or null)
      const fileDescription = typeof originalFile.file.description === 'string' 
        ? originalFile.file.description 
        : '';
      
      // Create a new file with the same properties but in the target location
      // Note: This is a simplified copy - in a real implementation you'd want to duplicate the actual file content
      const copyResponse = await fileService.createFile({
        name: `${originalFile.file.name} (Copy)`,
        description: fileDescription,
        folderId: targetFolderId,
        type: originalFile.file.type,
        size: originalFile.file.size,
        url: originalFile.file.url,
        isPublic: originalFile.file.isPublic
      });
      
      const file = copyResponse.file;
      return {
        id: file.id,
        name: file.name,
        description: file.description,
        type: 'file' as const,
        size: file.size,
        mimeType: file.type,
        url: file.url,
        isPublic: file.isPublic,
        userId: file.userId,
        userName: 'You',
        folderId: file.folderId,
        parentId: file.folderId,
        path: `/${file.name}`,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      };
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw error;
    }
  },

  // Get document content for editing
  async getDocumentContent(documentId: string): Promise<{ content: string; name: string; description?: string }> {
    try {
      // For now, we'll retrieve the document and use the description field as content
      // In a real implementation, you'd want to fetch from a separate content field
      const response = await fileService.getFileById(documentId);
      
      return {
        content: response.file.description || '',
        name: response.file.name,
        description: response.file.description
      };
    } catch (error) {
      console.error('Failed to get document content:', error);
      throw error;
    }
  },

  // Update document
  async updateDocument(documentId: string, updates: UpdateDocumentRequest & { content?: string }): Promise<DocumentItem> {
    try {
      // First, we need to determine if this is a file or folder
      // For now, we'll assume it's a file since we're updating content
      // In a real implementation, you'd want to check the document type first
      
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.parentId) updateData.folderId = updates.parentId;
      if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
      
      // If we have content to update, we need to handle it specially
      if (updates.content !== undefined) {
        // For now, we'll store the content in the description field as a workaround
        // In a real implementation, you'd want to store this in a separate content field
        updateData.description = updates.content;
      }
      
      // Update the file using the existing fileService
      const response = await fileService.updateFile(documentId, updateData);
      
      // Return the updated document
      return {
        id: response.file.id,
        name: response.file.name,
        description: response.file.description,
        type: 'file' as const,
        size: response.file.size,
        mimeType: response.file.type,
        url: response.file.url,
        content: updates.content || response.file.description, // Include the updated content
        isPublic: response.file.isPublic,
        userId: response.file.userId,
        userName: response.file.user?.name || 'Unknown',
        userDepartment: undefined,
        folderId: response.file.folderId,
        parentId: response.file.folderId,
        path: `/${response.file.name}`,
        createdAt: response.file.createdAt,
        updatedAt: response.file.updatedAt
      };
    } catch (error) {
      console.error('Failed to update document:', error);
      throw error;
    }
  },

  // Search documents
  async searchDocuments(query: string, filters: Omit<DocumentFilters, 'search'> = {}): Promise<DocumentItem[]> {
    try {
      // For now, we'll get all documents and filter client-side
      // In a production environment, you'd want server-side search
      const response = await this.getAllDocuments(filters);
      const searchQuery = query.toLowerCase();
      
      return response.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery) ||
        item.description?.toLowerCase().includes(searchQuery) ||
        item.userName.toLowerCase().includes(searchQuery)
      );
    } catch (error) {
      console.error('Failed to search documents:', error);
      throw error;
    }
  },

  // Helper method to sort items
  sortItems(items: DocumentItem[], sortBy: 'name' | 'date' | 'size' | 'type', sortOrder: 'asc' | 'desc'): DocumentItem[] {
    const sorted = [...items].sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;

      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'size':
          const aSize = a.size || 0;
          const bSize = b.size || 0;
          comparison = aSize - bSize;
          break;
        case 'type':
          const aType = a.type;
          const bType = b.type;
          comparison = aType.localeCompare(bType);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  },

  // Build folder tree from flat list
  buildFolderTree(items: DocumentItem[]): DocumentItem[] {
    const itemMap = new Map<string, DocumentItem>();
    const rootItems: DocumentItem[] = [];

    // Create a map of all items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Build the tree structure
    items.forEach(item => {
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId)!;
        if (parent.children) {
          parent.children.push(itemMap.get(item.id)!);
        }
      } else {
        rootItems.push(itemMap.get(item.id)!);
      }
    });

    return rootItems;
  }
};
