import { NextResponse } from 'next/server';

// This middleware handles routing for the application
export function middleware(request) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;
  
  // Special handling for interview routes
  if (pathname.startsWith('/interview/')) {
    // Ensure the URL is preserved exactly as-is for interview routes
    return NextResponse.next();
  }
  
  // Default handling for all other routes
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    // Match all routes for consistent handling
    '/(.*)',
  ],
};
