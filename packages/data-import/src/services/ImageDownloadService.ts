import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { createHash } from 'crypto';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import https from 'https';
import http from 'http';
import { lookup } from 'dns/promises';
import { URL } from 'url';

export interface ImageDownloadResult {
  success: boolean;
  localPath?: string;
  error?: string;
}

export interface ImageDownloadOptions {
  baseUrl?: string; // Base URL for local paths (e.g., '/products/')
  outputDir?: string; // Absolute path to output directory
  timeout?: number; // Download timeout in ms
  retries?: number; // Number of retry attempts
}

/**
 * Service to download images from external URLs and save them locally
 */
export class ImageDownloadService {
  private baseUrl: string;
  private outputDir: string;
  private timeout: number;
  private retries: number;

  constructor(options: ImageDownloadOptions = {}) {
    // Default to apps/web/public/products/ directory
    const defaultOutputDir = join(process.cwd(), 'apps', 'web', 'public', 'products');
    
    this.baseUrl = options.baseUrl || '/products/';
    this.outputDir = options.outputDir || defaultOutputDir;
    this.timeout = options.timeout || 30000; // 30 seconds (reduced for faster failure detection)
    this.retries = options.retries || 2; // Reduced retries to fail faster and move on

    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Download a single image from URL
   */
  async downloadImage(imageUrl: string, productSlug?: string): Promise<ImageDownloadResult> {
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return {
        success: false,
        error: 'Invalid image URL',
      };
    }

    // Try to get full-size image by removing thumbnail suffixes (_400, _750, etc.)
    let fullSizeUrl = imageUrl;
    if (imageUrl.includes('_400') || imageUrl.includes('_750')) {
      // Remove thumbnail suffixes to get full-size image
      fullSizeUrl = imageUrl.replace(/_[0-9]+\.(jpg|jpeg|png|webp)$/i, '.$1');
    }

    // Generate filename from URL or product slug
    const filename = this.generateFilename(fullSizeUrl, productSlug);
    const localPath = join(this.outputDir, filename);
    const relativePath = `${this.baseUrl}${filename}`;

    // Skip if already downloaded
    if (existsSync(localPath)) {
      return {
        success: true,
        localPath: relativePath,
      };
    }

    // Download with retries - try full-size first, then fallback to original URL
    let lastError: Error | null = null;
    const urlsToTry = fullSizeUrl !== imageUrl ? [fullSizeUrl, imageUrl] : [imageUrl];
    
    for (const urlToTry of urlsToTry) {
      for (let attempt = 1; attempt <= this.retries; attempt++) {
        try {
          await this.downloadFile(urlToTry, localPath);
          return {
            success: true,
            localPath: relativePath,
          };
        } catch (error: any) {
          lastError = error instanceof Error ? error : new Error(String(error));
          const errorMessage = lastError.message || String(error) || 'Unknown error';
          const errorDetails = error?.code ? ` (${error.code})` : '';
          
          if (attempt < this.retries) {
            // Only log if it's not a timeout (reduce noise)
            if (!errorMessage.includes('timeout') && !errorMessage.includes('ETIMEDOUT')) {
              console.warn(`Download attempt ${attempt}/${this.retries} failed for ${urlToTry}: ${errorMessage}${errorDetails}`);
            }
            // Wait before retry (exponential backoff, longer for timeouts)
            const delay = errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT') 
              ? 2000 * attempt 
              : 1000 * attempt;
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Last attempt failed for this URL, try next URL if available
            if (urlsToTry.indexOf(urlToTry) < urlsToTry.length - 1) {
              console.warn(`Failed to download ${urlToTry}, trying fallback URL...`);
              break; // Break inner loop to try next URL
            } else {
              // All URLs failed
              return {
                success: false,
                error: `Failed after ${this.retries} attempts: ${errorMessage}${errorDetails}`,
              };
            }
          }
        }
      }
    }

    // Fallback (shouldn't reach here, but TypeScript needs it)
    return {
      success: false,
      error: lastError ? lastError.message : 'Unknown error',
    };

    return {
      success: false,
      error: 'Max retries exceeded',
    };
  }

