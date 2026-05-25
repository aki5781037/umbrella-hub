import { NextRequest, NextResponse } from 'next/server';
import { addProject } from '@/lib/data';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;

  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const customerId = String(formData.get('customerId') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const owner = String(formData.get('owner') || '').trim();

  if (!customerId || !name || !owner) {
    return NextResponse.json({ error: '客户、项目名称、负责人不能为空。' }, { status: 400 });
  }

  const project = addProject({
    customerId,
    name,
    owner,
    type: String(formData.get('type') || '').trim(),
    stage: String(formData.get('stage') || '').trim(),
    collaborators: String(formData.get('collaborators') || '').trim(),
    amount: String(formData.get('amount') || '').trim(),
    risk: String(formData.get('risk') || '').trim(),
    priority: String(formData.get('priority') || '').trim(),
    due: String(formData.get('due') || '').trim(),
    nextAction: String(formData.get('nextAction') || '').trim(),
    nextFollow: String(formData.get('nextFollow') || '').trim(),
    templateTasks: String(formData.get('templateTasks') || '').trim()
  });

  if (!project) {
    return NextResponse.json({ error: '客户不存在。' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, `/projects/${project.id}`), 303);
}
