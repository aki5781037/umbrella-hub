import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login', '/logout'];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0];
  const pathname = request.nextUrl.pathname;
  const session = request.cookies.get('umbrella_session')?.value;
  const isPortalHost = host === 'portal.arkumbrella.com';

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', isPortalHost ? '/portal' : pathname);
    return NextResponse.redirect(url);
  }

  if (session === 'customer' && !pathname.startsWith('/portal')) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  if (isPortalHost && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/customers/:path*', '/mail/:path*', '/umbrella-catalog/:path*', '/projects/:path*', '/tasks/:path*', '/portal/:path*', '/login', '/logout']
};
