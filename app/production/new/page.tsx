import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getCustomers } from '@/lib/data';

export const dynamic = 'force-dynamic';

const defaultTaskLines = [
  '确认客户 PO / PI 信息',
  '确认定金或付款安排',
  '确认物料、包装和生产资料',
  '安排生产排期',
  '准备验货和出货资料'
].join('\n');

export default function NewProductionOrderPage() {
  const customers = getCustomers();

  return (
    <Shell active="生产管理">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/production" className="inline-flex min-h-8 items-center rounded-lg text-sm font-medium text-brand">返回生产管理</Link>
          <h3 className="mt-2 text-2xl font-bold text-ink">新建生产订单</h3>
          <p className="mt-1 text-sm text-muted">从接单确认开始建立订单，后续可在生产管理台推进流程、上传资料和维护任务。</p>
        </div>
      </div>

      <form action="/api/production/orders" method="post" className="rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            客户 *
            <select name="customerId" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand">
              <option value="">选择客户</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name} · {customer.country}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-ink">
            订单号 *
            <input name="orderNo" required placeholder="例如 PO-ABC-260601" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink">
            产品 *
            <input name="product" required placeholder="例如 23寸直杆伞" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink">
            负责人 *
            <input name="owner" required placeholder="例如 Linda" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink">
            数量
            <input name="quantity" placeholder="例如 12,000 pcs" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink">
            金额
            <input name="amount" placeholder="例如 USD 28,600" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink">
            工厂
            <input name="factory" placeholder="例如 义乌 A 厂" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink">
            优先级
            <select name="priority" defaultValue="中" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand">
              <option>高</option>
              <option>中</option>
              <option>低</option>
            </select>
          </label>

          <label className="text-sm font-medium text-ink">
            风险灯号
            <select name="risk" defaultValue="绿灯" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand">
              <option>绿灯</option>
              <option>黄灯</option>
              <option>红灯</option>
            </select>
          </label>

          <label className="text-sm font-medium text-ink">
            计划完成日期
            <input name="due" type="date" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink">
            预计出货日期
            <input name="shipDate" type="date" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink md:col-span-2">
            下一步动作
            <textarea name="nextAction" rows={3} placeholder="例如 确认客户 PO、定金安排和生产资料是否齐全。" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>

          <label className="text-sm font-medium text-ink md:col-span-2">
            默认生产子任务
            <textarea name="taskLines" rows={6} defaultValue={defaultTaskLines} className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">保存生产订单</button>
          <Link href="/production" className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted hover:bg-soft">取消</Link>
        </div>
      </form>
    </Shell>
  );
}