  /**
   * Download multiple images
   */
  async downloadImages(
    imageUrls: string[],
    productSlug?: string
  ): Promise<{ downloaded: string[]; failed: Array<{ url: string; error: string }> }> {
    const downloaded: string[] = [];
    const failed: Array<{ url: string; error: string }> = [];

    for (const url of imageUrls) {
      const result = await this.downloadImage(url, productSlug);
      if (result.success && result.localPath) {
        downloaded.push(result.localPath);
      } else {
        failed.push({ url, error: result.error || 'Unknown error' });
      }
    }

    return { downloaded, failed };
  }

  /**
   * Generate a safe filename from URL
   */
  private generateFilename(imageUrl: string, productSlug?: string): string {
    try {
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      const extension = extname(pathname) || '.jpg';
      
      // Try to get original filename
      const originalName = basename(pathname, extension);
      
      // Create hash from URL for uniqueness
      const hash = createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      
      // Sanitize filename
      const sanitizedName = (productSlug || originalName || 'image')
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase()
        .substring(0, 50);
      
      return `${sanitizedName}-${hash}${extension}`;
    } catch {
      // Fallback if URL parsing fails
      const hash = createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      return `image-${hash}.jpg`;
    }
  }

  /**
   * Download file from URL to local path
   * Uses https module with IPv4-only DNS to avoid connection issues
   */
  private async downloadFile(url: string, outputPath: string): Promise<void> {
    // Use https module with IPv4-only DNS resolution (more reliable than fetch)
    return this.downloadFileWithHttps(url, outputPath);
  }

