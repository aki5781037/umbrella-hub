import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export type BackupKind = 'manual' | 'auto' | 'pre-restore';

export type BackupConfig = {
  enabled: boolean;
  intervalHours: number;
  maxBackups: number;
  lastAutoBackupAt?: string;
};

type BackupFile = {
  path: string;
  exists: boolean;
  size: number;
  sha256?: string;
  encoding?: 'utf8' | 'base64';
  content?: string;
};

type BackupSnapshot = {
  version: 1;
  id: string;
  kind: BackupKind;
  createdAt: string;
  files: BackupFile[];
};

const dataDir = join(process.cwd(), 'data');
const backupsDir = join(dataDir, 'backups');
const configPath = join(dataDir, 'backup-config.json');
const backupFileTargets = ['crm-records.json', 'portal-submissions.json', 'emails.json', 'mail-config.json', 'production-records.json', 'customer-accounts.json'];
const backupDirectoryTargets = ['project-attachments', 'production-attachments'];
const defaultConfig: BackupConfig = {
  enabled: true,
  intervalHours: 24,
  maxBackups: 30
};

let autoBackupInProgress = false;

function ensureDataDirs() {
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(backupsDir, { recursive: true });
}

function nowText() {
  return new Date().toISOString();
}

function compactTimestamp(value: string) {
  return value.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z').replace('T', '-').replace('Z', '');
}

function hashText(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function hashBuffer(value: Buffer) {
  return createHash('sha256').update(value).digest('hex');
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function backupPathForId(id: string) {
  if (!/^backup-\d{8}-\d{6}-(manual|auto|pre-restore)(-[a-z0-9]{4,8})?$/.test(id)) {
    throw new Error('Invalid backup id.');
  }

  return join(backupsDir, `${id}.json`);
}

function readSnapshot(id: string) {
  const snapshot = JSON.parse(readFileSync(backupPathForId(id), 'utf8')) as BackupSnapshot;
  if (snapshot.version !== 1 || snapshot.id !== id) {
    throw new Error('Backup file is not valid.');
  }

  return snapshot;
}

export function getBackupDownload(id: string) {
  const snapshot = readSnapshot(id);
  const content = readFileSync(backupPathForId(id), 'utf8');

  return {
    id: snapshot.id,
    fileName: `${snapshot.id}.json`,
    content
  };
}

export function getBackupConfig(): BackupConfig {
  ensureDataDirs();

  if (!existsSync(configPath)) {
    return defaultConfig;
  }

  try {
    const stored = JSON.parse(readFileSync(configPath, 'utf8')) as Partial<BackupConfig>;
    return {
      enabled: stored.enabled !== false,
      intervalHours: clampNumber(stored.intervalHours, defaultConfig.intervalHours, 1, 720),
      maxBackups: clampNumber(stored.maxBackups, defaultConfig.maxBackups, 5, 200),
      lastAutoBackupAt: stored.lastAutoBackupAt
    };
  } catch {
    return defaultConfig;
  }
}

export function saveBackupConfig(input: Partial<BackupConfig>) {
  ensureDataDirs();
  const current = getBackupConfig();
  const nextConfig: BackupConfig = {
    enabled: input.enabled ?? current.enabled,
    intervalHours: clampNumber(input.intervalHours, current.intervalHours, 1, 720),
    maxBackups: clampNumber(input.maxBackups, current.maxBackups, 5, 200),
    lastAutoBackupAt: input.lastAutoBackupAt ?? current.lastAutoBackupAt
  };

  writeFileSync(configPath, JSON.stringify(nextConfig, null, 2), 'utf8');
  return nextConfig;
}

export function listBackups() {
  ensureDataDirs();

  return readdirSync(backupsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const id = file.replace(/\.json$/, '');

      try {
        const snapshot = readSnapshot(id);
        const totalBytes = snapshot.files.reduce((total, item) => total + item.size, 0);
        return {
          id: snapshot.id,
          kind: snapshot.kind,
          createdAt: snapshot.createdAt,
          fileCount: snapshot.files.filter((item) => item.exists).length,
          totalBytes
        };
      } catch {
        return undefined;
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export function getBackupTargets() {
  ensureDataDirs();

  const fileTargets = backupFileTargets.map((fileName) => {
    const fullPath = join(dataDir, fileName);

    if (!existsSync(fullPath)) {
      return { path: fileName, exists: false, size: 0 };
    }

    const content = readFileSync(fullPath, 'utf8');
    return {
      path: fileName,
      exists: true,
      size: Buffer.byteLength(content, 'utf8'),
      sha256: hashText(content)
    };
  });

  const directoryTargets = backupDirectoryTargets.map((directoryName) => {
    const fullPath = join(dataDir, directoryName);
    return {
      path: directoryName,
      exists: existsSync(fullPath),
      size: collectDirectoryBackupFiles(directoryName).reduce((total, file) => total + file.size, 0)
    };
  });

  return [...fileTargets, ...directoryTargets];
}

function pruneBackups(maxBackups: number) {
  const removable = listBackups().slice(maxBackups);

  removable.forEach((backup) => {
    try {
      unlinkSync(backupPathForId(backup.id));
    } catch {
      // Ignore stale backup cleanup failures; they should not block the new backup.
    }
  });
}

export function createBackup(kind: BackupKind) {
  ensureDataDirs();

  const createdAt = nowText();
  const id = `backup-${compactTimestamp(createdAt)}-${kind}-${Math.random().toString(36).slice(2, 6)}`;
  const snapshot: BackupSnapshot = {
    version: 1,
    id,
    kind,
    createdAt,
    files: collectBackupFiles()
  };

  writeFileSync(backupPathForId(id), JSON.stringify(snapshot, null, 2), 'utf8');
  pruneBackups(getBackupConfig().maxBackups);
  return listBackups().find((backup) => backup.id === id);
}

export function restoreBackup(id: string) {
  ensureDataDirs();
  const snapshot = readSnapshot(id);
  const preRestoreBackup = createBackup('pre-restore');

  clearManagedBackupDirectories();

  snapshot.files.forEach((file) => {
    if (!isSupportedBackupPath(file.path)) {
      throw new Error(`Backup contains unsupported file: ${file.path}`);
    }

    const fullPath = backupDataPath(file.path);

    if (!file.exists) {
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
      }
      return;
    }

    mkdirSync(dirname(fullPath), { recursive: true });
    if (file.encoding === 'base64') {
      writeFileSync(fullPath, Buffer.from(file.content ?? '', 'base64'));
    } else {
      writeFileSync(fullPath, file.content ?? '', 'utf8');
    }
  });

  return {
    restoredBackup: {
      id: snapshot.id,
      kind: snapshot.kind,
      createdAt: snapshot.createdAt
    },
    preRestoreBackup
  };
}

function clearManagedBackupDirectories() {
  backupDirectoryTargets.forEach((directoryName) => {
    const fullPath = backupDataPath(directoryName);
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true });
    }
  });
}

function backupDataPath(relativePath: string) {
  if (relativePath.includes('..') || relativePath.startsWith('/') || relativePath.startsWith('\\')) {
    throw new Error(`Unsafe backup path: ${relativePath}`);
  }

  return join(dataDir, ...relativePath.split('/'));
}

function isSupportedBackupPath(relativePath: string) {
  return backupFileTargets.includes(relativePath) || backupDirectoryTargets.some((directoryName) => relativePath.startsWith(`${directoryName}/`));
}

function collectDirectoryBackupFiles(directoryName: string): BackupFile[] {
  const directoryPath = backupDataPath(directoryName);

  if (!existsSync(directoryPath)) {
    return [];
  }

  return readdirSync(directoryPath, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = `${directoryName}/${entry.name}`;
    const fullPath = backupDataPath(relativePath);

    if (entry.isDirectory()) {
      return collectDirectoryBackupFiles(relativePath);
    }

    if (!entry.isFile()) {
      return [];
    }

    const content = readFileSync(fullPath);
    return [{
      path: relativePath,
      exists: true,
      size: content.length,
      sha256: hashBuffer(content),
      encoding: 'base64' as const,
      content: content.toString('base64')
    }];
  });
}

