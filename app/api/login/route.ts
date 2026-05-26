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

  // 1. 显式清除有可能残留在共享域名 (.arkumbrella.com) 下的老旧 Cookie，防止干扰
  if (sharedDomain) {
    response.headers.append('Set-Cookie', `umbrella_session=; Path=/; Max-Age=0; Domain=${sharedDomain}; Secure; HttpOnly; SameSite=Lax`);
    response.headers.append('Set-Cookie', `umbrella_identity=; Path=/; Max-Age=0; Domain=${sharedDomain}; Secure; HttpOnly; SameSite=Lax`);
  }

  // 2. 统一使用极其稳定、没有任何多域冲突问题的 Host-only Cookie
  const secureFlag = process.env.NODE_ENV === 'production' || request.nextUrl.protocol === 'https:';

  response.cookies.set('umbrella_session', matchedAccount.role, {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureFlag,
    path: '/',
    maxAge: 60 * 60 * 8
  });
  response.cookies.set('umbrella_identity', matchedAccount.email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureFlag,
    path: '/',
    maxAge: 60 * 60 * 8
  });

  return response;
}
