import { NextRequest, NextResponse } from 'next/server';
import { getBackupDownload } from '@/lib/backup';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  return request.cookies.get('umbrella_session')?.value === 'admin';
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const backup = getBackupDownload(params.id);
    return new NextResponse(backup.content, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${backup.fileName}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Backup download failed.' }, { status: 404 });
  }
}
