import { Shell } from '@/components/Shell';
import { BackupPanel } from '@/app/settings/BackupPanel';
import { ensureBackupSchedulerStarted, getBackupStatus, runDueAutoBackup } from '@/lib/backup';
import { getCustomerAccounts } from '@/lib/customer-accounts';
import { getCustomers } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  ensureBackupSchedulerStarted();
  await runDueAutoBackup();
  const backupStatus = getBackupStatus();
  const customers = getCustomers();
  const customerAccounts = getCustomerAccounts();

  return (
    <Shell active="系统设置">
      <div className="mb-5">
        <p className="text-sm font-semibold text-brand">系统配置</p>
        <h3 className="mt-2 text-2xl font-bold text-ink">账号、备份与恢复设置</h3>
        <p className="mt-1 text-sm text-muted">管理客户门户账号，并为客户、项目、生产、邮件和门户数据建立可恢复的备份策略。</p>
      </div>

      <section className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">客户门户账号</h3>
            <p className="mt-1 text-sm text-muted">为客户分配登录邮箱和密码；客户登录后只会看到绑定客户自己的项目和生产订单。</p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">{customerAccounts.length} 个账号</span>
        </div>

        <form action="/api/customer-accounts" method="post" className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <label className="block text-sm font-semibold text-ink">
            绑定客户
            <select name="customerId" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand">
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name} · {customer.country}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-ink">
            登录邮箱
            <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" placeholder="buyer@example.com" />
          </label>

          <label className="block text-sm font-semibold text-ink">
            初始密码
            <input name="password" required minLength={8} className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" placeholder="至少 8 位" />
          </label>

          <label className="block text-sm font-semibold text-ink">
            账号备注
            <input name="label" className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" placeholder="采购负责人 / 公司简称" />
          </label>

          <div className="flex items-end">
            <button className="w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">保存账号</button>
          </div>
        </form>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {customerAccounts.map((account) => {
            const customer = customers.find((item) => item.id === account.customerId);

            return (
              <div key={account.email} className="rounded-xl border border-line bg-soft p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-ink">{account.email}</p>
                    <p className="mt-1 text-sm text-muted">{account.label}</p>
                  </div>
                  <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-muted">{customer?.name || account.customerId}</span>
                </div>
                <p className="mt-3 text-xs text-muted">更新：{account.updatedAt.slice(0, 16).replace('T', ' ')}</p>
              </div>
            );
          })}
          {customerAccounts.length === 0 && <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">还没有额外客户账号。默认演示账号仍然可用。</div>}
        </div>
      </section>

      <BackupPanel initialStatus={backupStatus} />
    </Shell>
  );
}
