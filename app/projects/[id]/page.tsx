import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { getProjectWithPortalSubmissions } from '@/lib/portal-submissions';
import { readMails } from '@/lib/emails-db';

const stages = ['客户提交 / 待内部确认', '新线索', '已建立联系', '需求确认', '报价准备中', '报价已发送', '样品 / 方案沟通', '商务谈判', '等待客户决定', '已成交'];

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = getProjectWithPortalSubmissions(params.id);
  const projectMails = readMails().filter((m) => m.projectId === params.id);

  if (!project) {
    notFound();
  }

  const currentStageIndex = stages.indexOf(project.stage);
  const projectAttachments = project.attachmentFiles || [];

  return (
    <Shell active="项目管理">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/projects" className="text-sm font-medium text-brand">返回项目列表</Link>
          <h3 className="mt-2 text-2xl font-bold text-ink">{project.name}</h3>
          <p className="mt-1 text-sm text-muted">{project.customer} · {project.type}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">{project.stage}</span>
          <form action={`/api/projects/${encodeURIComponent(project.id)}/close`} method="post">
            <button className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">结束项目</button>
          </form>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-panel">
        <h4 className="text-lg font-bold text-ink">项目概览</h4>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-soft p-4"><dt className="text-muted">负责人</dt><dd className="mt-1 font-semibold">{project.owner}</dd></div>
          <div className="rounded-xl bg-soft p-4"><dt className="text-muted">协作人</dt><dd className="mt-1 font-semibold">{project.collaborators.join('、')}</dd></div>
          <div className="rounded-xl bg-soft p-4"><dt className="text-muted">预计金额</dt><dd className="mt-1 font-semibold">{project.amount}</dd></div>
          <div className="rounded-xl bg-soft p-4"><dt className="text-muted">风险状态</dt><dd className="mt-1 font-semibold">{project.risk}</dd></div>
          <div className="rounded-xl bg-soft p-4"><dt className="text-muted">优先级</dt><dd className="mt-1 font-semibold">{project.priority}</dd></div>
          <div className="rounded-xl bg-soft p-4"><dt className="text-muted">开始日期</dt><dd className="mt-1 font-semibold">{project.start}</dd></div>
          <div className="rounded-xl bg-soft p-4"><dt className="text-muted">计划完成</dt><dd className="mt-1 font-semibold">{project.due}</dd></div>
          <div className="rounded-xl bg-soft p-4"><dt className="text-muted">下次跟进</dt><dd className="mt-1 font-semibold">{project.nextFollow}</dd></div>
        </dl>
        <div className="mt-4 rounded-xl bg-soft p-4 text-sm">
          <p className="text-muted">下一步动作</p>
          <p className="mt-1 font-semibold text-ink">{project.nextAction}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-panel">
        <h4 className="text-lg font-bold text-ink">项目阶段进度</h4>
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {stages.map((stage, index) => (
            <form key={stage} action={`/api/projects/${encodeURIComponent(project.id)}/stage`} method="post">
              <input type="hidden" name="stage" value={stage} />
              <button className={`h-full w-full rounded-xl border p-4 text-left text-sm font-medium transition hover:border-blue-300 hover:bg-blue-50 ${index <= currentStageIndex ? 'border-brand bg-blue-50 text-brand' : 'border-line bg-soft text-muted'}`}>
                {stage}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">时间线</h4>
          <div className="mt-5 space-y-4">
            {projectMails.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">关联来信</p>
                {projectMails.map((mail) => (
                  <Link
                    key={mail.id}
                    href={`/mail/${encodeURIComponent(mail.id)}`}
                    className="group block rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-sm transition hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand">{mail.from}</span>
                      <span className="text-xs text-muted">{mail.time}</span>
                    </div>
                    <p className="mt-1 font-medium text-ink group-hover:text-brand line-clamp-1">{mail.subject}</p>
                    <p className="mt-1 text-xs text-muted line-clamp-1">{mail.summary}</p>
                  </Link>
                ))}
                <hr className="my-3 border-line" />
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">系统跟进记录</p>
            {project.timeline.map((item) => (
              <div key={item} className="rounded-xl bg-soft p-4 text-sm font-medium text-ink">{item}</div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">任务列表</h4>
          <div className="mt-5 space-y-3">
            {project.tasks.length > 0 ? project.tasks.map((task, index) => (
              <div key={`${task.title}-${index}`} className="grid grid-cols-[1fr_auto] items-stretch gap-2 rounded-xl border border-line bg-white p-2 text-sm">
                <form action={`/api/projects/${encodeURIComponent(project.id)}/tasks`} method="post">
                  <input type="hidden" name="action" value="toggle" />
                  <input type="hidden" name="taskIndex" value={index} />
                  <input type="hidden" name="done" value={task.status === '已完成' ? 'false' : 'true'} />
                  <button className="grid h-full w-full grid-cols-[22px_1fr] gap-3 rounded-lg p-2 text-left transition hover:bg-blue-50">
                    <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border text-xs text-white ${task.status === '已完成' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}>{task.status === '已完成' ? '✓' : ''}</span>
                    <span>
                      <span className={`block font-semibold ${task.status === '已完成' ? 'text-muted line-through' : 'text-ink'}`}>{task.title}</span>
                      <span className="mt-2 block text-muted">{task.status} · {task.owner} · {task.due}</span>
                    </span>
                  </button>
                </form>
                <form action={`/api/projects/${encodeURIComponent(project.id)}/tasks`} method="post">
                  <input type="hidden" name="action" value="delete" />
                  <input type="hidden" name="taskIndex" value={index} />
                  <button className="h-full rounded-lg border border-rose-100 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100" aria-label={`删除任务 ${task.title}`}>删除</button>
                </form>
              </div>
            )) : <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">暂无任务。</div>}
          </div>
          <form action={`/api/projects/${encodeURIComponent(project.id)}/tasks`} method="post" className="mt-4 grid gap-2 rounded-2xl border border-dashed border-line bg-soft p-3">
            <input type="hidden" name="action" value="add" />
            <input name="title" required className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" placeholder="添加自定义任务" />
            <input name="due" type="date" defaultValue={project.nextFollow || project.due} className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
            <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">添加任务</button>
          </form>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">附件资料</h4>
          <form action={`/api/projects/${encodeURIComponent(project.id)}/attachments`} method="post" encType="multipart/form-data" className="mt-5 rounded-2xl border border-dashed border-line bg-soft p-4">
            <label className="block text-sm font-semibold text-ink">
              上传附件
              <input name="attachment" type="file" required className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted" />
            </label>
            <button className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">上传到项目</button>
          </form>
          <div className="mt-5 space-y-3">
            {project.files.length > 0 ? project.files.map((file) => (
              <div key={file} className="flex flex-col gap-2 rounded-xl bg-soft p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-ink">{file}</span>
                {projectAttachments.find((attachment) => attachment.name === file) ? (
                  <a
                    href={`/api/projects/${encodeURIComponent(project.id)}/attachments/${encodeURIComponent(projectAttachments.find((attachment) => attachment.name === file)!.storedName)}`}
                    className="w-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-brand"
                  >
                    下载
                  </a>
                ) : (
                  <span className="w-fit rounded-lg bg-white px-3 py-1 text-xs font-semibold text-muted">仅记录</span>
                )}
              </div>
            )) : <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">暂无附件。</div>}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">客户确认事项</h4>
          <div className="mt-5 space-y-3">
            {project.confirmations.map((item) => (
              <div key={item.title} className="rounded-xl border border-line p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="mt-2 text-muted">截止时间：{item.due}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">{item.status}</span>
                </div>
                <p className="mt-3 leading-6 text-muted">{item.response}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">COMMENTS</h4>
          <div className="mt-5 space-y-3">
            {project.messages.length > 0 ? project.messages.map((message, index) => (
              <div key={`${message}-${index}`} className="rounded-xl bg-soft p-4 text-sm font-medium text-ink">{message}</div>
            )) : <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">暂无 Comments。</div>}
          </div>
          <form action={`/api/projects/${encodeURIComponent(project.id)}/comments`} method="post" className="mt-5 rounded-2xl border border-dashed border-line bg-soft p-4">
            <input name="author" defaultValue={project.owner} className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" placeholder="留言人" />
            <textarea name="message" required className="mt-3 min-h-24 w-full rounded-xl border border-line bg-white p-3 text-sm outline-none focus:border-brand" placeholder="添加 Comments..." />
            <button className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">添加 Comments</button>
          </form>
        </div>
      </section>
    </Shell>
  );
}
