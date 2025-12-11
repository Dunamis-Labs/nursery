import { apiClient, adminApiClient } from './client';
// Product type will be available after Prisma client generation
// For now, using Prisma's generated types
type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productType: string;
  price: number;
  availability: string;
  categoryId: string;
  source: string;
  sourceId?: string | null;
  sourceUrl?: string | null;
  botanicalName?: string | null;
  commonName?: string | null;
  imageUrl?: string | null;
  images?: unknown;
  metadata?: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: PaginationMeta;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: Array<{ product: string; error: string }>;
}

export const productApi = {
  // Public endpoints
  async getProduct(slug: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${slug}`);
  },

  async getProducts(params?: {
    categoryId?: string;
    productType?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.productType) searchParams.set('productType', params.productType);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return apiClient.get<ProductsResponse>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  async getRelatedProducts(productId: string): Promise<Product[]> {
    const response = await apiClient.get<{ products: Product[] }>(
      `/products/${productId}/related`
    );
    return response.products;
  },

  async search(query: string, limit: number = 20): Promise<Product[]> {
    const response = await apiClient.get<{ products: Product[] }>(
      `/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.products;
  },

  // Admin endpoints (agent-accessible)
  async createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> {
    return adminApiClient.post<Product>('/admin/products', data);
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return adminApiClient.put<Product>(`/admin/products/${id}`, data);
  },

  async updateProductContent(
    productId: string,
    content: {
      detailedDescription?: string;
      growingRequirements?: string;
      careInstructions?: string;
      uses?: string;
      benefits?: string;
    }
  ): Promise<{ id: string; productId: string }> {
    return adminApiClient.post(`/admin/products/${productId}/content`, content);
  },

  async importProducts(products: Product[]): Promise<ImportResult> {
    return adminApiClient.post<ImportResult>('/admin/products/import', { products });
  },

  async updateIncremental(updates: Array<{ id: string; data: Partial<Product> }>): Promise<ImportResult> {
    return adminApiClient.post<ImportResult>('/admin/products/update-incremental', { updates });
  },

  async generateContent(productIds: string[]): Promise<{ success: number; errors: number }> {
    return adminApiClient.post('/admin/products/generate-content', { productIds });
  },

  async bulkContentUpdate(
    updates: Array<{
      productId: string;
      content: {
        detailedDescription?: string;
        growingRequirements?: string;
        careInstructions?: string;
        uses?: string;
        benefits?: string;
      };
    }>
  ): Promise<{ success: number; errors: number }> {
    return adminApiClient.post('/admin/products/bulk-content', { updates });
  },
};

