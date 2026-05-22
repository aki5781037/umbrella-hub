import { NextRequest, NextResponse } from 'next/server';
import { readMails } from '@/lib/emails-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;
  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const mails = readMails();
    return NextResponse.json({ success: true, mails });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
