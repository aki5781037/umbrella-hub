import { NextRequest, NextResponse } from 'next/server';
import { findAccount, normalizeNextPath } from '@/lib/auth';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

function cookieDomain(request: NextRequest) {
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host).split(':')[0].toLowerCase();
  return host.endsWith('arkumbrella.com') ? '.arkumbrella.com' : undefined;
}

function expireHostCookieHeader(name: string) {
  return `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax`;
}

function sharedCookieHeader(name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${60 * 60 * 8}; Domain=.arkumbrella.com; Secure; HttpOnly; SameSite=Lax`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const nextPath = normalizeNextPath(formData.get('next'));
  const matchedAccount = findAccount(email, password);

  if (!matchedAccount) {
    return NextResponse.redirect(appUrl(request, `/login?error=invalid&next=${encodeURIComponent(nextPath)}`), 303);
  }

  const response = NextResponse.redirect(appUrl(request, matchedAccount.role === 'customer' ? '/portal' : nextPath), 303);
  const sharedDomain = cookieDomain(request);

  response.headers.append('Set-Cookie', expireHostCookieHeader('umbrella_session'));
  response.headers.append('Set-Cookie', expireHostCookieHeader('umbrella_identity'));

  if (sharedDomain) {
    response.headers.append('Set-Cookie', sharedCookieHeader('umbrella_session', matchedAccount.role));
    response.headers.append('Set-Cookie', sharedCookieHeader('umbrella_identity', matchedAccount.email));
  } else {
    response.cookies.set('umbrella_session', matchedAccount.role, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8
    });
    response.cookies.set('umbrella_identity', matchedAccount.email, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8
    });
  }

  return response;
}
