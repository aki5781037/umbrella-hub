import Link from 'next/link';

const navItems = [
  { href: '/', label: '驾驶舱' },
  { href: '/mail', label: '邮件中心' },
  { href: '/umbrella-catalog', label: '伞款图库' },
  { href: '/customers', label: '客户管理' },
  { href: '/projects', label: '项目管理' },
  { href: '/tasks', label: '任务提醒' },
  { href: '/portal', label: '客户门户' }
];

export function Shell({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 relative">
      {/* 科技感星空网格全局背景 */}
      <div className="cyber-grid" />

      {/* 背景极光晕染装饰 */}
      <div className="fixed top-[-10%] left-[5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-800/60 bg-slate-950/45 px-5 py-6 backdrop-blur-xl lg:block z-20">
        <div className="mb-8 relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)] overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Ark Umbrella</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-md">
            TRADE HUB
          </h1>
          <div className="mt-2 text-[9px] font-mono text-indigo-500/80 uppercase tracking-widest border-t border-indigo-500/20 pt-1.5 flex items-center justify-between">
            <span>OS: ARK-CORE v1.4</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isSelf = active === item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-all relative overflow-hidden group ${
                  isSelf
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 border-l-2 border-blue-500 shadow-[inset_1px_0_0_rgba(59,130,246,0.2)]'
                    : 'text-slate-400 hover:bg-slate-900/30 hover:text-slate-200'
                }`}
              >
                {/* 悬停闪烁微光条 */}
                {!isSelf && (
                  <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500/50 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section className="lg:pl-64 min-h-screen flex flex-col relative z-10">
        <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/45 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-mono tracking-wider text-slate-500 uppercase">{"// SYSTEM INTEGRATION TERMINAL"}</p>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent sm:text-2xl mt-0.5 tracking-wide">
                {active}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {"SYS NOMINAL // 系统正常"}
              </div>
              <a
                href="/logout"
                className="rounded-full border border-rose-500/30 bg-rose-500/5 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300 transition-all uppercase tracking-widest"
              >
                SECURE EXIT
              </a>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const isSelf = active === item.label;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    isSelf
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <div className="p-4 sm:p-6 flex-1">{children}</div>
      </section>
    </main>
  );
}
