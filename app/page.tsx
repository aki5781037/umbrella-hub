import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { getAllTasks, getMetrics, getProjects } from '@/lib/data';
import { getPortalSubmissionAlerts } from '@/lib/portal-submissions';
import { readMails } from '@/lib/emails-db';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const portalSubmissionAlerts = getPortalSubmissionAlerts();
  const mails = readMails();
  const allTasks = getAllTasks();
  const metrics = getMetrics();
  const projects = getProjects();

  // 动态更新“未读邮件”的卡片数据
  const unreadMailsCount = mails.filter((mail) => mail.status === '未读').length;
  const dynamicMetrics = metrics.map((item) => {
    if (item.label === '未读邮件') {
      return { ...item, value: String(unreadMailsCount) };
    }
    return item;
  });

  // 根据指标标签返回科技专属色彩配置及 SVG 微折线图底纹
  const getMetricStyle = (label: string) => {
    switch (label) {
      case '今日待跟进':
        return {
          border: 'hover:border-blue-500/50 shadow-blue-500/5 hover:shadow-blue-500/15',
          textGlow: 'text-blue-400 text-glow-blue',
          accentBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          indicator: 'bg-blue-500',
          svg: (
            <svg className="absolute bottom-0 right-0 h-16 w-32 opacity-25 group-hover:opacity-45 transition-opacity" viewBox="0 0 100 30" fill="none">
              <path d="M0,25 Q15,10 30,22 T60,8 T90,18 L100,10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
              <path d="M0,25 Q15,10 30,22 T60,8 T90,18 L100,10 L100,30 L0,30 Z" fill="url(#blue-grad)" opacity="0.3" />
              <defs>
                <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          )
        };
      case '未读邮件':
        return {
          border: 'hover:border-purple-500/50 shadow-purple-500/5 hover:shadow-purple-500/15',
          textGlow: 'text-purple-400 text-glow-purple',
          accentBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          indicator: 'bg-purple-500',
          svg: (
            <svg className="absolute bottom-0 right-0 h-16 w-32 opacity-25 group-hover:opacity-45 transition-opacity" viewBox="0 0 100 30" fill="none">
              <path d="M0,28 L15,10 L25,22 L45,5 L65,18 L80,3 L100,15" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
              <path d="M0,28 L15,10 L25,22 L45,5 L65,18 L80,3 L100,15 L100,30 L0,30 Z" fill="url(#purp-grad)" opacity="0.3" />
              <defs>
                <linearGradient id="purp-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          )
        };
      case '进行中项目':
        return {
          border: 'hover:border-emerald-500/50 shadow-emerald-500/5 hover:shadow-emerald-500/15',
          textGlow: 'text-emerald-400 text-glow-green',
          accentBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          indicator: 'bg-emerald-500',
          svg: (
            <svg className="absolute bottom-0 right-0 h-16 w-32 opacity-25 group-hover:opacity-45 transition-opacity" viewBox="0 0 100 30" fill="none">
              <rect x="5" y="15" width="6" height="15" fill="#10b981" opacity="0.4" />
              <rect x="20" y="8" width="6" height="22" fill="#10b981" opacity="0.6" />
              <rect x="35" y="18" width="6" height="12" fill="#10b981" opacity="0.4" />
              <rect x="50" y="5" width="6" height="25" fill="#10b981" opacity="0.8" />
              <rect x="65" y="12" width="6" height="18" fill="#10b981" opacity="0.6" />
              <rect x="80" y="2" width="6" height="28" fill="#10b981" opacity="0.9" />
              <rect x="95" y="10" width="6" height="20" fill="#10b981" opacity="0.7" />
            </svg>
          )
        };
      case '逾期事项':
      default:
        return {
          border: 'hover:border-rose-500/50 shadow-rose-500/5 hover:shadow-rose-500/15',
          textGlow: 'text-rose-400 text-glow-red',
          accentBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          indicator: 'bg-rose-500',
          svg: (
            <svg className="absolute bottom-0 right-0 h-16 w-32 opacity-25 group-hover:opacity-45 transition-opacity" viewBox="0 0 100 30" fill="none">
              <circle cx="50" cy="30" r="28" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="50" cy="30" r="18" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 3" />
              <circle cx="50" cy="30" r="8" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="50" y1="2" x2="50" y2="30" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
              <line x1="20" y1="30" x2="80" y2="30" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
            </svg>
          )
        };
    }
  };

  return (
    <Shell active="驾驶舱">
      {/* 头部大盘数据舱段 */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 relative z-10">
        {dynamicMetrics.map((item, index) => {
          const style = getMetricStyle(item.label);
          return (
            <div
              key={item.label}
              className={`relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-panel transition-all duration-300 hover:bg-slate-900/60 group tech-corner overflow-hidden ${style.border}`}
            >
              {/* 微光特效 */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-wider text-slate-500 uppercase">
                  Telemetry // 0{index + 1}
                </span>
                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${style.accentBg}`}>
                  {item.label}
                </span>
              </div>

              <div className="mt-5 flex items-baseline justify-between relative z-10">
                <span className={`text-4xl font-extrabold font-mono tracking-tight ${style.textGlow}`}>
                  {item.value}
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Active Feed
                </span>
              </div>

              {/* 装饰用科技线条底图 */}
              {style.svg}
            </div>
          );
        })}
      </section>

      {/* 核心控制面板组 */}
      <section className="mt-6 grid gap-6 xl:grid-cols-2 relative z-10">
        {/* 模块 1：今日待跟进 */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-panel backdrop-blur tech-corner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-5 flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 bg-amber-500 rounded shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <h3 className="text-base font-bold text-slate-100 tracking-wide">今日待处理事项</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">[ SORTED BY DEADLINE ]</span>
          </div>

          <div className="space-y-3">
            {allTasks.filter((task) => task.status !== '已完成').slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="relative rounded-xl border border-slate-800/50 bg-slate-950/30 p-4 transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/20 overflow-hidden"
              >
                {/* 激光状态条装饰 */}
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />

                <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                  <div>
                    <p className="font-semibold text-slate-200 text-sm tracking-wide">{task.title}</p>
                    <p className="mt-1.5 text-xs text-slate-500 font-medium">
                      {task.customer} · {task.projectName} · {task.owner}
                    </p>
                  </div>
                  <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                    {task.status}
                  </span>
                </div>
                <div className="mt-3.5 pl-2 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>DEADLINE: {task.due}</span>
                  <span className="text-[10px] text-slate-600">{"// TASK-ID: "}{task.id.slice(0,8)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 模块 2：最新邮件 */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-panel backdrop-blur tech-corner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-5 flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-500 rounded shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <h3 className="text-base font-bold text-slate-100 tracking-wide">最新邮件</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">[ INTELLIGENT ROUTED ]</span>
          </div>

          <div className="space-y-3">
            {mails.slice(0, 4).map((mail) => {
              const isUnread = mail.status === '未读';
              return (
                <Link
                  key={mail.id}
                  href={`/mail/${encodeURIComponent(mail.id)}`}
                  className="relative block rounded-xl border border-slate-800/50 bg-slate-950/30 p-4 transition-all duration-300 hover:border-blue-500/40 hover:bg-slate-900/40 overflow-hidden group/item"
                >
                  {/* 未读邮件的闪烁侧边条 */}
                  {isUnread && (
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
                  )}

                  <div className={`flex items-start justify-between gap-4 ${isUnread ? 'pl-2' : ''}`}>
                    <div>
                      <p className="font-semibold text-slate-200 text-sm tracking-wide group-hover/item:text-blue-400 transition-colors flex items-center gap-1.5">
                        {mail.subject}
                        {mail.projectId && (
                          <span className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            🔗 PRJ_LOCKED
                          </span>
                        )}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-500 font-medium">
                        {mail.time} · {mail.from} · {mail.customer}
                      </p>
                    </div>
                    <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                      isUnread
                        ? 'border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                        : 'border border-blue-500/20 bg-blue-500/10 text-blue-400'
                    }`}>
                      {mail.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 模块 3：项目风险预警 */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-panel backdrop-blur tech-corner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-5 flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 bg-rose-500 rounded shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <h3 className="text-base font-bold text-slate-100 tracking-wide">项目风险预警</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">[ TELEMETRY ALERTS ]</span>
          </div>

          <div className="space-y-3">
            {projects.map((project) => {
              const isHighRisk = project.risk === '红灯' || project.risk === '高';
              const isMediumRisk = project.risk === '黄灯' || project.risk === '中';
              
              const accentColor = isHighRisk 
                ? 'from-rose-500 to-rose-600 shadow-rose-500/40 text-rose-400 border-rose-500/30 bg-rose-500/10' 
                : isMediumRisk 
                ? 'from-amber-500 to-amber-600 shadow-amber-500/40 text-amber-400 border-amber-500/30 bg-amber-500/10' 
                : 'from-emerald-500 to-emerald-600 shadow-emerald-500/40 text-emerald-400 border-emerald-500/20 bg-emerald-500/10';

              return (
                <div
                  key={project.name}
                  className="relative rounded-xl border border-slate-800/50 bg-slate-950/30 p-4 transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/20 overflow-hidden"
                >
                  {/* 激光状态条装饰 */}
                  <span className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${accentColor.split(' ').slice(0, 3).join(' ')}`} />

                  <div className="flex items-start justify-between gap-4 pl-2">
                    <div>
                      <p className="font-semibold text-slate-200 text-sm tracking-wide">{project.name}</p>
                      <p className="mt-1.5 text-xs text-slate-500 font-medium">
                        {project.customer} · {project.stage} · {project.owner}
                      </p>
                    </div>
                    <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold border ${accentColor.split(' ').slice(3).join(' ')}`}>
                      {project.risk === '红灯' ? '高风险 ⚠️' : project.risk === '黄灯' ? '中风险 ⚡' : '正常 Nominal'}
                    </span>
                  </div>
                  <div className="mt-3.5 pl-2 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>ESTIMATED DELIVERY: {project.due}</span>
                    <span className="text-[10px] text-slate-600">{"// STAGE_KEY: "}{project.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 模块 4：最新客户提交 */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-panel backdrop-blur tech-corner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-5 flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 bg-purple-500 rounded shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              <h3 className="text-base font-bold text-slate-100 tracking-wide">最新客户提交</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">[ {portalSubmissionAlerts.length} PENDING ACTION ]</span>
          </div>

          <div className="space-y-3">
            {portalSubmissionAlerts.length > 0 ? (
              portalSubmissionAlerts.slice(0, 4).map((submission) => (
                <Link
                  key={submission.id}
                  href={`/projects/${submission.projectId}`}
                  className="relative block rounded-xl border border-slate-800/50 bg-slate-950/30 p-4 transition-all duration-300 hover:border-purple-500/40 hover:bg-slate-900/40 overflow-hidden group/item"
                >
                  {/* 高科技十字丝瞄准装饰线 */}
                  <svg className="absolute bottom-2 right-2 h-4 w-4 opacity-10 group-hover/item:opacity-30 transition-opacity text-purple-400" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <line x1="50" y1="0" x2="50" y2="100" strokeWidth="6"/>
                    <line x1="0" y1="50" x2="100" y2="50" strokeWidth="6"/>
                    <circle cx="50" cy="50" r="30" strokeWidth="6"/>
                  </svg>

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-200 text-sm tracking-wide group-hover/item:text-purple-400 transition-colors">
                        {submission.title}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-500 font-medium">
                        {submission.customer} · {submission.projectName} · {submission.createdAt}
                      </p>
                    </div>
                    <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-400">
                      {submission.kind === 'confirmation' ? '事项确认' : '信息反馈'}
                    </span>
                  </div>
                  
                  {/* 反馈内容极极客式终端展现 */}
                  <div className="mt-3.5 rounded-lg bg-slate-950/50 p-2 border border-slate-800/40 font-mono text-xs text-slate-400 leading-relaxed relative">
                    <span className="text-purple-500 font-bold mr-1">&gt;</span> {submission.message}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500 font-mono">
                {"// NO ACTIVE INCOMING TELEMETRY SUBMISSIONS"}
              </div>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
