import { NextRequest, NextResponse } from 'next/server';
import { getProductionOrderById, updateProductionOrderStage } from '@/lib/production';

export const dynamic = 'force-dynamic';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (request.cookies.get('umbrella_session')?.value !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const order = getProductionOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Production order not found.' }, { status: 404 });
  }

  const formData = await request.formData();
  const stage = String(formData.get('stage') || '').trim();
  const updatedOrder = updateProductionOrderStage(order.id, stage);

  if (!updatedOrder) {
    return NextResponse.json({ error: '生产流程推进失败。' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, `/production?customer=${encodeURIComponent(updatedOrder.customerId)}&order=${encodeURIComponent(updatedOrder.id)}`), 303);
}
