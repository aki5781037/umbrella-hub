import { NextRequest, NextResponse } from 'next/server';
import { addCustomer } from '@/lib/data';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;

  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const country = String(formData.get('country') || '').trim();
  const owner = String(formData.get('owner') || '').trim();

  if (!name || !country || !owner) {
    return NextResponse.json({ error: '客户名称、国家/地区、负责人不能为空。' }, { status: 400 });
  }

  const customer = addCustomer({
    name,
    country,
    owner,
    legalName: String(formData.get('legalName') || '').trim(),
    type: String(formData.get('type') || '').trim(),
    level: String(formData.get('level') || '').trim(),
    source: String(formData.get('source') || '').trim(),
    status: String(formData.get('status') || '').trim(),
    next: String(formData.get('next') || '').trim(),
    contactName: String(formData.get('contactName') || '').trim(),
    contactTitle: String(formData.get('contactTitle') || '').trim(),
    contactEmail: String(formData.get('contactEmail') || '').trim(),
    contactPhone: String(formData.get('contactPhone') || '').trim(),
    preference: String(formData.get('preference') || '').trim()
  });

  return NextResponse.redirect(appUrl(request, `/customers/${customer.id}`), 303);
}
