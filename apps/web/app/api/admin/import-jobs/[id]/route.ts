import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@nursery/db';

async function handler(request: NextRequest) {
  if (request.method === 'GET') {
    try {
      // Extract ID from URL path
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return NextResponse.json(
          { error: 'Job ID is required' },
          { status: 400 }
        );
      }

      const job = await prisma.scrapingJob.findUnique({
        where: { id },
      });

      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(job);
    } catch (error) {
      console.error('Error fetching import job:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);

