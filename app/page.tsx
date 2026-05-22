import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { allTasks, metrics, projects } from '@/lib/data';
import { getPortalSubmissionAlerts } from '@/lib/portal-submissions';
import { readMails } from '@/lib/emails-db';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const portalSubmissionAlerts = getPortalSubmissionAlerts();
  const mails = readMails();

  // 动态更新“未读邮件”的卡片数据
  const unreadMailsCount = mails.filter((mail) => mail.status === '未读').length;
  const dynamicMetrics = metrics.map((item) => {
    if (item.label === '未读邮件') {
      return { ...item, value: String(unreadMailsCount) };
    }
    return item;
  });

  return (
    <Shell active="驾驶舱">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dynamicMetrics.map((item) => (
          <div key={item.label} className="rounded-2xl border border-line bg-white p-5 shadow-panel">
            <p className="text-sm text-muted">{item.label}</p>
            <div className={`mt-4 inline-flex rounded-2xl ${item.bg} px-4 py-2 text-3xl font-bold ${item.tone}`}>{item.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">今日待处理事项</h3>
            <span className="text-sm text-muted">按截止时间排序</span>
          </div>
          <div className="space-y-3">
            {allTasks.filter((task) => task.status !== '已完成').slice(0, 4).map((task) => (
              <div key={task.id} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{task.title}</p>
                    <p className="mt-1 text-sm text-muted">{task.customer} · {task.projectName} · {task.owner}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">{task.status}</span>
                </div>
                <p className="mt-3 text-sm text-muted">截止时间：{task.due}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">最新邮件</h3>
            <span className="text-sm text-muted">自动关联客户 / 项目</span>
          </div>
          <div className="space-y-3">
            {mails.slice(0, 4).map((mail) => (
              <Link key={mail.id} href={`/mail/${mail.id}`} className="block rounded-xl border border-line p-4 hover:bg-soft">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{mail.subject}</p>
                    <p className="mt-1 text-sm text-muted">{mail.time} · {mail.from} · {mail.customer}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{mail.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">项目风险预警</h3>
            <span className="text-sm text-muted">按截止时间和风险灯排序</span>
          </div>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.name} className="rounded-xl border border-line p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{project.name}</p>
                    <p className="mt-1 text-sm text-muted">{project.customer} · {project.stage} · {project.owner}</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">{project.risk}</span>
                </div>
                <p className="mt-3 text-sm text-muted">计划完成：{project.due}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">最新客户提交</h3>
            <span className="text-sm text-muted">{portalSubmissionAlerts.length} 条待处理</span>
          </div>
          <div className="space-y-3">
            {portalSubmissionAlerts.length > 0 ? portalSubmissionAlerts.slice(0, 4).map((submission) => (
              <Link key={submission.id} href={`/projects/${submission.projectId}`} className="block rounded-xl border border-line p-4 hover:bg-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{submission.title}</p>
                    <p className="mt-1 text-sm text-muted">{submission.customer} · {submission.projectName} · {submission.createdAt}</p>
                  </div>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">{submission.kind === 'confirmation' ? '确认事项' : '留言'}</span>
                </div>
                <p className="mt-3 text-sm text-muted">{submission.message}</p>
              </Link>
            )) : (
              <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">暂无新的客户提交。</div>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
