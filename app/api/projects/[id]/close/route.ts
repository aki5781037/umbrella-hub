import { NextRequest, NextResponse } from 'next/server';
import { closeProject, getProjectById } from '@/lib/data';

export const dynamic = 'force-dynamic';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (request.cookies.get('umbrella_session')?.value !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const project = getProjectById(params.id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  const closedProject = closeProject(project.id);
  if (!closedProject) {
    return NextResponse.json({ error: '项目关闭失败。' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, `/projects?customer=${encodeURIComponent(project.customerId)}`), 303);
}