  /**
   * Download using fetch API (better connection handling)
   */
  private async downloadFileWithFetch(url: string, outputPath: string): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Force IPv4 by using dns.lookup with family=4
      // But since we can't easily do that with fetch, we'll increase timeout and add delays
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.plantmark.com.au/',
          'Origin': 'https://www.plantmark.com.au',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Connection': 'keep-alive',
        },
        // @ts-ignore - redirect option exists in fetch
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get response body
      const body = response.body;
      if (!body) {
        throw new Error('Response body is null');
      }

      // Ensure directory exists
      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Convert ReadableStream (Web Streams API) to Node.js stream
      const nodeStream = Readable.fromWeb(body as any);
      const fileStream = createWriteStream(outputPath);

      // Pipe to file with error handling
      try {
        await pipeline(nodeStream, fileStream);
      } catch (pipeError: any) {
        // Delete partial file on error
        if (existsSync(outputPath)) {
          try {
            require('fs').unlinkSync(outputPath);
          } catch {
            // Ignore unlink errors
          }
        }
        const errorMessage = pipeError?.message || pipeError?.toString() || String(pipeError) || 'Unknown pipe error';
        throw new Error(`Pipeline error: ${errorMessage}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Delete partial file on error
      if (existsSync(outputPath)) {
        try {
          require('fs').unlinkSync(outputPath);
        } catch {
          // Ignore unlink errors
        }
      }

      if (error.name === 'AbortError') {
        throw new Error(`Download timeout after ${this.timeout}ms`);
      }
      
      // Extract detailed error information
      const errorMessage = error?.message || error?.toString() || String(error) || 'Unknown error';
      const errorCode = error?.code || '';
      const errorCause = error?.cause ? ` (cause: ${String(error.cause)})` : '';
      const errorName = error?.name || '';
      const fullError = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
      
      // Only log detailed errors if it's not a timeout (to reduce noise)
      if (errorCode !== 'ETIMEDOUT') {
        console.error(`Full error details for ${url}:`, {
          name: errorName,
          message: errorMessage,
          code: errorCode,
          cause: error?.cause,
        });
      }
      
      // Check for specific error types
      if (errorMessage.includes('ECONNREFUSED') || errorCode === 'ECONNREFUSED') {
        throw new Error(`Connection refused: ${url}${errorCode ? ` (code: ${errorCode})` : ''}`);
      } else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT') {
        throw new Error(`Connection timeout: ${url}${errorCode ? ` (code: ${errorCode})` : ''}`);
      } else if (errorMessage.includes('ENOTFOUND') || errorCode === 'ENOTFOUND') {
        throw new Error(`DNS lookup failed: ${url}${errorCode ? ` (code: ${errorCode})` : ''}`);
      } else if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
        throw new Error(`SSL/TLS error: ${url}${errorCode ? ` (code: ${errorCode})` : ''}`);
      } else if (errorMessage.includes('fetch failed')) {
        // Generic fetch failed - try to get more info from cause
        const causeInfo = error?.cause ? ` - ${String(error.cause)}` : '';
        throw new Error(`Fetch failed: ${url}${errorCode ? ` (code: ${errorCode})` : ''}${causeInfo}`);
      }
      
      throw new Error(`Download error: ${errorMessage}${errorCode ? ` (code: ${errorCode})` : ''}${errorCause}`);
    }
  }

  /**
   * Download using https module with IPv4-only DNS resolution
   * This is more reliable than fetch for network issues
   */
  private async downloadFileWithHttps(url: string, outputPath: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        // Force IPv4-only DNS lookup
        let hostname: string;
        try {
          const addresses = await lookup(urlObj.hostname, { family: 4 });
          hostname = addresses.address;
        } catch (dnsError) {
          // Fallback to original hostname if DNS lookup fails
          hostname = urlObj.hostname;
        }

        const options: any = {
          hostname: hostname,
          port: urlObj.port || (isHttps ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.plantmark.com.au/',
            'Host': urlObj.hostname, // Important: Set Host header to original hostname
            'Connection': 'keep-alive',
          },
          timeout: this.timeout,
        };

        // For HTTPS, add SNI (Server Name Indication) - critical for Cloudflare/CDN
        if (isHttps) {
          options.servername = urlObj.hostname; // SNI must match the certificate
        }

        // Ensure directory exists
        const dir = dirname(outputPath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        const fileStream = createWriteStream(outputPath);
        let timeoutId: NodeJS.Timeout;

        const req = client.request(options, (res) => {
          // Clear timeout on response
          if (timeoutId) clearTimeout(timeoutId);

          if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
            fileStream.destroy();
            if (existsSync(outputPath)) {
              try {
                require('fs').unlinkSync(outputPath);
              } catch {
                // Ignore unlink errors
              }
            }
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage || 'Unknown error'}`));
            return;
          }

          // Pipe response to file
          res.pipe(fileStream);

          fileStream.on('finish', () => {
            resolve();
          });

          res.on('error', (error) => {
            fileStream.destroy();
            if (existsSync(outputPath)) {
              try {
                require('fs').unlinkSync(outputPath);
              } catch {
                // Ignore unlink errors
              }
            }
            reject(error);
          });
        });

        req.on('error', (error) => {
          if (timeoutId) clearTimeout(timeoutId);
          fileStream.destroy();
          if (existsSync(outputPath)) {
            try {
              require('fs').unlinkSync(outputPath);
            } catch {
              // Ignore unlink errors
            }
          }
          reject(error);
        });

        req.on('timeout', () => {
          req.destroy();
          if (timeoutId) clearTimeout(timeoutId);
          fileStream.destroy();
          if (existsSync(outputPath)) {
            try {
              require('fs').unlinkSync(outputPath);
            } catch {
              // Ignore unlink errors
            }
          }
          reject(new Error(`Connection timeout after ${this.timeout}ms`));
        });

        // Set timeout
        timeoutId = setTimeout(() => {
          req.destroy();
          fileStream.destroy();
          if (existsSync(outputPath)) {
            try {
              require('fs').unlinkSync(outputPath);
            } catch {
              // Ignore unlink errors
            }
          }
          reject(new Error(`Request timeout after ${this.timeout}ms`));
        }, this.timeout);

        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

