import type { PlantmarkProduct, PlantmarkApiConfig, PlantmarkApiResponse } from '../types';

/**
 * Plantmark API Client
 * 
 * PREFERRED METHOD: Uses Plantmark's internal API if available.
 * This client attempts to discover and use API endpoints by inspecting
 * network requests from plantmark.com.au.
 * 
 * FALLBACK: If API is not available, use PlantmarkScraper instead.
 * 
 * To discover endpoints, run: npm run discover:plantmark
 */
export class PlantmarkApiClient {
  private config: Required<PlantmarkApiConfig>;
  private lastRequestTime: number = 0;
  private discoveredEndpoints: {
    productList?: string;
    productDetail?: string;
    categories?: string;
    search?: string;
  } = {};

  constructor(config: PlantmarkApiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://www.plantmark.com.au',
      apiKey: config.apiKey || '',
      useProxy: config.useProxy || false,
      proxyUrl: config.proxyUrl || '',
      rateLimitMs: config.rateLimitMs || 2000, // Default: 1 request per 2 seconds
      email: config.email || '',
      password: config.password || '',
    };

    // Try to load discovered endpoints from discovery script
    this.loadDiscoveredEndpoints();
  }

  /**
   * Load discovered endpoints from discovery script output
   */
  private loadDiscoveredEndpoints(): void {
    try {
      // In a real implementation, you'd load from the JSON file
      // For now, we'll discover endpoints dynamically
      // This will be populated after running the discovery script
    } catch (error) {
      // Endpoints file not found, will need to discover
    }
  }

  /**
   * Discover API endpoints by inspecting network requests
   * This should be called first to identify available endpoints
   * 
   * Run: npm run discover:plantmark
   */
  async discoverEndpoints(): Promise<{
    productList?: string;
    productDetail?: string;
    categories?: string;
    search?: string;
  }> {
    // TODO: Implement endpoint discovery or load from discovery script output
    // The discovery script (scripts/discover-plantmark-api.ts) should be run first
    // to identify endpoints, then they can be loaded here
    
    return this.discoveredEndpoints;
  }

  /**
   * Set discovered endpoints (called after running discovery script)
   */
  setDiscoveredEndpoints(endpoints: {
    productList?: string;
    productDetail?: string;
    categories?: string;
    search?: string;
  }): void {
    this.discoveredEndpoints = endpoints;
  }

  /**
   * Fetch products from Plantmark API
   * 
   * @param page Page number (1-indexed)
   * @param pageSize Number of products per page
   * @param category Optional category filter
   */
  async getProducts(
    page: number = 1,
    pageSize: number = 50,
    category?: string
  ): Promise<PlantmarkApiResponse> {
    await this.rateLimit();

    if (!this.discoveredEndpoints.productList) {
      throw new Error(
        'Product list endpoint not discovered. ' +
        'Run "npm run discover:plantmark" first or use PlantmarkScraper as fallback.'
      );
    }

    const url = this.buildUrl(this.discoveredEndpoints.productList, {
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(category && { category }),
    });

    const response = await this.fetchWithProxy(url);
    return this.parseApiResponse(response);
  }

  /**
   * Fetch a single product by ID
   */
  async getProduct(productId: string): Promise<PlantmarkProduct | null> {
    await this.rateLimit();

    if (!this.discoveredEndpoints.productDetail) {
      throw new Error(
        'Product detail endpoint not discovered. ' +
        'Run "npm run discover:plantmark" first or use PlantmarkScraper as fallback.'
      );
    }

    const url = this.buildUrl(this.discoveredEndpoints.productDetail.replace('{id}', productId));
    const response = await this.fetchWithProxy(url);
    const data = await this.parseApiResponse(response);
    
    // Extract product from response (structure depends on API)
    if (data.products && Array.isArray(data.products) && data.products.length > 0) {
      return data.products[0] as PlantmarkProduct;
    }
    
    return null;
  }

  /**
   * Search products
   */
  async searchProducts(query: string, page: number = 1): Promise<PlantmarkApiResponse> {
    await this.rateLimit();

    if (!this.discoveredEndpoints.search) {
      throw new Error(
        'Search endpoint not discovered. ' +
        'Run "npm run discover:plantmark" first or use PlantmarkScraper as fallback.'
      );
    }

    const url = this.buildUrl(this.discoveredEndpoints.search, {
      q: query,
      page: page.toString(),
    });

    const response = await this.fetchWithProxy(url);
    return this.parseApiResponse(response);
  }

  /**
   * Fetch categories
   */
  async getCategories(): Promise<Array<{ id: string; name: string; parentId?: string }>> {
    await this.rateLimit();

    if (!this.discoveredEndpoints.categories) {
      throw new Error(
        'Categories endpoint not discovered. ' +
        'Run "npm run discover:plantmark" first or use PlantmarkScraper as fallback.'
      );
    }

    const url = this.buildUrl(this.discoveredEndpoints.categories);
    const response = await this.fetchWithProxy(url);
    const data = await this.parseApiResponse(response);
    
    // Extract categories from response (structure depends on API)
    if (Array.isArray(data)) {
      return data as Array<{ id: string; name: string; parentId?: string }>;
    }
    
    return [];
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.config.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  /**
   * Rate limiting: ensure minimum delay between requests
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.config.rateLimitMs) {
      const delay = this.config.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch with optional proxy support
   */
  private async fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NurseryBot/1.0)',
        'Accept': 'application/json',
        ...options.headers,
      },
    };

    // Add API key if configured
    if (this.config.apiKey) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${this.config.apiKey}`,
      };
    }

    // Use proxy if configured
    if (this.config.useProxy && this.config.proxyUrl) {
      // Proxy implementation would go here
      // For now, we'll use direct fetch
      // In production, you might use a library like 'https-proxy-agent'
      console.warn('Proxy support not yet implemented, using direct connection');
    }

    return fetch(url, fetchOptions);
  }

  /**
   * Parse API response into standardized format
   */
  private async parseApiResponse(response: Response): Promise<PlantmarkApiResponse> {
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as PlantmarkApiResponse;
    
    // Normalize response structure
    // The actual structure depends on Plantmark's API format
    // This is a placeholder that may need adjustment
    
    return data;
  }
}
