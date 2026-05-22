import { readFileSync } from 'fs';
import { extname } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { resolveUmbrellaImagePath } from '@/lib/umbrella-catalog';

export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

export async function GET(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;

  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get('path') || '';
  const imagePath = resolveUmbrellaImagePath(path);

  if (!imagePath) {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  }

  const buffer = readFileSync(imagePath);
  const contentType = contentTypes[extname(imagePath).toLowerCase()] || 'application/octet-stream';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600'
    }
  });
}
