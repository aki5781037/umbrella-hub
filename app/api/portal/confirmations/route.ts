import { NextRequest, NextResponse } from 'next/server';
import { addConfirmationSubmission } from '@/lib/portal-submissions';

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
  const title = String(formData.get('title') ?? '');
  const action = String(formData.get('action') ?? '');
  const message = String(formData.get('message') ?? '').trim();

  if (!projectId || !title || !['confirm', 'question'].includes(action)) {
    return NextResponse.json({ error: 'Invalid confirmation submission.' }, { status: 400 });
  }

  addConfirmationSubmission(projectId, title, action === 'confirm' ? '已确认' : '有疑问', message);

  return NextResponse.redirect(portalProjectUrl(request, projectId), 303);
}
