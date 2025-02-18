import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the pathname (e.g., /abc123)
  const pathname = request.nextUrl.pathname;

  // Exclude API routes and other special routes
  if (
    pathname.startsWith('/api') || // API routes
    pathname.startsWith('/_next') || // Next.js internals
    pathname.startsWith('/static') || // Static files
    pathname === '/' || // Home page
    pathname === '/favicon.ico' // Favicon
  ) {
    return NextResponse.next();
  }

  // All other routes are considered potential short URLs
  // The actual redirection is handled by [slug].tsx
  return NextResponse.next();
}

// Configure which routes to run middleware on
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
