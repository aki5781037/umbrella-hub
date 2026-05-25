import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getCustomers } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default function CustomersPage() {
  const customers = getCustomers();

  return (
    <Shell active="客户管理">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-ink">客户管理</h3>
          <p className="mt-1 text-sm text-muted">管理客户档案、联系人和跟进计划。</p>
        </div>
        <Link href="/customers/new" className="w-fit rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">新建客户</Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {customers.map((customer) => (
          <article key={customer.name} className="rounded-2xl border border-line bg-white p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">{customer.name}</h3>
                <p className="mt-1 text-sm text-muted">{customer.country}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{customer.status}</span>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">负责人</dt><dd className="font-medium">{customer.owner}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">下次跟进</dt><dd className="font-medium">{customer.next}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">可操作</dt><dd className="font-medium text-brand"><Link href={`/customers/${customer.id}`} className="inline-flex min-h-8 items-center rounded-lg px-2">查看详情</Link></dd></div>
            </dl>
          </article>
        ))}
      </div>
    </Shell>
  );
}
