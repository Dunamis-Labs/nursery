import { NextRequest, NextResponse } from 'next/server';
import { ScrapingJobType } from '@nursery/db';
import { z } from 'zod';

const createImportJobSchema = z.object({
  jobType: z.enum(['FULL', 'INCREMENTAL']).default('FULL'),
  useApi: z.boolean().default(false),
  category: z.string().optional(),
  maxProducts: z.number().positive().optional(),
});

/**
 * Server-side API route for starting import jobs
 * This route doesn't require API key authentication since it's only accessible
 * from the admin dashboard (which should be protected separately)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createImportJobSchema.parse(body);

    // Dynamic import to prevent build-time analysis of optional dependencies
    const { DataImportService } = await import('@nursery/data-import');
    
    // Initialize import service
    const importService = new DataImportService({
      baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
      useProxy: process.env.PLANTMARK_USE_PROXY === 'true',
      proxyUrl: process.env.PLANTMARK_PROXY_URL,
      rateLimitMs: parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000'),
      email: process.env.PLANTMARK_EMAIL?.replace(/^"|"$/g, ''),
      password: process.env.PLANTMARK_PASSWORD?.replace(/^"|"$/g, ''),
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
        id: jobId,
        jobId,
        status: 'pending',
        message: 'Import job started. Use GET /api/admin/import-jobs/{id} to check status.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error creating import job:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

