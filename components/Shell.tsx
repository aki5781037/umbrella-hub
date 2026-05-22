import Link from 'next/link';

const navItems = [
  { href: '/', label: '驾驶舱' },
  { href: '/mail', label: '邮件中心' },
  { href: '/customers', label: '客户管理' },
  { href: '/projects', label: '项目管理' },
  { href: '/tasks', label: '任务提醒' },
  { href: '/portal', label: '客户门户' }
];

export function Shell({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <main className="min-h-screen bg-soft">
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-line bg-white px-5 py-6 lg:block">
        <div className="mb-8">
          <p className="text-sm text-muted">Ark Umbrella</p>
          <h1 className="text-xl font-bold text-ink">Trade Hub</h1>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`block rounded-xl px-4 py-3 text-sm font-medium ${active === item.label ? 'bg-brand text-white' : 'text-muted hover:bg-soft hover:text-ink'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/85 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted">雨伞外贸客户项目管理系统</p>
              <h2 className="text-xl font-bold text-ink sm:text-2xl">{active}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">MVP 运行中</div>
              <Link href="/logout" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-muted hover:bg-soft hover:text-ink">退出</Link>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${active === item.label ? 'bg-brand text-white' : 'bg-soft text-muted'}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </section>
    </main>
  );
}
