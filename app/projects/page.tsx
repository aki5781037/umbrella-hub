import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getProjects } from '@/lib/data';

const stages = ['新线索', '已建立联系', '需求确认', '报价准备中', '报价已发送', '样品 / 方案沟通', '商务谈判', '等待客户决定', '已成交'];

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <Shell active="项目管理">
      <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">项目阶段看板</h3>
            <p className="mt-1 text-sm text-muted">集中查看项目阶段、风险和下一步动作。</p>
          </div>
          <Link href="/projects/new" className="w-fit rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">新建项目</Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {stages.map((stage) => (
            <div key={stage} className="rounded-xl border border-line bg-soft p-4 text-sm font-medium text-ink">{stage}</div>
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {projects.map((project) => (
          <article key={project.name} className="rounded-2xl border border-line bg-white p-6 shadow-panel">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href={`/projects/${project.id}`} className="text-lg font-bold text-ink hover:text-brand">{project.name}</Link>
                <p className="mt-1 text-sm text-muted">{project.customer} · 负责人：{project.owner}</p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">{project.stage}</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-soft p-4"><p className="text-sm text-muted">下一步动作</p><p className="mt-1 font-semibold">{project.nextAction}</p></div>
              <div className="rounded-xl bg-soft p-4"><p className="text-sm text-muted">计划完成</p><p className="mt-1 font-semibold">{project.due}</p></div>
              <div className="rounded-xl bg-soft p-4"><p className="text-sm text-muted">风险状态</p><p className="mt-1 font-semibold">{project.risk}</p></div>
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}
