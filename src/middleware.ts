import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Check if sb_region cookie exists
  const regionCookie = request.cookies.get('sb_region');
  
  if (!regionCookie) {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    
    // TODO (backend): Implement actual IP geolocation
    // For now, default to 'US'
    const defaultRegion = 'US';
    
    // Set cookie for 30 days
    response.cookies.set('sb_region', defaultRegion, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      httpOnly: false, // Allow client-side access
    });
    
    // Set response header for immediate use
    response.headers.set('x-sb-region', defaultRegion);
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

