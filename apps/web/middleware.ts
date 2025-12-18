import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protect admin API routes, but allow public routes for dashboard
  const pathname = request.nextUrl.pathname;
  
  // Skip auth for public dashboard routes
  if (pathname.includes('/public') || pathname.includes('/start') || pathname.includes('/fix-categories')) {
    return NextResponse.next();
  }
  
  if (pathname.startsWith('/api/admin')) {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*',
};

