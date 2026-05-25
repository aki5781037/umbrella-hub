import Link from 'next/link';
import { cookies } from 'next/headers';
import { getCustomerIdForIdentity } from '@/lib/auth';
import { getPortalProjectsWithSubmissions } from '@/lib/portal-submissions';
import { getProductionOrders, productionStages } from '@/lib/production';

export const dynamic = 'force-dynamic';

function productionStepCount(stage: string) {
  if (stage === '已结束') return productionStages.length;

  const index = productionStages.findIndex((item) => item === stage);
  return index >= 0 ? index + 1 : 0;
}

function riskBadgeClass(risk: string) {
  if (risk === '红灯') return 'bg-rose-50 text-rose-700';
  if (risk === '黄灯') return 'bg-amber-50 text-amber-700';
  return 'bg-emerald-50 text-emerald-700';
}

export default function PortalPage() {
  const identity = cookies().get('umbrella_identity')?.value;
  const customerId = getCustomerIdForIdentity(identity);
  const portalProjects = customerId ? getPortalProjectsWithSubmissions(customerId) : [];
  const productionOrders = customerId ? getProductionOrders(customerId) : [];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white/10 p-6 shadow-panel ring-1 ring-white/15 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-blue-200">Ark Umbrella Customer Portal</p>
              <h1 className="mt-2 text-3xl font-bold">客户项目与订单门户</h1>
              <p className="mt-3 max-w-2xl text-slate-300">查看你公司的项目进度、生产订单、确认事项、资料和留言记录。</p>
            </div>
            <Link href="/logout" className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">退出</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <p className="text-sm text-blue-200">进行中项目</p>
            <p className="mt-2 text-3xl font-bold">{portalProjects.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <p className="text-sm text-blue-200">生产订单</p>
            <p className="mt-2 text-3xl font-bold">{productionOrders.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <p className="text-sm text-blue-200">待确认事项</p>
            <p className="mt-2 text-3xl font-bold">{portalProjects.reduce((total, project) => total + project.confirmations.filter((item) => item.status !== '已确认').length, 0)}</p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 text-ink shadow-panel">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">提交新项目需求</h2>
              <p className="mt-1 text-sm text-muted">提交后会同步到 Ark Umbrella 后台项目看板。</p>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">New Request</span>
          </div>
          <form action="/api/portal/projects" method="post" className="mt-5 grid gap-4 lg:grid-cols-4">
            <label className="block text-sm font-semibold lg:col-span-2">
              项目名称
              <input name="name" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" placeholder="例如：Germany 2026 雨伞新品设计" />
            </label>
            <label className="block text-sm font-semibold">
              项目类型
              <select name="type" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" defaultValue="设计需求">
                <option>设计需求</option>
                <option>打样项目</option>
                <option>报价需求</option>
                <option>订单补充</option>
                <option>售后问题</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              期望时间
              <input name="due" type="date" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
            </label>
            <label className="block text-sm font-semibold">
              优先级
              <select name="priority" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" defaultValue="中">
                <option>高</option>
                <option>中</option>
                <option>低</option>
              </select>
            </label>
            <label className="block text-sm font-semibold lg:col-span-3">
              需求说明
              <textarea name="requestNote" required className="mt-2 min-h-24 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" placeholder="写清楚产品、数量、设计方向、目标时间或需要 Ark Umbrella 跟进的事项。" />
            </label>
            <div className="flex items-end">
              <button className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-lg shadow-blue-100">提交项目</button>
            </div>
          </form>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">我的项目</h2>
              <p className="mt-1 text-sm text-slate-300">项目进度、确认事项和资料下载。</p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {portalProjects.map((project) => (
              <article key={project.id} className="rounded-2xl bg-white p-6 text-ink shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">{project.name}</h3>
                    <p className="mt-2 text-sm text-muted">{project.nextAction}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{project.stage}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-soft p-4">
                    <p className="text-muted">待确认事项</p>
                    <p className="mt-1 font-bold">{project.confirmations.filter((item) => item.status !== '已确认').length}</p>
                  </div>
                  <div className="rounded-xl bg-soft p-4">
                    <p className="text-muted">可下载文件</p>
                    <p className="mt-1 font-bold">{project.files.length}</p>
                  </div>
                </div>
                <Link href={`/portal/projects/${project.id}`} className="mt-5 block w-full rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white">查看项目详情</Link>
              </article>
            ))}
            {portalProjects.length === 0 && <div className="rounded-2xl bg-white p-6 text-sm text-muted shadow-panel">当前暂无可查看项目。</div>}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">我的订单生产管理</h2>
          <p className="mt-1 text-sm text-slate-300">查看自己订单从接单、生产、验货到出货的状态。</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {productionOrders.map((order) => {
              const stepCount = productionStepCount(order.stage);
              const readyChecks = order.checks.length ? Math.min(order.checks.length, Math.round(order.progress / (100 / order.checks.length))) : 0;

              return (
                <article key={order.id} className="rounded-2xl bg-white p-6 text-ink shadow-panel">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold">{order.product}</h3>
                      <p className="mt-2 text-sm text-muted">{order.orderNo} · {order.quantity}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${riskBadgeClass(order.risk)}`}>{order.stage}</span>
                  </div>

                  <div className="mt-5 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-brand" style={{ width: `${order.progress}%` }} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-soft p-4">
                      <p className="text-muted">流程节点</p>
                      <p className="mt-1 font-bold">{stepCount} / {productionStages.length}</p>
                    </div>
                    <div className="rounded-xl bg-soft p-4">
                      <p className="text-muted">预计出货</p>
                      <p className="mt-1 font-bold">{order.shipDate}</p>
                    </div>
                    <div className="rounded-xl bg-soft p-4">
                      <p className="text-muted">资料检查</p>
                      <p className="mt-1 font-bold">{readyChecks} / {order.checks.length}</p>
                    </div>
                    <div className="rounded-xl bg-soft p-4">
                      <p className="text-muted">当前风险</p>
                      <p className="mt-1 font-bold">{order.risk}</p>
                    </div>
                  </div>

                  <p className="mt-4 rounded-xl bg-soft p-4 text-sm font-medium text-ink">下一步：{order.nextAction}</p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {productionStages.map((stage, index) => (
                      <span key={stage} className={`rounded-lg px-3 py-2 text-xs font-bold ${index < stepCount ? 'bg-emerald-50 text-emerald-700' : 'bg-soft text-muted'}`}>{stage}</span>
                    ))}
                  </div>
                  <Link href={`/portal/production/${order.id}`} className="mt-5 block w-full rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white">查看生产订单</Link>
                </article>
              );
            })}
            {productionOrders.length === 0 && <div className="rounded-2xl bg-white p-6 text-sm text-muted shadow-panel">当前暂无生产订单。</div>}
          </div>
        </section>
      </section>
    </main>
  );
}
