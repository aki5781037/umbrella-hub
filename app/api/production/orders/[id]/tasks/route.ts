import { NextRequest, NextResponse } from 'next/server';
import {
  addProductionOrderTask,
  deleteProductionOrderTask,
  getProductionOrderById,
  updateProductionOrderTask
} from '@/lib/production';

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
  const intent = String(formData.get('intent') || '').trim();
  const taskId = String(formData.get('taskId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const due = String(formData.get('due') || '').trim();
  const done = String(formData.get('done') || '') === 'true';

  const updatedOrder =
    intent === 'add'
      ? addProductionOrderTask(order.id, { title, due })
      : intent === 'delete'
        ? deleteProductionOrderTask(order.id, taskId)
        : intent === 'toggle'
          ? updateProductionOrderTask(order.id, taskId, done)
        : undefined;

  if (!updatedOrder) {
    return NextResponse.json({ error: '生产子任务更新失败。' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, `/production?customer=${encodeURIComponent(updatedOrder.customerId)}&order=${encodeURIComponent(updatedOrder.id)}`), 303);
}
