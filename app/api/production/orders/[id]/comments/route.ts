import { NextRequest, NextResponse } from 'next/server';
import { getCustomerIdForIdentity } from '@/lib/auth';
import { addProductionOrderComment, getProductionOrderById, orderIsClosed } from '@/lib/production';

export const dynamic = 'force-dynamic';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = request.cookies.get('umbrella_session')?.value;
  const identity = request.cookies.get('umbrella_identity')?.value;

  if (session !== 'admin' && session !== 'customer') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const order = getProductionOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Production order not found.' }, { status: 404 });
  }

  if (session === 'customer') {
    const customerId = getCustomerIdForIdentity(identity);
    if (!customerId || order.customerId !== customerId || orderIsClosed(order)) {
      return NextResponse.json({ error: 'Production order not found.' }, { status: 404 });
    }
  }

  const formData = await request.formData();
  const body = String(formData.get('body') || '').trim();
  const authorName = session === 'customer' ? order.customer : '内部团队';
  const updatedOrder = addProductionOrderComment(order.id, {
    authorRole: session,
    authorName,
    body
  });

  if (!updatedOrder) {
    return NextResponse.json({ error: '评论添加失败。' }, { status: 400 });
  }

  const redirectPath = session === 'customer'
    ? `/portal/production/${encodeURIComponent(updatedOrder.id)}`
    : `/production?customer=${encodeURIComponent(updatedOrder.customerId)}&order=${encodeURIComponent(updatedOrder.id)}`;

  return NextResponse.redirect(appUrl(request, redirectPath), 303);
}
