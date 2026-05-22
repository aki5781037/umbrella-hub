import { NextRequest, NextResponse } from 'next/server';
import { findAccount, normalizeNextPath } from '@/lib/auth';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
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
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  };

  response.cookies.set('umbrella_session', matchedAccount.role, cookieOptions);
  response.cookies.set('umbrella_identity', matchedAccount.email, cookieOptions);

  return response;
}
