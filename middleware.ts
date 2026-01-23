import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth session in cookie/localStorage
  // Note: We use localStorage in the client, so we check for a custom header
  // that gets set by the client-side auth check
  const authCookie = request.cookies.get('oht-auth');

  // For protected routes, we'll handle auth check client-side
  // since we're using Zustand with localStorage persistence
  // The middleware primarily handles the initial redirect logic

  // Allow all other routes - client-side will handle auth redirect
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};
