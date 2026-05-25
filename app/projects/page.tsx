import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getCustomers, getProjects } from '@/lib/data';
import { getProjectWithPortalSubmissions } from '@/lib/portal-submissions';

export const dynamic = 'force-dynamic';

const today = new Date('2026-05-23T00:00:00');

const workflowTemplates: Record<string, string[]> = {
  新客户开发: ['记录需求', '确认规格', '核算报价', '发送报价', '跟进反馈'],
  新客户询盘: ['记录需求', '确认规格', '核算报价', '发送报价', '跟进反馈'],
  报价项目: ['确认产品', '确认数量/包装', '核价', '发报价', '等客户决定'],
  报价需求: ['确认产品', '确认数量/包装', '核价', '发报价', '等客户决定'],
  打样项目: ['确认需求', '供应商材料', '打样', '寄样', '客户反馈'],
  新设计开发: ['收集需求', '出设计', '内部确认', '发客户', '修改/定稿'],
  设计需求: ['收集需求', '出设计', '内部确认', '发客户', '修改/定稿'],
  大货订单: ['确认订单', '收定金', '排产', '生产跟进', '验货/出货'],
  订单补充: ['确认订单', '收定金', '排产', '生产跟进', '验货/出货'],
  物料跟进: ['确认物料', '联系供应商', '获取交期', '到料确认'],
  供应商协作: ['发出需求', '等待回复', '确认价格/交期', '执行跟进'],
  快递寄样: ['确认收件信息', '安排取件', '获取单号', '跟踪签收'],
  出货物流: ['确认出货时间', '订舱/物流', '报关资料', '发货', '单证确认'],
  收款跟进: ['确认金额', '发送付款信息', '等待付款', '到账确认'],
  单证资料: ['确认资料', '制作单证', '内部检查', '发客户', '确认无误'],
  售后问题: ['记录问题', '收集证据', '内部核查', '给方案', '关闭问题'],
  'OEM 定制': ['确认设计', '打样确认', '报价确认', '订单沟通', '客户反馈'],
  返单: ['确认返单需求', '复核旧资料', '确认交期', '安排生产', '物流方案']
};

type Project = ReturnType<typeof getProjects>[number];

function parseDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function daysUntil(value?: string) {
  const deadline = parseDate(value);
  if (!deadline) return 999;
  return Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
}

function urgencyOf(project: Project) {
  const days = daysUntil(project.nextFollow || project.due);

  if (project.risk === '红灯' || days <= 1) {
    return 'red';
  }

  if (project.risk === '黄灯' || days <= 3) {
    return 'amber';
  }

  return 'green';
}

function deadlineCopy(project: Project) {
  const focusDate = project.nextFollow || project.due;
  const days = daysUntil(focusDate);

  if (days < 0) return `${focusDate} · 逾期 ${Math.abs(days)} 天`;
  if (days === 0) return `${focusDate} · 今天`;
  if (days === 1) return `${focusDate} · 剩余 1 天`;
  if (days < 999) return `${focusDate} · 剩余 ${days} 天`;

  return '待设置';
}

function projectProgress(project: Project) {
  if (!project.tasks.length) return 20;
  const done = project.tasks.filter((task) => task.status === '已完成').length;
  return Math.max(18, Math.round((done / project.tasks.length) * 100));
}

function workflowFor(project: Project) {
  return workflowTemplates[project.type] || workflowTemplates[project.stage] || ['需求确认', '执行跟进', '外部反馈', '内部确认', '关闭项目'];
}

function currentWorkflowIndex(project: Project, steps: string[]) {
  const stage = `${project.stage} ${project.nextAction}`;
  const matchedIndex = steps.findIndex((step) => stage.includes(step.slice(0, 2)));
  return matchedIndex >= 0 ? matchedIndex : Math.min(steps.length - 1, Math.floor(projectProgress(project) / 25));
}

function customerUrgency(projects: Project[]) {
  if (projects.some((project) => urgencyOf(project) === 'red')) return 'red';
  if (projects.some((project) => urgencyOf(project) === 'amber')) return 'amber';
  return 'green';
}

