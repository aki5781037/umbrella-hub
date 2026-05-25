import { NextRequest, NextResponse } from 'next/server';
import { getCustomerIdForIdentity } from '@/lib/auth';
import { addProject, getCustomerById } from '@/lib/data';

function portalProjectUrl(request: NextRequest, projectId: string) {
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(`/portal/projects/${projectId}`, `${protocol}://${host}`);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;
  const identity = request.cookies.get('umbrella_identity')?.value;
  const customerId = getCustomerIdForIdentity(identity);

  if (session !== 'customer' || !customerId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const customer = getCustomerById(customerId);
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const type = String(formData.get('type') || '').trim();
  const due = String(formData.get('due') || '').trim();
  const priority = String(formData.get('priority') || '').trim();
  const requestNote = String(formData.get('requestNote') || '').trim();

  if (!customer || !name || !requestNote) {
    return NextResponse.json({ error: '项目名称和需求说明不能为空。' }, { status: 400 });
  }

  const project = addProject({
    customerId: customer.id,
    name,
    owner: customer.owner,
    type: type || '客户门户提交',
    stage: '客户提交 / 待内部确认',
    risk: '黄灯',
    priority: priority || '中',
    due,
    nextFollow: new Date().toISOString().slice(0, 10),
    nextAction: `确认客户提交需求：${requestNote}`,
    templateTasks: ['确认客户提交需求', '联系客户补充资料', '内部评估报价或打样', '回复客户处理计划'].join('\n'),
    timelineNote: '客户门户提交项目需求',
    initialMessage: requestNote
  });

  if (!project) {
    return NextResponse.json({ error: '项目创建失败。' }, { status: 400 });
  }

  return NextResponse.redirect(portalProjectUrl(request, project.id), 303);
}
