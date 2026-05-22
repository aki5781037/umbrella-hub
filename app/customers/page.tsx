import { Shell } from '@/components/Shell';

const customers = [
  { name: 'ABC Malaysia', country: 'Malaysia', owner: 'Linda', status: '正在开发', next: '2026-05-23' },
  { name: 'Korea Brand', country: 'Korea', owner: 'Cathy', status: '样品沟通', next: '2026-05-25' },
  { name: 'Sunny Retail', country: 'UAE', owner: 'Tom', status: '返单跟进', next: '2026-05-22' }
];

export default function CustomersPage() {
  return (
    <Shell active="客户管理">
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
              <div className="flex justify-between gap-3"><dt className="text-muted">可操作</dt><dd className="font-medium text-brand">创建项目 / 发邮件</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </Shell>
  );
}
