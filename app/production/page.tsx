import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getCustomers } from '@/lib/data';
import { getProductionOrders, productionStages, type ProductionOrder, type ProductionTask } from '@/lib/production';

export const dynamic = 'force-dynamic';

const today = new Date('2026-05-23T00:00:00');

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function daysUntil(value: string) {
  return Math.ceil((parseDate(value).getTime() - today.getTime()) / 86_400_000);
}

function riskTone(order: ProductionOrder) {
  if (order.stage === '已结束') return 'green';

  const days = daysUntil(order.due);
  if (order.risk === '红灯' || days <= 3) return 'red';
  if (order.risk === '黄灯' || days <= 7) return 'amber';
  return 'green';
}

function deadlineText(order: ProductionOrder) {
  if (order.stage === '已结束') return '订单已结束';

  const days = daysUntil(order.due);
  if (days < 0) return `${order.due} · 逾期 ${Math.abs(days)} 天`;
  if (days === 0) return `${order.due} · 今天`;
  return `${order.due} · 剩余 ${days} 天`;
}

function cardToneClass(tone: string) {
  if (tone === 'red') return 'border-rose-200 bg-rose-50 shadow-rose-100';
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 shadow-amber-100';
  return 'border-line bg-white shadow-slate-100';
}

function badgeClass(tone: string) {
  if (tone === 'red') return 'bg-rose-100 text-rose-700';
  if (tone === 'amber') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

function priorityClass(priority: string) {
  if (priority === '高') return 'bg-rose-100 text-rose-700';
  if (priority === '低') return 'bg-slate-100 text-slate-600';
  return 'bg-amber-100 text-amber-700';
}

function detailToneClass(tone: string) {
  if (tone === 'red') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function dotClass(tone: string) {
  if (tone === 'red') return 'bg-rose-500 ring-4 ring-rose-100';
  if (tone === 'amber') return 'bg-amber-500 ring-4 ring-amber-100';
  return 'bg-emerald-500 ring-4 ring-emerald-100';
}

function stageIndexOf(order: ProductionOrder) {
  if (order.stage === '已结束') return productionStages.length;
  return productionStages.indexOf(order.stage);
}

function checkedCount(order: ProductionOrder) {
  if (order.checks.length === 0) return 0;
  return Math.min(order.checks.length, Math.round(order.progress / (100 / order.checks.length)));
}

function taskStatusClass(task: ProductionTask) {
  if (task.status === '已完成') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (task.status === '进行中') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-line bg-white text-muted';
}

function shortDateTime(value: string) {
  return value.replace('T', ' ').slice(0, 16);
}

function stageUploadConfig(stage: string) {
  if (stage === '定金/合同') {
    return { documentType: 'contract', label: '上传合同' };
  }

  if (['产前准备', '物料采购', '生产中'].includes(stage)) {
    return { documentType: 'production_sheet', label: '上传生产单' };
  }

  return { documentType: 'other', label: '上传资料' };
}

function attachmentTypeLabel(documentType?: string) {
  if (documentType === 'contract') return '合同';
  if (documentType === 'production_sheet') return '生产单';
  return '生产资料';
}

function commentCardClass(authorRole: string) {
  if (authorRole === 'customer') {
    return 'border-blue-300 bg-blue-50 ring-2 ring-blue-100 shadow-sm';
  }

  return 'border-line bg-white';
}

function commentRoleLabel(authorRole: string) {
  return authorRole === 'customer' ? '客户留言' : '内部留言';
}

function emptyValue(value?: string) {
  return value && value.trim() ? value : '待上传识别';
}

function orderInfoRows(order: ProductionOrder) {
  return [
    { label: '客户名字', value: order.customer },
    { label: '订单号', value: order.orderNo },
    { label: '订单数量', value: order.quantity },
    { label: '订单金额', value: order.amount },
    { label: '交货日期', value: order.shipDate },
    { label: '工厂', value: order.factory }
  ];
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
    { label: '印刷', value: spec.printing },
    { label: '备注', value: spec.notes }
  ];
}

export default function ProductionPage({ searchParams }: { searchParams?: { customer?: string; order?: string } }) {
  const customers = getCustomers();
  const orders = getProductionOrders();
  const riskRank = { red: 0, amber: 1, green: 2 } as const;
  const sortedOrders = [...orders].sort((a, b) => {
    const riskDiff = riskRank[riskTone(a) as keyof typeof riskRank] - riskRank[riskTone(b) as keyof typeof riskRank];
    return riskDiff || daysUntil(a.due) - daysUntil(b.due);
  });
  const orderFromParam = sortedOrders.find((order) => order.id === searchParams?.order);
  const customersWithOrders = customers.filter((customer) => sortedOrders.some((order) => order.customerId === customer.id));
  const selectedCustomer =
    customers.find((customer) => customer.id === searchParams?.customer) ||
    customers.find((customer) => customer.id === orderFromParam?.customerId) ||
    customersWithOrders[0] ||
    customers[0];
  const selectedCustomerOrders = selectedCustomer ? sortedOrders.filter((order) => order.customerId === selectedCustomer.id) : [];
  const selectedOrder = selectedCustomerOrders.find((order) => order.id === searchParams?.order) || selectedCustomerOrders[0];
  const selectedTone = selectedOrder ? riskTone(selectedOrder) : 'green';
  const selectedStageIndex = selectedOrder ? stageIndexOf(selectedOrder) : -1;
  const nextStage = selectedOrder && selectedStageIndex >= 0 && selectedStageIndex < productionStages.length - 1 ? productionStages[selectedStageIndex + 1] : undefined;
  const selectedAttachments = selectedOrder?.attachments || [];
  const selectedTasks = selectedOrder?.tasks || [];
  const selectedComments = selectedOrder?.comments || [];

  return (
    <Shell active="生产管理">
      <div className="grid gap-4 xl:grid-cols-[260px_360px_minmax(0,1fr)] 2xl:grid-cols-[280px_390px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-line bg-white shadow-panel">
          <div className="border-b border-line p-5">
            <h3 className="text-lg font-bold text-ink">客户列表</h3>
            <p className="mt-1 text-sm text-muted">按客户查看生产订单</p>
          </div>

          <div className="space-y-3 p-4">
            {customers.map((customer) => {
              const customerOrders = sortedOrders.filter((order) => order.customerId === customer.id);
              const tone = customerOrders.some((order) => riskTone(order) === 'red') ? 'red' : customerOrders.some((order) => riskTone(order) === 'amber') ? 'amber' : 'green';
              const isSelected = customer.id === selectedCustomer?.id;

              return (
                <Link
                  key={customer.id}
                  href={`/production?customer=${encodeURIComponent(customer.id)}`}
                  className={`block rounded-2xl border p-4 transition hover:border-blue-200 hover:bg-blue-50 ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-line bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{customer.name}</p>
                      <p className="mt-1 text-sm text-muted">{customer.country} · {customer.owner}</p>
                    </div>
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotClass(tone)}`} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted">{customer.status}</span>
                    <span className="rounded-full bg-soft px-3 py-1 font-semibold text-ink">{customerOrders.length} 单</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white shadow-panel">
          <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">订单列表</h3>
              <p className="mt-1 text-sm text-muted">当前客户：{selectedCustomer?.name || '未选择客户'}</p>
            </div>
            <Link href="/production/new" className="inline-flex min-h-9 w-fit items-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-100">新建订单</Link>
          </div>

          <div className="min-h-[720px] space-y-3 p-4">
            {selectedCustomerOrders.map((order) => {
              const tone = riskTone(order);
              const active = order.id === selectedOrder?.id;

              return (
                <Link
                  key={order.id}
                  href={`/production?customer=${encodeURIComponent(order.customerId)}&order=${encodeURIComponent(order.id)}`}
                  className={`block rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 ${cardToneClass(tone)} ${active ? 'ring-2 ring-brand' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{order.orderNo}</p>
                      <p className="mt-1 text-sm text-muted">{order.factory}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass(tone)}`}>{order.risk}</span>
                  </div>

                  <p className="mt-3 text-base font-bold leading-6 text-ink">{order.product}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">{order.nextAction}</p>

                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full ${tone === 'red' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-brand'}`} style={{ width: `${order.progress}%` }} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="text-ink">{order.stage}</span>
                    <span className={tone === 'red' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : 'text-emerald-600'}>{deadlineText(order)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityClass(order.priority)}`}>{order.priority}优先级</span>
                    <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-muted">{order.quantity}</span>
                  </div>
                </Link>
              );
            })}

            {selectedCustomerOrders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line bg-soft p-6 text-sm text-muted">当前客户没有进行中的生产订单。</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white shadow-panel">
          <div className="flex items-start justify-between gap-3 border-b border-line p-5">
            <div>
              <h3 className="text-lg font-bold text-ink">订单详情</h3>
              <p className="mt-1 text-sm text-muted">生产流程、子任务、资料和 COMMENTS</p>
            </div>
            {selectedOrder && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${badgeClass(selectedTone)}`}>{selectedOrder.risk}</span>
                <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/close`} method="post">
                  <button className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">结束订单</button>
                </form>
              </div>
            )}
          </div>

          {selectedOrder ? (
            <div className="space-y-5 p-5">
              <div className={`rounded-2xl border p-4 ${detailToneClass(selectedTone)}`}>
                <div className="flex flex-col gap-2 text-sm font-bold sm:flex-row sm:items-center sm:justify-between">
                  <span>节点提醒：{deadlineText(selectedOrder)}</span>
                  <span>当前节点：{selectedOrder.stage}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-ink">{selectedOrder.product}</h4>
                  <p className="mt-2 text-sm text-muted">{selectedOrder.customer} · {selectedOrder.orderNo} · 负责人 {selectedOrder.owner}</p>
                </div>
                {nextStage ? (
                  <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/stage`} method="post">
                    <input type="hidden" name="stage" value={nextStage} />
                    <button className="w-fit rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-100">推进到：{nextStage}</button>
                  </form>
                ) : (
                  <span className="w-fit rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">流程已到最后节点</span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-ink">订单信息</h4>
                <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
                  {orderInfoRows(selectedOrder).map((item) => (
                    <div key={item.label} className="min-w-0 rounded-xl border border-line bg-soft p-4">
                      <p className="text-sm text-muted">{item.label}</p>
                      <p className="mt-1 break-words font-bold text-ink">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink">生产单资料</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {productionSpecRows(selectedOrder).map((item) => (
                    <div key={item.label} className="min-w-0 rounded-xl border border-line bg-white p-4">
                      <p className="text-sm text-muted">{item.label}</p>
                      <p className={`mt-1 break-words font-bold ${item.value ? 'text-ink' : 'text-slate-400'}`}>{emptyValue(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink">生产流程</h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {productionStages.map((stage, index) => {
                    const done = index < selectedStageIndex;
                    const current = index === selectedStageIndex;
                    const uploadConfig = stageUploadConfig(stage);

                    return (
                      <div
                        key={stage}
                        className={`rounded-xl border p-2 ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : current ? 'border-blue-200 bg-blue-50 text-brand' : 'border-line bg-soft text-muted'}`}
                      >
                        <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/stage`} method="post">
                          <input type="hidden" name="stage" value={stage} />
                          <button
                            disabled={selectedOrder.stage === '已结束'}
                            className="grid w-full grid-cols-[28px_1fr] items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-semibold transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500 text-white' : current ? 'bg-brand text-white' : 'bg-white text-muted'}`}>{index + 1}</span>
                            <span>{stage}</span>
                          </button>
                        </form>
                        <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/attachments`} method="post" encType="multipart/form-data" className="mt-2 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                          <input type="hidden" name="stage" value={stage} />
                          <input type="hidden" name="documentType" value={uploadConfig.documentType} />
                          <input
                            name="attachment"
                            type="file"
                            required
                            disabled={selectedOrder.stage === '已结束'}
                            accept=".xlsx,.xls,.csv,.txt,.pdf,.doc,.docx"
                            className="min-w-0 rounded-lg border border-line bg-white px-2 py-2 text-xs text-muted file:mr-2 file:rounded-md file:border-0 file:bg-soft file:px-2 file:py-1 file:text-xs file:font-bold file:text-ink disabled:cursor-not-allowed disabled:opacity-70"
                          />
                          <button
                            disabled={selectedOrder.stage === '已结束'}
                            className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-ink shadow-sm hover:text-brand disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {uploadConfig.label}
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-bold text-ink">生产子任务</h4>
                  <span className="text-sm font-semibold text-muted">{selectedTasks.filter((task) => task.status === '已完成').length} / {selectedTasks.length} 已完成</span>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedTasks.map((task) => (
                    <div key={task.id} className={`grid gap-2 rounded-xl border p-3 text-sm lg:grid-cols-[1fr_auto] ${taskStatusClass(task)}`}>
                      <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/tasks`} method="post">
                        <input type="hidden" name="intent" value="toggle" />
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="done" value={task.status === '已完成' ? 'false' : 'true'} />
                        <button className="w-full rounded-lg p-1 text-left transition hover:bg-white/70">
                          <div className="grid grid-cols-[22px_1fr] gap-3">
                            <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border text-xs text-white ${task.status === '已完成' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}>{task.status === '已完成' ? '✓' : ''}</span>
                            <span>
                              <span className={`block font-semibold ${task.status === '已完成' ? 'line-through' : ''}`}>{task.title}</span>
                              <span className="mt-1 block text-xs font-semibold">截止日期：{task.due} · {task.status}</span>
                            </span>
                          </div>
                        </button>
                      </form>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/tasks`} method="post">
                          <input type="hidden" name="intent" value="toggle" />
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="done" value={task.status === '已完成' ? 'false' : 'true'} />
                          <button className="w-fit min-h-8 rounded-lg border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-brand hover:bg-blue-50">
                            {task.status === '已完成' ? '重新打开' : '完成'}
                          </button>
                        </form>
                        <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/tasks`} method="post">
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="taskId" value={task.id} />
                          <button className="w-fit min-h-8 rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50">删除</button>
                        </form>
                      </div>
                    </div>
                  ))}
                  {selectedTasks.length === 0 && <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无生产子任务。</div>}
                </div>

                <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/tasks`} method="post" className="mt-3 grid gap-3 rounded-2xl border border-dashed border-line bg-soft p-4 md:grid-cols-[1fr_160px_auto]">
                  <input type="hidden" name="intent" value="add" />
                  <label className="block text-sm font-semibold text-ink">
                    自定义子任务
                    <input name="title" required className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" placeholder="例如：补拍验货照片" />
                  </label>
                  <label className="block text-sm font-semibold text-ink">
                    截止日期
                    <input name="due" type="date" className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
                  </label>
                  <div className="flex items-end">
                    <button className="w-full rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">新增</button>
                  </div>
                </form>
              </div>

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-bold text-ink">资料检查</h4>
                  <span className="text-sm font-semibold text-muted">{checkedCount(selectedOrder)} / {selectedOrder.checks.length} 项已准备</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedOrder.checks.map((item, index) => (
                    <span key={item} className={`rounded-full px-3 py-1 text-xs font-bold ${index < checkedCount(selectedOrder) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item}</span>
                  ))}
                </div>

                <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/attachments`} method="post" encType="multipart/form-data" className="mt-4 rounded-2xl border border-dashed border-line bg-soft p-4">
                  <input type="hidden" name="stage" value={selectedOrder.stage === '已结束' ? '' : selectedOrder.stage} />
                  <input type="hidden" name="documentType" value="other" />
                  <label className="block text-sm font-semibold text-ink">
                    上传生产资料附件
                    <input name="attachment" type="file" required disabled={selectedOrder.stage === '已结束'} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-70" />
                  </label>
                  <button disabled={selectedOrder.stage === '已结束'} className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">上传附件</button>
                </form>

                <div className="mt-3 space-y-2">
                  {selectedAttachments.length > 0 ? selectedAttachments.map((file) => (
                    <div key={file.storedName} className="flex flex-col gap-2 rounded-xl border border-line bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="break-words font-medium text-ink">{file.name}</p>
                        <p className="mt-1 text-xs font-semibold text-muted">
                          {attachmentTypeLabel(file.documentType)} · {file.stage || '未关联节点'} · 识别 {file.parsedDocument?.recognizedLabels.length || 0} 项
                        </p>
                      </div>
                      <a
                        href={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/attachments/${encodeURIComponent(file.storedName)}`}
                        className="w-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-brand"
                      >
                        下载
                      </a>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无上传附件。</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink">COMMENTS</h4>
                <div className="mt-3 space-y-2">
                  {selectedComments.map((comment) => (
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
                  {selectedComments.length === 0 && <div className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">暂无评论。</div>}
                </div>
                <form action={`/api/production/orders/${encodeURIComponent(selectedOrder.id)}/comments`} method="post" className="mt-3 rounded-2xl border border-dashed border-line bg-soft p-4">
                  <label className="block text-sm font-semibold text-ink">
                    添加内部评论
                    <textarea name="body" required className="mt-2 min-h-20 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" placeholder="记录要同步给客户或内部同事的生产备注。" />
                  </label>
                  <button className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">提交评论</button>
                </form>
              </div>

              <div>
                <h4 className="font-bold text-ink">跟进记录</h4>
                <div className="mt-3 space-y-2">
                  {selectedOrder.timeline.slice(-5).map((item) => (
                    <div key={item} className="rounded-xl bg-soft p-3 text-sm font-medium text-ink">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-muted">当前客户没有可查看的生产订单。</div>
          )}
        </section>
      </div>
    </Shell>
  );
}
