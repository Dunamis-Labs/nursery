import { apiClient, adminApiClient } from './client';
import type { Category } from '@nursery/db';

export const categoryApi = {
  // Public endpoints
  async getCategory(slug: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${slug}`);
  },

  async getCategories(parentId?: string): Promise<Category[]> {
    const query = parentId ? `?parentId=${parentId}` : '';
    return apiClient.get<Category[]>(`/categories${query}`);
  },

  // Admin endpoints (agent-accessible)
  async createCategory(
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Category> {
    return adminApiClient.post<Category>('/admin/categories', data);
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return adminApiClient.put<Category>(`/admin/categories/${id}`, data);
  },

  async updateCategoryContent(
    categoryId: string,
    content: {
      description?: string;
      tips?: string;
    }
  ): Promise<{ id: string; categoryId: string }> {
    return adminApiClient.post(`/admin/categories/${categoryId}/content`, content);
  },
};

