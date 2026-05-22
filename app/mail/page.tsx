'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/Shell';
export type MailConfig = {
  host: string;
  port: number;
  user: string;
  password?: string;
  secure: boolean;
};

export type MailItem = {
  id: string;
  time: string;
  from: string;
  fromEmail: string;
  subject: string;
  status: '未读' | '待回复' | '已关联' | '已回复';
  customer?: string;
  customerId?: string;
  projectId?: string;
  summary: string;
  body: string;
  suggestedAction?: string;
  attachments?: string[];
};

export default function MailPage() {
  const router = useRouter();
  const [mails, setMails] = useState<MailItem[]>([]);
  const [config, setConfig] = useState<MailConfig | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 弹窗表单状态
  const [host, setHost] = useState('');
  const [port, setPort] = useState(993);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  
  // 提示与通知
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);

  // 初始化加载邮件和配置
  useEffect(() => {
    fetchMails();
    fetchConfig();
  }, []);

  const fetchMails = async () => {
    try {
      const res = await fetch('/api/mail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'read-only-check' }) // 仅作为握手读取，实际不触发同步
      }).catch(() => null);
      
      // 如果没有真实邮件，我们这里直接通过后台的 JSON 读写或本地种子初始化。
      // 为确保一致性，我们建立一个 API 来直接 GET 邮件列表
      const listRes = await fetch('/api/mail/list').then(r => r.json()).catch(() => ({ mails: [] }));
      setMails(listRes.mails || []);
    } catch {
      // 降级
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/mail/config');
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setHost(data.config.host || '');
        setPort(data.config.port || 993);
        setUser(data.config.user || '');
        setPassword(data.config.password || '');
        setSecure(data.config.secure !== false);
      }
    } catch {
      // 忽略
    }
  };

  // 触发邮件同步
  const handleSync = async (mode: 'real' | 'sandbox') => {
    if (mode === 'real' && (!config || !config.host)) {
      // 如果没有配置真实邮箱，则弹出邮箱配置弹框
      showToast('error', '请先配置邮箱 IMAP 凭证。');
      setIsConfigOpen(true);
      return;
    }

    setIsSyncing(true);
    showToast('success', mode === 'real' ? '正在连接 IMAP 服务并自动同步新邮件...' : '正在模拟同步外贸业务来信...');
    
    try {
      const res = await fetch('/api/mail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('success', data.message || '邮件同步完成！');
        // 重新拉取邮件列表并刷新当前页面路由（以同步驾驶舱等其他地方的服务器缓存）
        await fetchMails();
        router.refresh();
      } else {
        showToast('error', data.error || '邮件同步失败。');
      }
    } catch (err: any) {
      showToast('error', `网络错误: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 保存配置并测试连接
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsTestingConn(true);

    try {
      const res = await fetch('/api/mail/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port: Number(port), user, password, secure })
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', '邮箱 IMAP 凭证成功通过测试并已保存！');
        setIsConfigOpen(false);
        fetchConfig();
        router.refresh();
      } else {
        setFormError(data.error || '保存配置失败，请检查参数或密码。');
      }
    } catch (err: any) {
      setFormError(`网络错误: ${err.message || err}`);
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSystemReset = () => {
    showToast('success', '正在执行系统净化并重置浏览器缓存...');
    // 清理 cookie
    document.cookie = "umbrella_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "umbrella_identity=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // 清理 localStorage 与 sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    // 延迟 1.2 秒后强行刷新并拉回根路径
    setTimeout(() => {
      window.location.replace('/');
    }, 1200);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  return (
    <Shell active="邮件中心">
      {/* Toast 提示通知 */}
      {notification && (
        <div className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold shadow-2xl transition-all duration-300 animate-slide-in ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {notification.message}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">收件箱</h3>
            <p className="mt-1 text-sm text-muted">
              {config ? `当前关联邮箱：${config.user}` : '未配置外部邮箱，支持一键沙箱模拟同步或配置真实邮箱。'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted hover:bg-soft hover:text-ink transition-all"
            >
              邮箱设置 {config ? '⚙️' : '➕'}
            </button>
            
            {/* 真实同步按钮 */}
            {config && (
              <button
                disabled={isSyncing}
                onClick={() => handleSync('real')}
                className={`rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 hover:bg-indigo-700 transition-all flex items-center gap-2 ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSyncing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                同步邮件
              </button>
            )}

            {/* 沙箱一键模拟同步按钮 */}
            <button
              disabled={isSyncing}
              onClick={() => handleSync('sandbox')}
              className={`rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSyncing ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              模拟拉取 🚀
            </button>

            {/* 自动重置净化按钮 */}
            <button
              onClick={handleSystemReset}
              className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300 transition-all"
            >
              重置缓存与会话并强制回首页 🔄
            </button>
          </div>
        </div>

        {/* 邮件数据列表 */}
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-soft text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">时间</th>
                <th className="px-5 py-3.5 font-semibold">发件人</th>
                <th className="px-5 py-3.5 font-semibold">关联客户</th>
                <th className="px-5 py-3.5 font-semibold">主题</th>
                <th className="px-5 py-3.5 font-semibold">状态</th>
                <th className="px-5 py-3.5 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {mails.length > 0 ? (
                mails.map((mail) => (
                  <tr key={mail.id} className="border-t border-line hover:bg-soft/40 transition-colors">
                    <td className="px-5 py-4 text-muted">{mail.time}</td>
                    <td className="px-5 py-4 font-medium text-ink">{mail.from}</td>
                    <td className="px-5 py-4">
                      {mail.customerId ? (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                          {mail.customer}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-muted border border-slate-100">
                          未关联
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      <Link href={`/mail/${encodeURIComponent(mail.id)}`} className="hover:text-brand transition-colors">
                        {mail.subject}
                      </Link>
                      {mail.projectId && (
                        <span className="ml-2 inline-flex items-center text-xs font-medium text-emerald-600">
                          🔗 已绑项目
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        mail.status === '未读'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                          : mail.status === '已关联'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {mail.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/mail/${encodeURIComponent(mail.id)}`} className="font-semibold text-brand hover:text-brand-dark transition-colors">
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    暂无邮件记录。请点击右上角进行“同步邮件”或“模拟拉取”。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 磨砂玻璃 (Glassmorphism) 高端配置弹框 */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-lg rounded-3xl bg-white/80 p-8 shadow-2xl border border-white/30 backdrop-blur-xl text-ink mx-4 animate-scale-in">
            <button
              onClick={() => setIsConfigOpen(false)}
              className="absolute right-6 top-6 text-muted hover:text-ink text-xl transition-all"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-ink">配置 IMAP 邮箱服务</h3>
            <p className="mt-1.5 text-sm text-muted">
              配置外部邮箱以自动同步海外客户往来信件。所有账号数据将直接保存在您的本地飞牛服务器中，保障安全。
            </p>

            {formError && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-800 leading-5">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider">IMAP 接收服务器地址</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. imap.qq.com, imap.gmail.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-white/50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider">端口 (Port)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 993, 143"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border border-line bg-white/50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div className="flex items-center pt-7 pl-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={secure}
                      onChange={(e) => setSecure(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    <span className="ms-3 text-sm font-semibold text-ink">SSL 安全连接</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider">邮箱账号 (User Address)</label>
                <input
                  type="email"
                  required
                  placeholder="your-name@example.com"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-white/50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider">密码 / 专属授权码</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={config ? '******' : '邮箱授权码或账户密码'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white/50 pl-4 pr-12 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-ink font-semibold"
                  >
                    {showPassword ? '隐藏' : '显示'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-muted hover:bg-soft hover:text-ink transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isTestingConn}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                >
                  {isTestingConn ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      正在测试并保存...
                    </>
                  ) : (
                    '保存设置'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
