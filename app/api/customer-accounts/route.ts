import { NextRequest, NextResponse } from 'next/server';
import { saveCustomerAccount } from '@/lib/customer-accounts';
import { getCustomerById } from '@/lib/data';

export const dynamic = 'force-dynamic';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;

  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '').trim();
  const customerId = String(formData.get('customerId') || '').trim();
  const label = String(formData.get('label') || '').trim();

  if (!email || !password || !customerId) {
    return NextResponse.json({ error: 'Email, password and customer are required.' }, { status: 400 });
  }

  const customer = getCustomerById(customerId);
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
  }

  const account = saveCustomerAccount({
    email,
    password,
    customerId: customer.id,
    label: label || customer.name
  });

  if (!account) {
    return NextResponse.json({ error: 'Customer account could not be saved.' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, '/settings?account=saved'), 303);
}
