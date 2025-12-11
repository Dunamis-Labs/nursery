import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

/**
 * Validate API key for admin endpoints
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;

  // Simple validation against environment variable (for Phase 1)
  // In production, you'd validate against database
  const validKey = process.env.ADMIN_API_KEY;
  
  if (!validKey) {
    console.warn('ADMIN_API_KEY not configured');
    return false;
  }

  // In Phase 2, validate against database:
  // const keyRecord = await prisma.apiKey.findUnique({
  //   where: { key: apiKey },
  // });
  // return keyRecord?.isActive && (!keyRecord.expiresAt || keyRecord.expiresAt > new Date());

  return apiKey === validKey;
}

/**
 * Middleware wrapper for API route handlers that require authentication
 */
export function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey || !(await validateApiKey(apiKey))) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    return handler(request);
  };
}

