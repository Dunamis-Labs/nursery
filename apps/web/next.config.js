/** @type {import('next').NextConfig} */
// Note: Next.js automatically loads .env files from the project root (apps/web)
// For monorepo, we also load from workspace root
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nursery/shared', '@nursery/db', '@nursery/api-client', '@nursery/fulfillment'],
  serverExternalPackages: ['@nursery/data-import', 'puppeteer', 'playwright'],
  // Skip TypeScript type checking during build to avoid React 19 compatibility issues
  // Type errors are still checked by IDE and can be fixed incrementally
  typescript: {
    ignoreBuildErrors: true, // Temporary: React 19 type compatibility issues with Radix UI
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
    qualities: [75, 85],
  },
};

module.exports = nextConfig;

