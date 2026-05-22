import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { getProjectWithPortalSubmissions } from '@/lib/portal-submissions';
import { readMails } from '@/lib/emails-db';

const stages = ['新线索', '已建立联系', '需求确认', '报价准备中', '报价已发送', '样品 / 方案沟通', '商务谈判', '等待客户决定', '已成交'];

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = getProjectWithPortalSubmissions(params.id);
  const projectMails = readMails().filter((m) => m.projectId === params.id);

  if (!project) {
    notFound();
  }

  const currentStageIndex = stages.indexOf(project.stage);

  return (
    <Shell active="项目管理">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/projects" className="text-sm font-medium text-brand">返回项目列表</Link>
          <h3 className="mt-2 text-2xl font-bold text-ink">{project.name}</h3>
          <p className="mt-1 text-sm text-muted">{project.customer} · {project.type}</p>
        </div>
        <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">{project.stage}</span>
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
            <div key={stage} className={`rounded-xl border p-4 text-sm font-medium ${index <= currentStageIndex ? 'border-brand bg-blue-50 text-brand' : 'border-line bg-soft text-muted'}`}>
              {stage}
            </div>
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
            {project.tasks.map((task) => (
              <div key={task.title} className="rounded-xl border border-line p-4 text-sm">
                <p className="font-semibold text-ink">{task.title}</p>
                <p className="mt-2 text-muted">{task.status} · {task.owner} · {task.due}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">附件资料</h4>
          <div className="mt-5 space-y-3">
            {project.files.map((file) => (
              <div key={file} className="rounded-xl bg-soft p-4 text-sm font-medium text-ink">{file}</div>
            ))}
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
          <h4 className="text-lg font-bold text-ink">客户门户留言</h4>
          <div className="mt-5 space-y-3">
            {project.messages.map((message) => (
              <div key={message} className="rounded-xl bg-soft p-4 text-sm font-medium text-ink">{message}</div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
