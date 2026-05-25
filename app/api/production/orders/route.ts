import { NextRequest, NextResponse } from 'next/server';
import { addProductionOrder } from '@/lib/production';

export const dynamic = 'force-dynamic';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

export async function POST(request: NextRequest) {
  if (request.cookies.get('umbrella_session')?.value !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const customerId = String(formData.get('customerId') || '').trim();
  const orderNo = String(formData.get('orderNo') || '').trim();
  const product = String(formData.get('product') || '').trim();
  const owner = String(formData.get('owner') || '').trim();

  if (!customerId || !orderNo || !product || !owner) {
    return NextResponse.json({ error: '客户、订单号、产品和负责人不能为空。' }, { status: 400 });
  }

  const order = addProductionOrder({
    customerId,
    orderNo,
    product,
    owner,
    quantity: String(formData.get('quantity') || '').trim(),
    amount: String(formData.get('amount') || '').trim(),
    factory: String(formData.get('factory') || '').trim(),
    priority: String(formData.get('priority') || '').trim(),
    risk: String(formData.get('risk') || '').trim(),
    due: String(formData.get('due') || '').trim(),
    shipDate: String(formData.get('shipDate') || '').trim(),
    nextAction: String(formData.get('nextAction') || '').trim(),
    taskLines: String(formData.get('taskLines') || '').trim()
  });

  if (!order) {
    return NextResponse.json({ error: '生产订单创建失败。' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, `/production?customer=${encodeURIComponent(order.customerId)}&order=${encodeURIComponent(order.id)}`), 303);
}
