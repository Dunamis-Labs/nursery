import { adminApiClient } from './client';

export interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  source: string;
  startedAt?: string;
  completedAt?: string;
  results?: {
    created: number;
    updated: number;
    errors: number;
  };
}

export interface AnalyticsSearchData {
  query: string;
  count: number;
  zeroResults: boolean;
  avgBounceRate?: number;
}

export const admin = {
  // Scraping jobs
  async createScrapingJob(config: {
    source: string;
    options?: Record<string, unknown>;
  }): Promise<{ jobId: string }> {
    return adminApiClient.post('/admin/scraping-jobs', config);
  },

  async getScrapingJob(jobId: string): Promise<ScrapingJob> {
    return adminApiClient.get<ScrapingJob>(`/admin/scraping-jobs/${jobId}`);
  },

  async listScrapingJobs(params?: {
    status?: string;
    limit?: number;
  }): Promise<ScrapingJob[]> {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : '';
    return adminApiClient.get<ScrapingJob[]>(`/admin/scraping-jobs${query}`);
  },

  // Analytics
  async getSearchAnalytics(params?: {
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<AnalyticsSearchData[]> {
    return adminApiClient.post('/admin/analytics/search', params || {});
  },

  // Blog posts
  async createBlogPost(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    author?: string;
    publishedAt?: string;
  }): Promise<{ id: string }> {
    return adminApiClient.post('/admin/blog-posts', data);
  },

  async updateBlogPost(
    id: string,
    data: {
      title?: string;
      excerpt?: string;
      content?: string;
      status?: string;
      publishedAt?: string;
    }
  ): Promise<{ id: string }> {
    return adminApiClient.put(`/admin/blog-posts/${id}`, data);
  },

  async deleteBlogPost(id: string): Promise<void> {
    return adminApiClient.delete(`/admin/blog-posts/${id}`);
  },
};

