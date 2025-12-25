import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@nursery/db';
import { ScrapingJobType } from '@nursery/db';
import { z } from 'zod';

const createImportJobSchema = z.object({
  jobType: z.enum(['FULL', 'INCREMENTAL']).default('FULL'),
  useApi: z.boolean().default(true),
  category: z.string().optional(),
  maxProducts: z.number().positive().optional(),
});

async function handler(request: NextRequest) {
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const validatedData = createImportJobSchema.parse(body);

      // Dynamic import to prevent build-time analysis of optional dependencies
      // This package is optional and not available on Vercel
      let DataImportService;
      try {
        const module = await import('@nursery/data-import');
        DataImportService = module.DataImportService;
      } catch (error) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Data import service is not available in this environment',
            details: 'Scraping functionality is only available in local development'
          },
          { status: 503 }
        );
      }
      
      // Initialize import service
      const importService = new DataImportService({
        baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
        useProxy: process.env.PLANTMARK_USE_PROXY === 'true',
        proxyUrl: process.env.PLANTMARK_PROXY_URL,
        rateLimitMs: parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000'),
      });

      // Create job
      const jobId = await importService.startImportJob({
        jobType: validatedData.jobType as ScrapingJobType,
        useApi: validatedData.useApi,
        category: validatedData.category,
        maxProducts: validatedData.maxProducts,
      });

      // Execute import asynchronously (don't wait for completion)
      importService.executeImport(jobId, {
        jobType: validatedData.jobType as ScrapingJobType,
        useApi: validatedData.useApi,
        category: validatedData.category,
        maxProducts: validatedData.maxProducts,
      }).catch((error) => {
        console.error('Import job failed:', error);
      });

      return NextResponse.json(
        {
          jobId,
          status: 'pending',
          message: 'Import job started. Use GET /api/admin/import-jobs/{id} to check status.',
        },
        { status: 202 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Error creating import job:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'GET') {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const jobs = await prisma.scrapingJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return NextResponse.json({
        jobs,
        total: jobs.length,
      });
    } catch (error) {
      console.error('Error fetching import jobs:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = withAuth(handler);
export const GET = withAuth(handler);

