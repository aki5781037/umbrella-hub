import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { addProductionOrderDocument, getProductionOrderById } from '@/lib/production';
import { parseProductionDocument, type ProductionDocumentType } from '@/lib/production-document-parser';

export const dynamic = 'force-dynamic';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

function safeFileName(value: string) {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || `attachment-${Date.now()}`;
}

const documentTypes: ProductionDocumentType[] = ['contract', 'production_sheet', 'other'];

function normalizeDocumentType(value: FormDataEntryValue | null): ProductionDocumentType {
  const rawValue = String(value || 'other').trim();
  return documentTypes.includes(rawValue as ProductionDocumentType) ? rawValue as ProductionDocumentType : 'other';
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
  const upload = formData.get('attachment');
  const stage = String(formData.get('stage') || '').trim();
  const documentType = normalizeDocumentType(formData.get('documentType'));

  if (!(upload instanceof File) || !upload.name || upload.size <= 0) {
    return NextResponse.json({ error: '请选择要上传的附件。' }, { status: 400 });
  }

  if (upload.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: '附件不能超过 25MB。' }, { status: 400 });
  }

  const orderDirName = safeFileName(order.id);
  const storedName = `${Date.now()}-${safeFileName(upload.name)}`;
  const targetDir = join(process.cwd(), 'data', 'production-attachments', orderDirName);
  const buffer = Buffer.from(await upload.arrayBuffer());
  const parsedDocument = await parseProductionDocument({
    fileName: upload.name,
    buffer,
    documentType
  }).catch(() => ({
    documentType,
    textPreview: '文件已上传，但暂时无法自动解析。',
    orderDetails: {},
    productionSpec: {},
    recognizedLabels: []
  }));

  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(targetDir, storedName), buffer);

  const updatedOrder = addProductionOrderDocument(order.id, upload.name, storedName, {
    stage,
    documentType,
    parsedDocument
  });
  if (!updatedOrder) {
    return NextResponse.json({ error: '附件记录失败。' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, `/production?customer=${encodeURIComponent(updatedOrder.customerId)}&order=${encodeURIComponent(updatedOrder.id)}`), 303);
}
