/** @type {import('next').NextConfig} */
// Note: Next.js automatically loads .env files from the project root
// Vercel provides environment variables automatically, no dotenv needed

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nursery/shared', '@nursery/db', '@nursery/api-client', '@nursery/fulfillment'],
  serverExternalPackages: ['@nursery/data-import', 'puppeteer', 'playwright'],
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
  },
};

module.exports = nextConfig;

