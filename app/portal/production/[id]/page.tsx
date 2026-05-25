import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getCustomerIdForIdentity } from '@/lib/auth';
import { getProductionOrderById, orderIsClosed, productionStages, type ProductionOrder, type ProductionTask } from '@/lib/production';

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

function taskClass(task: ProductionTask) {
  if (task.status === '已完成') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (task.status === '进行中') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-line bg-soft text-muted';
}

function shortDateTime(value: string) {
  return value.replace('T', ' ').slice(0, 16);
}

function readyCheckCount(order: ProductionOrder) {
  return order.checks.length ? Math.min(order.checks.length, Math.round(order.progress / (100 / order.checks.length))) : 0;
}

function commentCardClass(authorRole: string) {
  if (authorRole === 'customer') {
    return 'border-blue-300 bg-blue-50 ring-2 ring-blue-100 shadow-sm';
  }

  return 'border-line bg-white';
}

function commentRoleLabel(authorRole: string) {
  return authorRole === 'customer' ? '客户留言' : 'Ark 回复';
}

function productionSpecRows(order: ProductionOrder) {
  const spec = order.productionSpec || {};

  return [
    { label: '伞面材质', value: spec.umbrellaFabric },
    { label: '伞骨资料', value: spec.frameMaterial },
    { label: '包装资料', value: spec.packaging },
    { label: '布标', value: spec.wovenLabel },
    { label: '吊牌', value: spec.hangTag },
    { label: '包装/外箱', value: spec.carton },
    { label: '手柄', value: spec.handle },
    { label: '印刷', value: spec.printing }
  ].filter((item) => item.value);
}

function attachmentTypeLabel(documentType?: string) {
  if (documentType === 'contract') return '合同';
  if (documentType === 'production_sheet') return '生产单';
  return '生产资料';
}

export default function PortalProductionOrderPage({ params }: { params: { id: string } }) {
  const identity = cookies().get('umbrella_identity')?.value;
  const customerId = getCustomerIdForIdentity(identity);
  const order = getProductionOrderById(params.id);

  if (!customerId || !order || order.customerId !== customerId || orderIsClosed(order)) {
    notFound();
  }

  const stepCount = productionStepCount(order.stage);
  const tasks = order.tasks || [];
  const comments = order.comments || [];
  const productionSpec = productionSpecRows(order);
  const attachments = order.attachments || [];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/portal" className="inline-flex min-h-8 items-center rounded-lg text-sm font-semibold text-blue-200">返回客户门户</Link>
            <h1 className="mt-2 text-3xl font-bold">{order.product}</h1>
            <p className="mt-2 text-sm text-slate-300">{order.orderNo} · {order.quantity} · {order.customer}</p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${riskBadgeClass(order.risk)}`}>{order.stage}</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <section className="rounded-2xl bg-white p-6 text-ink shadow-panel">
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-brand" style={{ width: `${order.progress}%` }} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
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
                <p className="mt-1 font-bold">{readyCheckCount(order)} / {order.checks.length}</p>
              </div>
              <div className="rounded-xl bg-soft p-4">
                <p className="text-muted">当前风险</p>
                <p className="mt-1 font-bold">{order.risk}</p>
              </div>
            </div>

            <p className="mt-4 rounded-xl bg-soft p-4 text-sm font-medium text-ink">下一步：{order.nextAction}</p>

            {productionSpec.length > 0 && (
              <div className="mt-5">
                <h2 className="font-bold text-ink">生产资料</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {productionSpec.map((item) => (
                    <div key={item.label} className="rounded-xl border border-line bg-soft p-4 text-sm">
                      <p className="text-muted">{item.label}</p>
                      <p className="mt-1 break-words font-bold text-ink">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <h2 className="font-bold text-ink">附件资料</h2>
              <div className="mt-3 space-y-2">
                {attachments.length > 0 ? attachments.map((file) => (
                  <div key={file.storedName} className="flex flex-col gap-2 rounded-xl border border-line bg-soft p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="break-words font-semibold text-ink">{file.name}</p>
                      <p className="mt-1 text-xs font-semibold text-muted">{attachmentTypeLabel(file.documentType)} · {file.stage || '未关联节点'}</p>
                    </div>
                    <a
                      href={`/api/production/orders/${encodeURIComponent(order.id)}/attachments/${encodeURIComponent(file.storedName)}`}
                      className="w-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-brand"
                    >
                      下载
                    </a>
                  </div>
                )) : (
                  <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无附件资料。</div>
                )}
              </div>
            </div>

            <div className="mt-5">
              <h2 className="font-bold text-ink">生产流程</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {productionStages.map((stage, index) => (
                  <span key={stage} className={`rounded-lg px-3 py-2 text-xs font-bold ${index < stepCount ? 'bg-emerald-50 text-emerald-700' : 'bg-soft text-muted'}`}>{stage}</span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <h2 className="font-bold text-ink">生产子任务</h2>
              <div className="mt-3 space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className={`grid grid-cols-[1fr_auto] gap-3 rounded-xl border p-3 text-sm ${taskClass(task)}`}>
                    <span className={`font-semibold ${task.status === '已完成' ? 'line-through' : ''}`}>{task.title}</span>
                    <span className="text-xs font-bold">{task.status}</span>
                  </div>
                ))}
                {tasks.length === 0 && <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无生产子任务。</div>}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 text-ink shadow-panel">
            <h2 className="font-bold text-ink">COMMENTS</h2>
            <div className="mt-3 space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className={`rounded-xl border p-4 text-sm ${commentCardClass(comment.authorRole)}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-ink">{comment.authorName}</span>
                      <span className={comment.authorRole === 'customer' ? 'rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white' : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-muted'}>
                        {commentRoleLabel(comment.authorRole)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-muted">{shortDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-muted">{comment.body}</p>
                </div>
              ))}
              {comments.length === 0 && <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无评论。</div>}
            </div>

            <form action={`/api/production/orders/${encodeURIComponent(order.id)}/comments`} method="post" className="mt-4 rounded-2xl border border-dashed border-line bg-soft p-4">
              <label className="block text-sm font-semibold text-ink">
                添加评论
                <textarea name="body" required className="mt-2 min-h-24 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" placeholder="写下需要 Ark Umbrella 跟进或回复的订单事项。" />
              </label>
              <button className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">提交评论</button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
