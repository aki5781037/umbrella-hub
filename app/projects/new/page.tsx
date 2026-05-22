import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getCustomers } from '@/lib/data';

export const dynamic = 'force-dynamic';

const stages = ['新线索', '已建立联系', '需求确认', '报价准备中', '报价已发送', '样品 / 方案沟通', '商务谈判', '等待客户决定', '已成交'];

export default function NewProjectPage() {
  const customers = getCustomers();

  return (
    <Shell active="项目管理">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/projects" className="text-sm font-medium text-brand">返回项目列表</Link>
          <h3 className="mt-2 text-2xl font-bold text-ink">新建项目</h3>
          <p className="mt-1 text-sm text-muted">为已有客户创建项目，并自动生成第一条跟进任务。</p>
        </div>
      </div>

      <form action="/api/projects" method="post" className="rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">关联客户 *<select name="customerId" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"><option value="">请选择客户</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.country}</option>)}</select></label>
          <label className="text-sm font-medium text-ink">项目名称 *<input name="name" required placeholder="例如 德国客户自动伞报价" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">项目类型<input name="type" placeholder="新客户开发 / OEM 定制 / 返单" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">阶段<select name="stage" defaultValue="新线索" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand">{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
          <label className="text-sm font-medium text-ink">负责人 *<input name="owner" required placeholder="例如 Linda" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">协作人<input name="collaborators" placeholder="多个用逗号分隔" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">预计金额<input name="amount" placeholder="例如 USD 18,000" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">风险状态<select name="risk" defaultValue="绿灯" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"><option>绿灯</option><option>黄灯</option><option>红灯</option></select></label>
          <label className="text-sm font-medium text-ink">优先级<select name="priority" defaultValue="中" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"><option>高</option><option>中</option><option>低</option></select></label>
          <label className="text-sm font-medium text-ink">计划完成<input name="due" type="date" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">下次跟进<input name="nextFollow" type="date" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink md:col-span-2">下一步动作<textarea name="nextAction" rows={4} placeholder="例如 确认客户目标价、MOQ 和包装需求" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">保存项目</button>
          <Link href="/projects" className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted hover:bg-soft">取消</Link>
        </div>
      </form>
    </Shell>
  );
}
