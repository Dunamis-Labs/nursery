import { MetadataRoute } from 'next';
import { prisma } from '@nursery/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Get all products
  const products = await prisma.product.findMany({
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
      updatedAt: true,
    },
  });

  // Get all categories
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Get all blog posts
  const blogPosts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Product pages
  const productUrls: MetadataRoute.Sitemap = products.map((product: { slug: string; category: { slug: string }; updatedAt: Date }) => ({
    url: `${baseUrl}/products/${product.category.slug}/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Category pages
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Blog posts
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Static pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  return [...staticUrls, ...categoryUrls, ...productUrls, ...blogUrls];
}

