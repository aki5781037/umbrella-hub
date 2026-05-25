import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { addProjectAttachment, getProjectById } from '@/lib/data';

export const dynamic = 'force-dynamic';

function appUrl(request: NextRequest, path: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(path, `${protocol}://${host}`);
}

function safeFileName(value: string) {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || `attachment-${Date.now()}`;
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
  const upload = formData.get('attachment');

  if (!(upload instanceof File) || !upload.name || upload.size <= 0) {
    return NextResponse.json({ error: '请选择要上传的附件。' }, { status: 400 });
  }

  if (upload.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: '附件不能超过 25MB。' }, { status: 400 });
  }

  const projectDirName = safeFileName(project.id);
  const storedName = `${Date.now()}-${safeFileName(upload.name)}`;
  const targetDir = join(process.cwd(), 'data', 'project-attachments', projectDirName);
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(targetDir, storedName), Buffer.from(await upload.arrayBuffer()));

  const updatedProject = addProjectAttachment(project.id, upload.name, storedName);
  if (!updatedProject) {
    return NextResponse.json({ error: '附件记录失败。' }, { status: 400 });
  }

  return NextResponse.redirect(appUrl(request, `/projects?customer=${encodeURIComponent(updatedProject.customerId)}&project=${encodeURIComponent(updatedProject.id)}`), 303);
}
