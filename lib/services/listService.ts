import api from './api';
import { 
  List, 
  ListItem, 
  CreateListRequest, 
  UpdateListRequest, 
  CreateListItemRequest, 
  UpdateListItemRequest,
  ListFilters,
  ExpiringItem
} from '@/types';

export const listService = {
  // List Management
  async getLists(params?: { page?: number; limit?: number; search?: string }): Promise<{ lists: List[]; total?: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/lists?${queryParams.toString()}`);
    return response.data;
  },

  async getList(listId: string): Promise<{ list: List }> {
    const response = await api.get(`/lists/${listId}`);
    return response.data;
  },

  async createList(data: CreateListRequest): Promise<{ list: List }> {
    const response = await api.post('/lists', data);
    return response.data;
  },

  async updateList(listId: string, data: UpdateListRequest): Promise<{ list: List }> {
    const response = await api.put(`/lists/${listId}`, data);
    return response.data;
  },

  async deleteList(listId: string): Promise<{ message: string }> {
    const response = await api.delete(`/lists/${listId}`);
    return response.data;
  },

  // Member Management
  async addMember(listId: string, userId: string): Promise<{ member: any }> {
    const response = await api.post(`/lists/${listId}/members`, { userId });
    return response.data;
  },

  async removeMember(listId: string, userId: string): Promise<{ message: string }> {
    const response = await api.delete(`/lists/${listId}/members/${userId}`);
    return response.data;
  },

  // Item Management
  async getListItems(listId: string, filters?: ListFilters & { page?: number; limit?: number }): Promise<{ items: ListItem[]; total?: number }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.name) params.append('name', filters.name);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/lists/${listId}/items?${params.toString()}`);
    return response.data;
  },

  async createListItem(listId: string, data: CreateListItemRequest): Promise<{ item: ListItem }> {
    const response = await api.post(`/lists/${listId}/items`, data);
    return response.data;
  },

  async updateListItem(listId: string, itemId: string, data: UpdateListItemRequest): Promise<{ item: ListItem }> {
    const response = await api.put(`/lists/${listId}/items/${itemId}`, data);
    return response.data;
  },

  async deleteListItem(listId: string, itemId: string): Promise<{ message: string }> {
    const response = await api.delete(`/lists/${listId}/items/${itemId}`);
    return response.data;
  },

  // Expiration Management
  async getExpiringItems(listId: string, days: number = 1): Promise<{ expiringItems: ExpiringItem[] }> {
    const response = await api.get(`/lists/${listId}/expiring?days=${days}`);
    return response.data;
  },

  // Excel Export
  async exportToExcel(listId: string, filters?: ListFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.name) params.append('name', filters.name);

    const response = await api.get(`/lists/${listId}/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default listService;
