import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma, ScrapingJobStatus } from '@nursery/db';

async function handler(request: NextRequest) {
  if (request.method === 'POST') {
    try {
      // Extract ID from URL path
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 2]; // id is before 'stop'

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
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = withAuth(handler);

