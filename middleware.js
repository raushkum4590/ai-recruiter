'use client';

import { NextResponse } from 'next/server';

// This middleware will help debug and fix routing issues on Vercel
export function middleware(request) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;
  console.log('Middleware processing path:', pathname);

  // Check if this is an interview route
  if (pathname.startsWith('/interview/')) {
    console.log('Processing interview route:', pathname);
    
    // Ensure we maintain the full path for interview routes
    const url = request.nextUrl.clone();
    return NextResponse.rewrite(url);
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
