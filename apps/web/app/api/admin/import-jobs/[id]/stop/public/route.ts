import { NextRequest, NextResponse } from 'next/server';
import { prisma, ScrapingJobStatus } from '@nursery/db';

/**
 * Public API route for stopping import jobs (for dashboard)
 * This route doesn't require API key authentication since it's only accessible
 * from the admin dashboard (which should be protected separately)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Update job status to failed (effectively stopping it)
    const job = await prisma.scrapingJob.update({
      where: { id },
      data: {
        status: ScrapingJobStatus.FAILED,
        completedAt: new Date(),
        metadata: {
          stopped: true,
          stoppedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: 'Import job stopped',
      job,
    });
  } catch (error) {
    console.error('Error stopping import job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

