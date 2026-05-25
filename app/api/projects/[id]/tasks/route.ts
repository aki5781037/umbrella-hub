import { NextRequest, NextResponse } from 'next/server';
import { addProjectTask, deleteProjectTask, getProjectById, updateProjectTask } from '@/lib/data';

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

  const formData = await request.formData();
  const action = String(formData.get('action') || 'toggle');
  let updatedProject;

  if (action === 'add') {
    const title = String(formData.get('title') || '');
    const due = String(formData.get('due') || '');
    updatedProject = addProjectTask(project.id, { title, due });
  } else if (action === 'delete') {
    const taskIndex = Number(formData.get('taskIndex'));
    updatedProject = deleteProjectTask(project.id, taskIndex);
  } else {
    const taskIndex = Number(formData.get('taskIndex'));
    const done = String(formData.get('done') || '') === 'true';
    updatedProject = updateProjectTask(project.id, taskIndex, done);
  }

  if (!updatedProject) {
    return NextResponse.json({ error: '任务更新失败。' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, `/projects?customer=${encodeURIComponent(updatedProject.customerId)}&project=${encodeURIComponent(updatedProject.id)}`), 303);
}
