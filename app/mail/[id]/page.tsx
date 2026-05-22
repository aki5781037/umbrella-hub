import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { getCustomerById, getProjectById } from '@/lib/data';
import { readMails } from '@/lib/emails-db';

export default function MailDetailPage({ params }: { params: { id: string } }) {
  const mailId = decodeURIComponent(params.id);
  const mail = readMails().find((m) => m.id === params.id || m.id === mailId);

  if (!mail) {
    notFound();
  }

  const customer = mail.customerId ? getCustomerById(mail.customerId) : undefined;
  const project = mail.projectId ? getProjectById(mail.projectId) : undefined;

  return (
    <Shell active="邮件中心">
      <div className="mb-4">
        <Link href="/mail" className="text-sm font-medium text-brand">返回邮件列表</Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-2xl border border-line bg-white p-6 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-muted">{mail.time} · {mail.from} &lt;{mail.fromEmail}&gt;</p>
              <h3 className="mt-2 text-2xl font-bold text-ink">{mail.subject}</h3>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{mail.status}</span>
          </div>

          <div className="mt-6 rounded-2xl bg-soft p-5">
            <p className="text-sm font-semibold text-ink">邮件摘要</p>
            <p className="mt-2 text-sm leading-6 text-muted">{mail.summary}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-line p-5">
            <p className="text-sm font-semibold text-ink">邮件正文</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{mail.body}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-line p-5">
            <p className="text-sm font-semibold text-ink">建议动作</p>
            <p className="mt-2 text-sm leading-6 text-muted">{mail.suggestedAction}</p>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
            <h4 className="text-lg font-bold text-ink">关联信息</h4>
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-xl bg-soft p-4">
                <p className="text-muted">客户</p>
                {customer ? <Link href={`/customers/${customer.id}`} className="mt-1 block font-semibold text-brand">{customer.name}</Link> : <p className="mt-1 font-semibold">未关联</p>}
              </div>
              <div className="rounded-xl bg-soft p-4">
                <p className="text-muted">项目</p>
                {project ? <Link href={`/projects/${project.id}`} className="mt-1 block font-semibold text-brand">{project.name}</Link> : <p className="mt-1 font-semibold">未关联</p>}
              </div>
              <div className="rounded-xl bg-soft p-4">
                <p className="text-muted">处理状态</p>
                <p className="mt-1 font-semibold">{mail.status}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
            <h4 className="text-lg font-bold text-ink">附件</h4>
            <div className="mt-5 space-y-3">
              {mail.attachments && mail.attachments.length > 0 ? (
                mail.attachments.map((file) => (
                  <div key={file} className="rounded-xl border border-line p-4 text-sm font-medium text-ink">{file}</div>
                ))
              ) : (
                <p className="text-sm text-muted">暂无附件</p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </Shell>
  );
}
