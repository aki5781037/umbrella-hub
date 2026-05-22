import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getAllTasks, getTaskSummary } from '@/lib/data';
import { getPortalSubmissionAlerts } from '@/lib/portal-submissions';

export const dynamic = 'force-dynamic';

const statusStyles: Record<string, string> = {
  待开始: 'bg-slate-100 text-slate-700',
  进行中: 'bg-blue-50 text-blue-700',
  已完成: 'bg-emerald-50 text-emerald-700',
  逾期: 'bg-rose-50 text-rose-700'
};

export default function TasksPage() {
  const allTasks = getAllTasks();
  const taskSummary = getTaskSummary();
  const activeTasks = allTasks.filter((task) => task.status !== '已完成');
  const completedTasks = allTasks.filter((task) => task.status === '已完成');
  const portalSubmissionAlerts = getPortalSubmissionAlerts();
  const summaryCards = [
    { label: '全部任务', value: taskSummary.total, style: 'bg-slate-50 text-slate-700' },
    { label: '待处理任务', value: taskSummary.active, style: 'bg-blue-50 text-blue-700' },
    { label: '今日待跟进', value: taskSummary.today, style: 'bg-amber-50 text-amber-700' },
    { label: '逾期事项', value: taskSummary.overdue, style: 'bg-rose-50 text-rose-700' },
    { label: '客户提交', value: portalSubmissionAlerts.length, style: 'bg-purple-50 text-purple-700' }
  ];

  return (
    <Shell active="任务提醒">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-line bg-white p-5 shadow-panel">
            <p className="text-sm text-muted">{card.label}</p>
            <div className={`mt-4 inline-flex rounded-2xl px-4 py-2 text-3xl font-bold ${card.style}`}>{card.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">客户提交跟进</h3>
            <p className="mt-1 text-sm text-muted">集中处理客户在门户提交的确认、疑问和留言。</p>
          </div>
          <span className="w-fit rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">{portalSubmissionAlerts.length} 条客户提交</span>
        </div>

        <div className="mt-5 space-y-4">
          {portalSubmissionAlerts.length > 0 ? portalSubmissionAlerts.map((submission) => (
            <article key={submission.id} className="rounded-2xl border border-line p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-bold text-ink">{submission.title}</h4>
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">{submission.kind === 'confirmation' ? '确认事项' : '留言'}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{submission.customer} · {submission.projectName} · 当前阶段：{submission.projectStage}</p>
                  <p className="mt-3 text-sm text-muted">{submission.message}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/projects/${submission.projectId}`} className="w-fit rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">查看项目</Link>
                  <form action="/api/submissions/handle" method="post">
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <button type="submit" className="w-fit rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">标记已处理</button>
                  </form>
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-xl bg-soft p-4"><dt className="text-muted">负责人</dt><dd className="mt-1 font-semibold">{submission.owner}</dd></div>
                <div className="rounded-xl bg-soft p-4"><dt className="text-muted">提交时间</dt><dd className="mt-1 font-semibold">{submission.createdAt}</dd></div>
                <div className="rounded-xl bg-soft p-4"><dt className="text-muted">处理状态</dt><dd className="mt-1 font-semibold">待内部跟进</dd></div>
              </dl>
            </article>
          )) : (
            <div className="rounded-xl border border-dashed border-line p-5 text-sm text-muted">暂无新的客户提交。</div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">待处理任务</h3>
            <p className="mt-1 text-sm text-muted">集中查看负责人、截止时间、关联客户和项目。</p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{activeTasks.length} 项待处理</span>
        </div>

        <div className="mt-5 space-y-4">
          {activeTasks.map((task) => (
            <article key={task.id} className="rounded-2xl border border-line p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-bold text-ink">{task.title}</h4>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[task.status] ?? 'bg-soft text-muted'}`}>{task.status}</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">{task.priority}优先级</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{task.customer} · {task.projectName} · 当前阶段：{task.projectStage}</p>
                </div>
                <Link href={`/projects/${task.projectId}`} className="w-fit rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">查看项目</Link>
              </div>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-xl bg-soft p-4"><dt className="text-muted">负责人</dt><dd className="mt-1 font-semibold">{task.owner}</dd></div>
                <div className="rounded-xl bg-soft p-4"><dt className="text-muted">截止时间</dt><dd className="mt-1 font-semibold">{task.due}</dd></div>
                <div className="rounded-xl bg-soft p-4"><dt className="text-muted">风险状态</dt><dd className="mt-1 font-semibold">{task.risk}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-panel">
        <h3 className="text-lg font-bold text-ink">已完成任务</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {completedTasks.map((task) => (
            <Link key={task.id} href={`/projects/${task.projectId}`} className="rounded-xl border border-line p-4 hover:bg-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-ink">{task.title}</p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{task.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{task.projectName} · {task.owner} · {task.due}</p>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
