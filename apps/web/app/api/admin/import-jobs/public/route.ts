import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

/**
 * Public API route for fetching import jobs (for dashboard)
 * This route doesn't require API key authentication since it's only accessible
 * from the admin dashboard (which should be protected separately)
 */
export async function GET(request: NextRequest) {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

