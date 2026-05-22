import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { getCustomerById, getProjectsByCustomerId } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  const customerProjects = getProjectsByCustomerId(customer.id);

  return (
    <Shell active="客户管理">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/customers" className="text-sm font-medium text-brand">返回客户列表</Link>
          <h3 className="mt-2 text-2xl font-bold text-ink">{customer.name}</h3>
          <p className="mt-1 text-sm text-muted">{customer.legalName} · {customer.country}</p>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{customer.status}</span>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">客户基本资料</h4>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-soft p-4"><dt className="text-muted">客户类型</dt><dd className="mt-1 font-semibold">{customer.type}</dd></div>
            <div className="rounded-xl bg-soft p-4"><dt className="text-muted">客户等级</dt><dd className="mt-1 font-semibold">{customer.level}</dd></div>
            <div className="rounded-xl bg-soft p-4"><dt className="text-muted">客户来源</dt><dd className="mt-1 font-semibold">{customer.source}</dd></div>
            <div className="rounded-xl bg-soft p-4"><dt className="text-muted">负责人</dt><dd className="mt-1 font-semibold">{customer.owner}</dd></div>
            <div className="rounded-xl bg-soft p-4"><dt className="text-muted">最近联系</dt><dd className="mt-1 font-semibold">{customer.lastContact}</dd></div>
            <div className="rounded-xl bg-soft p-4"><dt className="text-muted">下次跟进</dt><dd className="mt-1 font-semibold">{customer.next}</dd></div>
          </dl>
          <div className="mt-4 rounded-xl bg-soft p-4 text-sm">
            <p className="text-muted">客户偏好与备注</p>
            <p className="mt-1 font-semibold text-ink">{customer.preference}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">主要联系人</h4>
          <div className="mt-5 space-y-3">
            {customer.contacts.map((contact) => (
              <div key={contact.email} className="rounded-xl border border-line p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{contact.name} · {contact.title}</p>
                  {contact.primary ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">主要联系人</span> : null}
                </div>
                <p className="mt-2 text-muted">{contact.email}</p>
                <p className="mt-1 text-muted">{contact.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">关联项目</h4>
          <div className="mt-5 space-y-3">
            {customerProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block rounded-xl border border-line p-4 hover:bg-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{project.name}</p>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">{project.stage}</span>
                </div>
                <p className="mt-2 text-sm text-muted">负责人：{project.owner} · 计划完成：{project.due}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h4 className="text-lg font-bold text-ink">最近沟通记录</h4>
          <div className="mt-5 space-y-3">
            {customer.activities.map((activity) => (
              <div key={activity} className="rounded-xl bg-soft p-4 text-sm font-medium text-ink">{activity}</div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
