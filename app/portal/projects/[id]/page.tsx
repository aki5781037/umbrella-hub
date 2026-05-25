import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCustomerIdForIdentity } from '@/lib/auth';
import { getProjectWithPortalSubmissions } from '@/lib/portal-submissions';

export const dynamic = 'force-dynamic';

export default function PortalProjectDetailPage({ params }: { params: { id: string } }) {
  const identity = cookies().get('umbrella_identity')?.value;
  const customerId = getCustomerIdForIdentity(identity);
  const project = getProjectWithPortalSubmissions(params.id);

  if (!project || !project.portalVisible || !customerId || project.customerId !== customerId) {
    notFound();
  }

  const pendingConfirmations = project.confirmations.filter((item) => item.status !== '已确认').length;
  const attachmentByName = new Map((project.attachmentFiles || []).map((file) => [file.name, file]));

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white/10 p-6 shadow-panel ring-1 ring-white/15 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/portal" className="inline-flex min-h-8 items-center rounded-lg text-sm font-semibold text-blue-200">Back to portal</Link>
              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{project.name}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">{project.customer} · Current stage: {project.stage}</p>
            </div>
            <Link href="/logout" className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">退出</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl bg-white p-6 text-ink shadow-panel">
            <h2 className="text-xl font-bold">Project Summary</h2>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-soft p-4"><p className="text-muted">Current Stage</p><p className="mt-1 font-bold">{project.stage}</p></div>
              <div className="rounded-xl bg-soft p-4"><p className="text-muted">Estimated Finish</p><p className="mt-1 font-bold">{project.due}</p></div>
              <div className="rounded-xl bg-soft p-4"><p className="text-muted">Next Step</p><p className="mt-1 font-bold">{project.nextAction}</p></div>
              <div className="rounded-xl bg-soft p-4"><p className="text-muted">Files</p><p className="mt-1 font-bold">{project.files.length}</p></div>
              <div className="rounded-xl bg-soft p-4"><p className="text-muted">Pending Confirmations</p><p className="mt-1 font-bold">{pendingConfirmations}</p></div>
            </div>
          </article>

          <article className="rounded-2xl bg-white p-6 text-ink shadow-panel">
            <h2 className="text-xl font-bold">Items to Confirm</h2>
            <div className="mt-5 space-y-3">
              {project.confirmations.length > 0 ? project.confirmations.map((item) => (
                <div key={item.title} className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-2 text-blue-600">Due: {item.due}</p>
                    </div>
                    <span className="w-fit rounded-full bg-white px-3 py-1 font-semibold">{item.status}</span>
                  </div>
                  <p className="mt-3 leading-6">{item.response}</p>
                  <form action="/api/portal/confirmations" method="post" className="mt-4 space-y-3">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="title" value={item.title} />
                    <textarea name="message" className="min-h-20 w-full rounded-xl border border-blue-100 bg-white p-3 text-sm outline-none focus:border-brand" placeholder="Optional note for our team..." />
                    <div className="flex flex-wrap gap-2">
                      <button name="action" value="confirm" className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white">Confirm</button>
                      <button name="action" value="question" className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700">Have Question</button>
                    </div>
                  </form>
                </div>
              )) : <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">No confirmation items yet.</div>}
            </div>
          </article>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 text-ink shadow-panel">
            <h2 className="text-xl font-bold">Files</h2>
            <div className="mt-5 space-y-3">
              {project.files.length > 0 ? project.files.map((file) => (
                <div key={file} className="flex flex-col gap-2 rounded-xl bg-soft p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold">{file}</span>
                  {attachmentByName.get(file) ? (
                    <a
                      href={`/api/projects/${encodeURIComponent(project.id)}/attachments/${encodeURIComponent(attachmentByName.get(file)!.storedName)}`}
                      className="w-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-brand"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="w-fit rounded-lg bg-white px-3 py-1 text-xs font-semibold text-muted">Record only</span>
                  )}
                </div>
              )) : <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">No files uploaded yet.</div>}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-6 text-ink shadow-panel">
            <h2 className="text-xl font-bold">COMMENTS</h2>
            <div className="mt-5 space-y-3">
              {project.messages.length > 0 ? project.messages.map((message, index) => (
                <div key={`${message}-${index}`} className="rounded-xl border border-line p-4 text-sm text-muted">{message}</div>
              )) : <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">No comments yet.</div>}
            </div>
            <form action="/api/portal/messages" method="post" className="mt-5 rounded-xl bg-soft p-4">
              <input type="hidden" name="projectId" value={project.id} />
              <label className="text-sm font-semibold text-ink" htmlFor="portal-message">Add Comment</label>
              <textarea id="portal-message" name="message" className="mt-3 min-h-28 w-full rounded-xl border border-line bg-white p-3 text-sm outline-none focus:border-brand" placeholder="Type your comment here..." required />
              <button className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Submit Comment</button>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