function collectBackupFiles(): BackupFile[] {
  const files = backupFileTargets.map((fileName) => {
    const fullPath = backupDataPath(fileName);

    if (!existsSync(fullPath)) {
      return {
        path: fileName,
        exists: false,
        size: 0
      };
    }

    const content = readFileSync(fullPath, 'utf8');
    return {
      path: fileName,
      exists: true,
      size: Buffer.byteLength(content, 'utf8'),
      sha256: hashText(content),
      encoding: 'utf8' as const,
      content
    };
  });

  return [...files, ...backupDirectoryTargets.flatMap((directoryName) => collectDirectoryBackupFiles(directoryName))];
}

export async function runDueAutoBackup() {
  if (autoBackupInProgress) {
    return undefined;
  }

  const config = getBackupConfig();
  if (!config.enabled) {
    return undefined;
  }

  const lastAutoBackupAt = config.lastAutoBackupAt ? Date.parse(config.lastAutoBackupAt) : 0;
  const intervalMs = config.intervalHours * 60 * 60 * 1000;

  if (lastAutoBackupAt && Date.now() - lastAutoBackupAt < intervalMs) {
    return undefined;
  }

  autoBackupInProgress = true;
  try {
    const backup = createBackup('auto');
    saveBackupConfig({ ...config, lastAutoBackupAt: nowText() });
    return backup;
  } finally {
    autoBackupInProgress = false;
  }
}

export function getBackupStatus() {
  const config = getBackupConfig();
  const lastAutoMs = config.lastAutoBackupAt ? Date.parse(config.lastAutoBackupAt) : 0;
  const nextAutoBackupAt = config.enabled
    ? lastAutoMs
      ? new Date(lastAutoMs + config.intervalHours * 60 * 60 * 1000).toISOString()
      : 'due-now'
    : undefined;

  return {
    config,
    nextAutoBackupAt,
    backups: listBackups(),
    targets: getBackupTargets()
  };
}

export function ensureBackupSchedulerStarted() {
  const globalStore = globalThis as typeof globalThis & {
    __umbrellaBackupScheduler?: NodeJS.Timeout;
  };

  if (globalStore.__umbrellaBackupScheduler) {
    return;
  }

  globalStore.__umbrellaBackupScheduler = setInterval(() => {
    runDueAutoBackup().catch((error) => {
      console.error('Auto backup failed', error);
    });
  }, 60 * 1000);

  globalStore.__umbrellaBackupScheduler.unref?.();
  runDueAutoBackup().catch((error) => {
    console.error('Initial auto backup check failed', error);
  });
}