function urgencyClasses(tone: string) {
  if (tone === 'red') return 'border-rose-200 bg-rose-50 shadow-rose-100';
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 shadow-amber-100';
  return 'border-line bg-white shadow-slate-100';
}

function dotClasses(tone: string) {
  if (tone === 'red') return 'bg-rose-500 ring-4 ring-rose-100';
  if (tone === 'amber') return 'bg-amber-500 ring-4 ring-amber-100';
  return 'bg-emerald-500 ring-4 ring-emerald-100';
}

function priorityClasses(priority: string) {
  if (priority === '高') return 'bg-rose-100 text-rose-700';
  if (priority === '低') return 'bg-slate-100 text-slate-600';
  return 'bg-amber-100 text-amber-700';
}

function reminderClasses(tone: string) {
  if (tone === 'red') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

export default function ProjectsPage({ searchParams }: { searchParams?: { customer?: string; project?: string } }) {
  const customers = getCustomers();
  const projects = getProjects();
  const selectedCustomer =
    customers.find((customer) => customer.id === searchParams?.customer) ||
    customers.find((customer) => projects.some((project) => project.customerId === customer.id)) ||
    customers[0];

  const selectedProjects = selectedCustomer ? projects.filter((project) => project.customerId === selectedCustomer.id) : [];
  const selectedProjectBase =
    selectedProjects.find((project) => project.id === searchParams?.project) ||
    [...selectedProjects].sort((a, b) => daysUntil(a.nextFollow || a.due) - daysUntil(b.nextFollow || b.due))[0];
  const selectedProject = selectedProjectBase ? getProjectWithPortalSubmissions(selectedProjectBase.id) || selectedProjectBase : undefined;
  const sortedProjects = [...selectedProjects].sort((a, b) => daysUntil(a.nextFollow || a.due) - daysUntil(b.nextFollow || b.due));
  const selectedAttachments = selectedProject?.attachmentFiles || [];
  const selectedWorkflow = selectedProject ? workflowFor(selectedProject) : [];
  const currentStep = selectedProject ? currentWorkflowIndex(selectedProject, selectedWorkflow) : 0;

  return (
    <Shell active="项目管理">
      <div className="grid gap-4 xl:grid-cols-[260px_330px_minmax(0,1fr)] 2xl:grid-cols-[280px_360px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-line bg-white shadow-panel">
          <div className="border-b border-line p-5">
            <h3 className="text-lg font-bold text-ink">客户列表</h3>
            <p className="mt-1 text-sm text-muted">按客户集中查看项目</p>
            <div className="mt-4 rounded-xl border border-line bg-soft px-4 py-3 text-sm text-muted">搜索客户 / 国家 / 负责人</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['全部', '临期', '高优先级', '等待客户'].map((chip, index) => (
                <span key={chip} className={`rounded-full border px-3 py-1 text-xs font-semibold ${index === 0 ? 'border-blue-200 bg-blue-50 text-brand' : 'border-line text-muted'}`}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3 p-4">
            {customers.map((customer) => {
              const customerProjects = projects.filter((project) => project.customerId === customer.id);
              const tone = customerUrgency(customerProjects);
              const isSelected = customer.id === selectedCustomer?.id;

              return (
                <Link
                  key={customer.id}
                  href={`/projects?customer=${encodeURIComponent(customer.id)}`}
                  className={`block rounded-2xl border p-4 transition hover:border-blue-200 hover:bg-blue-50 ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-line bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{customer.name}</p>
                      <p className="mt-1 text-sm text-muted">{customer.country} · {customer.owner}</p>
                    </div>
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotClasses(tone)}`} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted">{customer.status}</span>
                    <span className="rounded-full bg-soft px-3 py-1 font-semibold text-ink">{customerProjects.length} 项</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white shadow-panel">
          <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">客户项目</h3>
              <p className="mt-1 text-sm text-muted">当前客户：{selectedCustomer?.name || '未选择客户'}</p>
            </div>
            <Link href="/projects/new" className="w-fit rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-100">新建</Link>
          </div>
          <div className="min-h-[680px] space-y-3 p-4">
            {sortedProjects.map((project) => {
              const tone = urgencyOf(project);
              const progress = projectProgress(project);

              return (
                <Link
                  key={project.id}
                  href={`/projects?customer=${encodeURIComponent(project.customerId)}&project=${encodeURIComponent(project.id)}`}
                  className={`block rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 ${urgencyClasses(tone)} ${selectedProject?.id === project.id ? 'ring-2 ring-brand' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand">{project.type}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityClasses(project.priority)}`}>{project.priority}</span>
                  </div>
                  <p className="mt-3 text-base font-bold leading-6 text-ink">{project.name}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">{project.nextAction}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full ${tone === 'red' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-brand'}`} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="text-ink">{project.stage}</span>
                    <span className={tone === 'red' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : 'text-emerald-600'}>{deadlineCopy(project)}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">{project.tasks.filter((task) => task.status === '已完成').length}/{project.tasks.length} 任务完成</p>
                </Link>
              );
            })}
            {sortedProjects.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line bg-soft p-6 text-sm text-muted">当前客户暂无进行中的项目。</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white shadow-panel">
          <div className="flex items-start justify-between gap-3 border-b border-line p-5">
            <div>
              <h3 className="text-lg font-bold text-ink">项目详情</h3>
              <p className="mt-1 text-sm text-muted">选中项目的流程和细节</p>
            </div>
            {selectedProject && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${priorityClasses(selectedProject.priority)}`}>{selectedProject.priority}优先级</span>
                <form action={`/api/projects/${encodeURIComponent(selectedProject.id)}/close`} method="post">
                  <button className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">结束项目</button>
                </form>
              </div>
            )}
          </div>

          {selectedProject ? (
            <div className="space-y-5 p-5">
              <div className={`rounded-2xl border p-4 ${reminderClasses(urgencyOf(selectedProject))}`}>
                <div className="flex items-center justify-between gap-3 text-sm font-bold">
                  <span>跟进提醒：{deadlineCopy(selectedProject)}</span>
                  <span>{selectedProject.risk}</span>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-ink">{selectedProject.name}</h4>
                <p className="mt-2 text-sm text-muted">{selectedProject.customer} · 负责人 {selectedProject.owner} · {selectedProject.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-line bg-soft p-4">
                  <p className="text-sm text-muted">计划完成</p>
                  <p className="mt-1 font-bold text-ink">{selectedProject.due}</p>
                </div>
                <div className="rounded-xl border border-line bg-soft p-4">
                  <p className="text-sm text-muted">当前阶段</p>
                  <p className="mt-1 font-bold text-ink">{selectedProject.stage}</p>
                </div>
                <div className="rounded-xl border border-line bg-soft p-4">
                  <p className="text-sm text-muted">项目进度</p>
                  <p className="mt-1 font-bold text-ink">{projectProgress(selectedProject)}%</p>
                </div>
                <div className="rounded-xl border border-line bg-soft p-4">
                  <p className="text-sm text-muted">待办事项</p>
                  <p className="mt-1 font-bold text-ink">{selectedProject.tasks.filter((task) => task.status !== '已完成').length} / {selectedProject.tasks.length} 未完成</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink">流程节点</h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {selectedWorkflow.map((step, index) => (
                    <form key={step} action={`/api/projects/${encodeURIComponent(selectedProject.id)}/stage`} method="post">
                      <input type="hidden" name="stage" value={step} />
                      <button className={`grid w-full grid-cols-[28px_1fr] items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition hover:border-blue-300 hover:bg-blue-50 ${index < currentStep ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : index === currentStep ? 'border-blue-200 bg-blue-50 text-brand' : 'border-line bg-soft text-muted'}`}>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index < currentStep ? 'bg-emerald-500 text-white' : index === currentStep ? 'bg-brand text-white' : 'bg-white text-muted'}`}>{index + 1}</span>
                        <span>{step}</span>
                      </button>
                    </form>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink">子任务清单</h4>
                <div className="mt-3 space-y-2">
                  {selectedProject.tasks.length > 0 ? selectedProject.tasks.map((task, index) => (
                    <div key={`${task.title}-${index}`} className="grid grid-cols-[1fr_auto] items-stretch gap-2 rounded-xl border border-line bg-white p-2 text-sm">
                      <form action={`/api/projects/${encodeURIComponent(selectedProject.id)}/tasks`} method="post">
                        <input type="hidden" name="action" value="toggle" />
                        <input type="hidden" name="taskIndex" value={index} />
                        <input type="hidden" name="done" value={task.status === '已完成' ? 'false' : 'true'} />
                        <button className="grid h-full w-full grid-cols-[22px_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-blue-50">
                          <span className={`flex h-5 w-5 items-center justify-center rounded border text-xs text-white ${task.status === '已完成' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}>{task.status === '已完成' ? '✓' : ''}</span>
                          <span className={`font-semibold ${task.status === '已完成' ? 'text-muted line-through' : 'text-ink'}`}>{task.title}</span>
                          <span className="hidden text-xs font-semibold text-muted sm:inline">{task.due}</span>
                        </button>
                      </form>
                      <form action={`/api/projects/${encodeURIComponent(selectedProject.id)}/tasks`} method="post">
                        <input type="hidden" name="action" value="delete" />
                        <input type="hidden" name="taskIndex" value={index} />
                        <button className="h-full rounded-lg border border-rose-100 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100" aria-label={`删除任务 ${task.title}`}>
                          删除
                        </button>
                      </form>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无子任务。</div>
                  )}
                </div>
                <form action={`/api/projects/${encodeURIComponent(selectedProject.id)}/tasks`} method="post" className="mt-3 grid gap-2 rounded-2xl border border-dashed border-line bg-soft p-3 sm:grid-cols-[1fr_160px_auto]">
                  <input type="hidden" name="action" value="add" />
                  <input name="title" required className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" placeholder="添加自定义任务" />
                  <input name="due" type="date" defaultValue={selectedProject.nextFollow || selectedProject.due} className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
                  <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">添加任务</button>
                </form>
              </div>

              <div>
                <h4 className="font-bold text-ink">附件资料</h4>
                <form action={`/api/projects/${encodeURIComponent(selectedProject.id)}/attachments`} method="post" encType="multipart/form-data" className="mt-3 rounded-2xl border border-dashed border-line bg-soft p-4">
                  <label className="block text-sm font-semibold text-ink">
                    上传附件
                    <input name="attachment" type="file" required className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted" />
                  </label>
                  <button className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">上传到项目</button>
                </form>
                <div className="mt-3 space-y-2">
                  {selectedProject.files.length > 0 ? selectedProject.files.map((file) => (
                    <div key={file} className="flex flex-col gap-2 rounded-xl border border-line bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-ink">{file}</span>
                      {selectedAttachments.find((attachment) => attachment.name === file) ? (
                        <a
                          href={`/api/projects/${encodeURIComponent(selectedProject.id)}/attachments/${encodeURIComponent(selectedAttachments.find((attachment) => attachment.name === file)!.storedName)}`}
                          className="w-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-brand"
                        >
                          下载
                        </a>
                      ) : (
                        <span className="w-fit rounded-lg bg-soft px-3 py-1 text-xs font-semibold text-muted">仅记录</span>
                      )}
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无附件。</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink">跟进记录</h4>
                <div className="mt-3 space-y-2">
                  {selectedProject.timeline.slice(0, 4).map((item) => (
                    <div key={item} className="rounded-xl bg-soft p-3 text-sm font-medium text-ink">{item}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink">COMMENTS</h4>
                <div className="mt-3 space-y-2">
                  {selectedProject.messages.length > 0 ? selectedProject.messages.map((message, index) => (
                    <div key={`${message}-${index}`} className="rounded-xl border border-line bg-white p-3 text-sm font-medium leading-6 text-ink">{message}</div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无 Comments。</div>
                  )}
                </div>
                <form action={`/api/projects/${encodeURIComponent(selectedProject.id)}/comments`} method="post" className="mt-3 rounded-2xl border border-dashed border-line bg-soft p-4">
                  <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                    <input name="author" defaultValue={selectedProject.owner} className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" placeholder="留言人" />
                    <textarea name="message" required className="min-h-24 rounded-xl border border-line bg-white p-3 text-sm outline-none focus:border-brand" placeholder="添加 Comments..." />
                  </div>
                  <button className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">添加 Comments</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-muted">当前客户暂无项目，可点击“新建项目”创建。</div>
          )}
        </section>
      </div>
    </Shell>
  );
}
