import { NextRequest, NextResponse } from 'next/server';
import { authService } from './auth';

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Check with JWT token
    const { isAdmin, user, error } = await authService.checkAdminFromRequest(request);
    
    if (isAdmin) {
      return null; // Allow access for authenticated admin users
    }
    
    // In development mode, we'll allow access without token for testing
    // but only if no authorization header is provided
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'development' && !authHeader) {
      console.log('Development mode: allowing access without auth header for testing');
      return null;
    }
    
    console.warn(`Admin access denied for user ${user?.email || 'unknown'}: ${error}`);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Admin access required',
        message: 'You need admin privileges to access this endpoint'
      },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error in admin protection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication error',
        message: 'Failed to verify admin status'
      },
      { status: 500 }
    );
  }
}

export function withAdminProtection(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: any[]) => {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }
    
    return handler(request, ...args);
  };
} 