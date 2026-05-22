import Link from 'next/link';
import { getPortalProjectsWithSubmissions } from '@/lib/portal-submissions';

export const dynamic = 'force-dynamic';

export default function PortalPage() {
  const portalProjects = getPortalProjectsWithSubmissions();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white/10 p-8 shadow-panel ring-1 ring-white/15">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-blue-200">Ark Umbrella Customer Portal</p>
              <h1 className="mt-2 text-3xl font-bold">客户项目门户</h1>
              <p className="mt-3 max-w-2xl text-slate-300">海外客户登录后，只能查看自己公司的项目进度、待确认事项、留言记录和可下载文件。</p>
            </div>
            <Link href="/logout" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">退出</Link>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {portalProjects.map((project) => (
            <article key={project.name} className="rounded-2xl bg-white p-6 text-ink shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{project.name}</h2>
                  <p className="mt-2 text-sm text-muted">{project.nextAction}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{project.stage}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-soft p-4"><p className="text-muted">待确认事项</p><p className="mt-1 font-bold">{project.confirmations.filter((item) => item.status !== '已确认').length}</p></div>
                <div className="rounded-xl bg-soft p-4"><p className="text-muted">可下载文件</p><p className="mt-1 font-bold">{project.files.length}</p></div>
              </div>
              <Link href={`/portal/projects/${project.id}`} className="mt-5 block w-full rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white">查看项目详情</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
