import { NextRequest, NextResponse } from 'next/server';
import { addMessageSubmission } from '@/lib/portal-submissions';

function portalProjectUrl(request: NextRequest, projectId: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(`/portal/projects/${projectId}`, `${protocol}://${host}`);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;

  if (session !== 'customer') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const projectId = String(formData.get('projectId') ?? '');
  const message = String(formData.get('message') ?? '').trim();

  if (!projectId || !message) {
    return NextResponse.json({ error: 'Invalid message submission.' }, { status: 400 });
  }

  addMessageSubmission(projectId, message);

  return NextResponse.redirect(portalProjectUrl(request, projectId), 303);
}
