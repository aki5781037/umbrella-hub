import { NextRequest, NextResponse } from 'next/server';
import { markPortalSubmissionHandled } from '@/lib/portal-submissions';

function tasksUrl(request: NextRequest) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL('/tasks', `${protocol}://${host}`);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;

  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const submissionId = String(formData.get('submissionId') ?? '');

  if (!submissionId) {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });
  }

  markPortalSubmissionHandled(submissionId, '内部团队');

  return NextResponse.redirect(tasksUrl(request), 303);
}
