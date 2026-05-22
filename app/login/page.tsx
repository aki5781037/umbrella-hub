import { accounts, normalizeNextPath } from '@/lib/auth';

export default function LoginPage({ searchParams }: { searchParams?: { error?: string; next?: string } }) {
  const nextPath = normalizeNextPath(searchParams?.next);
  const hasError = searchParams?.error === 'invalid';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
      <section className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-gradient-to-br from-blue-700 to-slate-950 p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">Ark Umbrella</p>
          <h1 className="mt-5 text-3xl font-bold md:text-4xl">登录后确认身份</h1>
          <p className="mt-4 text-blue-100">内部同事进入 CRM 管理后台，海外客户进入客户项目门户。当前为 MVP 本地账号，后续可替换为数据库用户、邮箱验证码或企业 SSO。</p>
          <div className="mt-8 space-y-3 rounded-2xl bg-white/10 p-5 text-sm text-blue-50 ring-1 ring-white/15">
            <p className="font-semibold">演示账号</p>
            <p>{accounts.admin.label}：{accounts.admin.email} / {accounts.admin.password}</p>
            <p>{accounts.customer.label}：{accounts.customer.email} / {accounts.customer.password}</p>
          </div>
        </div>
        <form action="/api/login" method="post" className="space-y-5 p-8 text-ink md:p-10">
          <div>
            <p className="text-sm text-muted">Umbrella Trade Hub</p>
            <h2 className="mt-1 text-2xl font-bold">账号登录</h2>
          </div>
          {hasError ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">邮箱或密码不正确，请重新输入。</div> : null}
          <input type="hidden" name="next" value={nextPath} />
          <label className="block text-sm font-semibold">
            邮箱
            <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" placeholder="admin@arkumbrella.com" />
          </label>
          <label className="block text-sm font-semibold">
            密码
            <input name="password" type="password" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" placeholder="请输入密码" />
          </label>
          <button type="submit" className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white shadow-panel">登录</button>
        </form>
      </section>
    </main>
  );
}
