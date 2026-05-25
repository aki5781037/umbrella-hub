import { NextResponse, NextRequest } from 'next/server';

function cookieDomain(request: NextRequest) {
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host).split(':')[0].toLowerCase();
  return host.endsWith('arkumbrella.com') ? '.arkumbrella.com' : undefined;
}

export function GET(request: NextRequest) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('host') ?? request.nextUrl.host;
  const response = NextResponse.redirect(new URL('/login', `${protocol}://${host}`));
  const sharedDomain = cookieDomain(request);

  response.cookies.delete('umbrella_session');
  response.cookies.delete('umbrella_identity');

  if (sharedDomain) {
    response.cookies.set('umbrella_session', '', { domain: sharedDomain, path: '/', maxAge: 0 });
    response.cookies.set('umbrella_identity', '', { domain: sharedDomain, path: '/', maxAge: 0 });
  }

  return response;
}
