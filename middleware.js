import { NextResponse } from 'next/server';

// This middleware will help debug and fix routing issues on Vercel
export function middleware(request) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;
  
  // Check if this is an interview route
  if (pathname.startsWith('/interview/')) {
    // For interview routes, preserve the URL structure
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    // Match all interview routes
    '/interview/:path*',
  ],
};
