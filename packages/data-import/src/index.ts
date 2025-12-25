export { PlantmarkApiClient } from './services/PlantmarkApiClient';
export { DataImportService } from './services/DataImportService';
export { ImageDownloadService } from './services/ImageDownloadService';
export * from './types';
export { validateProduct, normalizeProduct, generateSlug } from './utils/validation';

// PlantmarkScraper is only available in development - lazy export to prevent build analysis
// This prevents Turbopack from trying to resolve puppeteer/playwright during build
export async function getPlantmarkScraper() {
  // Only load in development/local environments
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    throw new Error('PlantmarkScraper is only available in local development');
  }
  const { PlantmarkScraper } = await import('./services/PlantmarkScraper');
  return PlantmarkScraper;
}

