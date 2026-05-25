'use client';

import { useMemo, useState } from 'react';

type BackupConfig = {
  enabled: boolean;
  intervalHours: number;
  maxBackups: number;
  lastAutoBackupAt?: string;
};

type BackupItem = {
  id: string;
  kind: 'manual' | 'auto' | 'pre-restore';
  createdAt: string;
  fileCount: number;
  totalBytes: number;
};

type BackupTarget = {
  path: string;
  exists: boolean;
  size: number;
  sha256?: string;
};

type BackupStatus = {
  config: BackupConfig;
  nextAutoBackupAt?: string;
  backups: BackupItem[];
  targets: BackupTarget[];
};

const kindLabels: Record<BackupItem['kind'], string> = {
  manual: '手动备份',
  auto: '自动备份',
  'pre-restore': '恢复前备份'
};

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value?: string) {
  if (!value) return '暂无';
  if (value === 'due-now') return '即将执行';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

export function BackupPanel({ initialStatus }: { initialStatus: BackupStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [enabled, setEnabled] = useState(initialStatus.config.enabled);
  const [intervalHours, setIntervalHours] = useState(String(initialStatus.config.intervalHours));
  const [maxBackups, setMaxBackups] = useState(String(initialStatus.config.maxBackups));
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState('');

  const lastBackup = status.backups[0];
  const backupSummary = useMemo(() => {
    const totalBytes = status.backups.reduce((total, item) => total + item.totalBytes, 0);
    return {
      total: status.backups.length,
      totalBytes
    };
  }, [status.backups]);

  async function requestJson(url: string, body?: Record<string, unknown>) {
    const response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败。');
    }

    return data;
  }

  async function refreshStatus() {
    const nextStatus = await requestJson('/api/backups');
    setStatus(nextStatus);
    setEnabled(nextStatus.config.enabled);
    setIntervalHours(String(nextStatus.config.intervalHours));
    setMaxBackups(String(nextStatus.config.maxBackups));
  }

  async function saveConfig() {
    setBusyAction('config');
    setNotice('');
    setError('');

    try {
      const data = await requestJson('/api/backups/config', {
        enabled,
        intervalHours: Number(intervalHours),
        maxBackups: Number(maxBackups)
      });
      setStatus(data.status);
      setNotice('备份设置已保存。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存设置失败。');
    } finally {
      setBusyAction('');
    }
  }

  async function createManualBackup() {
    setBusyAction('manual');
    setNotice('');
    setError('');

    try {
      const data = await requestJson('/api/backups', { action: 'create' });
      setStatus(data.status);
      setNotice('手动备份已完成。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '手动备份失败。');
    } finally {
      setBusyAction('');
    }
  }

  async function restoreSelectedBackup(backup: BackupItem) {
    const confirmed = window.confirm(`确认恢复 ${kindLabels[backup.kind]} ${formatDate(backup.createdAt)}？恢复会覆盖当前数据，系统会先自动生成一份恢复前备份。`);
    if (!confirmed) return;

    setBusyAction(backup.id);
    setNotice('');
    setError('');

    try {
      const data = await requestJson('/api/backups', { action: 'restore', backupId: backup.id });
      setStatus(data.status);
      setNotice(`已恢复备份，恢复前备份为 ${data.preRestoreBackup?.id || '已生成'}。`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '恢复备份失败。');
    } finally {
      setBusyAction('');
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
          <p className="text-sm text-muted">最近备份</p>
          <p className="mt-3 text-lg font-bold text-ink">{lastBackup ? formatDate(lastBackup.createdAt) : '暂无备份'}</p>
          <p className="mt-1 text-sm text-muted">{lastBackup ? kindLabels[lastBackup.kind] : '建议先做一次手动备份'}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
          <p className="text-sm text-muted">下次自动备份</p>
          <p className="mt-3 text-lg font-bold text-ink">{status.config.enabled ? formatDate(status.nextAutoBackupAt) : '已关闭'}</p>
          <p className="mt-1 text-sm text-muted">每 {status.config.intervalHours} 小时检查一次</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
          <p className="text-sm text-muted">备份数量</p>
          <p className="mt-3 text-3xl font-bold text-brand">{backupSummary.total}</p>
          <p className="mt-1 text-sm text-muted">保留上限 {status.config.maxBackups} 份</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
          <p className="text-sm text-muted">备份体积</p>
          <p className="mt-3 text-3xl font-bold text-ink">{formatBytes(backupSummary.totalBytes)}</p>
          <p className="mt-1 text-sm text-muted">存放在服务器 data/backups</p>
        </div>
      </section>

      {notice ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div> : null}

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 rounded-2xl border border-line bg-white p-6 shadow-panel">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">备份策略</h3>
              <p className="mt-1 text-sm text-muted">备份客户、项目、门户提交、邮件和邮箱配置 JSON 数据。</p>
            </div>
            <button onClick={refreshStatus} className="w-fit rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted hover:bg-soft">
              刷新状态
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-soft p-4">
              <span>
                <span className="block font-semibold text-ink">启用自动备份</span>
                <span className="mt-1 block text-sm text-muted">服务运行时按间隔自动生成备份。</span>
              </span>
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="h-7 w-7 shrink-0 accent-blue-600" />
            </label>

            <label className="block text-sm font-semibold text-ink">
              自动备份间隔（小时）
              <input
                type="number"
                min="1"
                max="720"
                value={intervalHours}
                onChange={(event) => setIntervalHours(event.target.value)}
                className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"
              />
            </label>

            <label className="block text-sm font-semibold text-ink">
              最多保留备份数
              <input
                type="number"
                min="5"
                max="200"
                value={maxBackups}
                onChange={(event) => setMaxBackups(event.target.value)}
                className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveConfig}
                disabled={busyAction === 'config'}
                className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busyAction === 'config' ? '保存中...' : '保存设置'}
              </button>
              <button
                onClick={createManualBackup}
                disabled={busyAction === 'manual'}
                className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 disabled:opacity-60"
              >
                {busyAction === 'manual' ? '备份中...' : '立即手动备份'}
              </button>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-line bg-white p-6 shadow-panel">
          <h3 className="text-lg font-bold text-ink">当前保护的数据</h3>
          <p className="mt-1 text-sm text-muted">恢复备份会回写这些文件；恢复前会自动保存当前版本。</p>
          <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2">
            {status.targets.map((target) => (
              <div key={target.path} className="min-w-0 rounded-xl border border-line bg-soft p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <p className="min-w-0 break-all font-semibold text-ink">{target.path}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${target.exists ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {target.exists ? '已纳入' : '暂不存在'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{formatBytes(target.size)}</p>
                {target.sha256 ? <p className="mt-2 min-w-0 truncate text-xs text-muted">SHA256 {target.sha256}</p> : null}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            如果已配置真实邮箱，备份会包含邮箱配置文件。备份只保存在服务器持久卷内，不会上传到第三方。
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">备份记录</h3>
            <p className="mt-1 text-sm text-muted">可从任意备份恢复；恢复动作会先创建恢复前备份。</p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">{status.backups.length} 份</span>
        </div>

        <div className="mt-5 space-y-3">
          {status.backups.length > 0 ? status.backups.map((backup) => (
            <article key={backup.id} className="rounded-2xl border border-line p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink">{formatDate(backup.createdAt)}</p>
                    <span className="rounded-full bg-soft px-3 py-1 text-sm font-semibold text-muted">{kindLabels[backup.kind]}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{backup.id}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted">{backup.fileCount} 个文件 · {formatBytes(backup.totalBytes)}</span>
                  <a
                    href={`/api/backups/${backup.id}`}
                    className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-muted hover:bg-soft hover:text-ink"
                  >
                    下载备份
                  </a>
                  <button
                    onClick={() => restoreSelectedBackup(backup)}
                    disabled={Boolean(busyAction)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60"
                  >
                    {busyAction === backup.id ? '恢复中...' : '恢复此备份'}
                  </button>
                </div>
              </div>
            </article>
          )) : (
            <div className="rounded-xl border border-dashed border-line p-6 text-sm text-muted">暂无备份。建议先点击“立即手动备份”。</div>
          )}
        </div>
      </section>
    </div>
  );
}
