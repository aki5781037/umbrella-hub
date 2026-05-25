import { NextRequest, NextResponse } from 'next/server';
import { createBackup, getBackupStatus, restoreBackup, runDueAutoBackup } from '@/lib/backup';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  return request.cookies.get('umbrella_session')?.value === 'admin';
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  await runDueAutoBackup();
  return NextResponse.json(getBackupStatus());
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || '');

    if (action === 'create') {
      const backup = createBackup('manual');
      return NextResponse.json({ success: true, backup, status: getBackupStatus() });
    }

    if (action === 'restore') {
      const backupId = String(body.backupId || '');
      if (!backupId) {
        return NextResponse.json({ error: 'Missing backup id.' }, { status: 400 });
      }

      const result = restoreBackup(backupId);
      return NextResponse.json({ success: true, ...result, status: getBackupStatus() });
    }

    return NextResponse.json({ error: 'Unsupported backup action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Backup action failed.' }, { status: 500 });
  }
}
