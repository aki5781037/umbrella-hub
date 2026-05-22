import { NextResponse, NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('host') ?? request.nextUrl.host;
  const response = NextResponse.redirect(new URL('/login', `${protocol}://${host}`));

  response.cookies.delete('umbrella_session');
  response.cookies.delete('umbrella_identity');

  return response;
}
