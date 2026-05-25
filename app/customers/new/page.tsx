import Link from 'next/link';
import { Shell } from '@/components/Shell';

export default function NewCustomerPage() {
  return (
    <Shell active="客户管理">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/customers" className="inline-flex min-h-8 items-center rounded-lg text-sm font-medium text-brand">返回客户列表</Link>
          <h3 className="mt-2 text-2xl font-bold text-ink">新建客户</h3>
          <p className="mt-1 text-sm text-muted">录入客户基础信息、主要联系人和下次跟进时间。</p>
        </div>
      </div>

      <form action="/api/customers" method="post" className="rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">客户名称 *<input name="name" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">公司全称<input name="legalName" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">国家/地区 *<input name="country" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">负责人 *<input name="owner" required placeholder="例如 Linda" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">客户类型<input name="type" placeholder="批发商 / 品牌商 / 零售商" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">客户等级<select name="level" defaultValue="B" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"><option>A</option><option>B</option><option>C</option></select></label>
          <label className="text-sm font-medium text-ink">客户来源<input name="source" placeholder="官网询盘 / 展会 / 邮件开发" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">客户状态<select name="status" defaultValue="新线索" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"><option>新线索</option><option>正在开发</option><option>样品沟通</option><option>报价沟通</option><option>返单跟进</option><option>暂停跟进</option></select></label>
          <label className="text-sm font-medium text-ink">下次跟进<input name="next" type="date" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">联系人姓名<input name="contactName" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">联系人职位<input name="contactTitle" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">联系人邮箱<input name="contactEmail" type="email" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink">联系人电话<input name="contactPhone" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium text-ink md:col-span-2">客户偏好与备注<textarea name="preference" rows={4} className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" /></label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">保存客户</button>
          <Link href="/customers" className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted hover:bg-soft">取消</Link>
        </div>
      </form>
    </Shell>
  );
}
