import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getCustomers } from '@/lib/data';
import { NewProjectForm } from './NewProjectForm';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  const customers = getCustomers().map((customer) => ({
    id: customer.id,
    name: customer.name,
    country: customer.country,
    owner: customer.owner
  }));

  return (
    <Shell active="项目管理">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/projects" className="inline-flex min-h-8 items-center rounded-lg text-sm font-medium text-brand">返回项目看板</Link>
          <h3 className="mt-2 text-2xl font-bold text-ink">新建项目</h3>
          <p className="mt-1 text-sm text-muted">先选客户和外贸项目类型，系统自动带出精简流程和默认子任务。</p>
        </div>
      </div>

      <NewProjectForm customers={customers} />
    </Shell>
  );
}
