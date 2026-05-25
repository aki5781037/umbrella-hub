import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getCustomerIdForIdentity } from '@/lib/auth';
import { getProductionOrderAttachment, orderIsClosed } from '@/lib/production';

export const dynamic = 'force-dynamic';

function safeFileName(value: string) {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || 'attachment';
}

export async function GET(request: NextRequest, { params }: { params: { id: string; file: string } }) {
  const session = request.cookies.get('umbrella_session')?.value;
  const identity = request.cookies.get('umbrella_identity')?.value;

  if (session !== 'admin' && session !== 'customer') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const result = getProductionOrderAttachment(params.id, params.file);
  if (!result) {
    return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 });
  }

  if (session === 'customer') {
    const customerId = getCustomerIdForIdentity(identity);
    if (!customerId || result.order.customerId !== customerId || orderIsClosed(result.order)) {
      return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 });
    }
  }

  const orderDirName = safeFileName(result.order.id);
  const storedName = safeFileName(result.attachment.storedName);
  const filePath = join(process.cwd(), 'data', 'production-attachments', orderDirName, storedName);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Attachment file not found.' }, { status: 404 });
  }

  const file = readFileSync(filePath);

  return new NextResponse(file, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(result.attachment.name)}"`
    }
  });
}
