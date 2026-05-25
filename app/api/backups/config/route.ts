import { NextRequest, NextResponse } from 'next/server';
import { getBackupStatus, saveBackupConfig } from '@/lib/backup';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  return request.cookies.get('umbrella_session')?.value === 'admin';
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    saveBackupConfig({
      enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
      intervalHours: body.intervalHours,
      maxBackups: body.maxBackups
    });

    return NextResponse.json({ success: true, status: getBackupStatus() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Backup config save failed.' }, { status: 500 });
  }
}
