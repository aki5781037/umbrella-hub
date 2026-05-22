import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { extname, join, relative, resolve, sep } from 'path';

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const defaultRoot = 'E:\\画报看板';

export type UmbrellaCatalogImage = {
  name: string;
  path: string;
};

export type UmbrellaCatalogGroup = {
  title: string;
  path: string;
  count: number;
  main: string;
  images: UmbrellaCatalogImage[];
};

type CatalogConfig = {
  mainOverrides?: Record<string, string>;
  excludedFolders?: string[];
};

function normalizePath(value: string) {
  return value.replace(/\\/g, '/');
}

export function getUmbrellaCatalogRoot() {
  return process.env.UMBRELLA_CATALOG_ROOT || defaultRoot;
}

function readCatalogConfig(root: string): CatalogConfig {
  try {
    const jsonFile = readdirSync(root, { withFileTypes: true }).find((item) => item.isFile() && item.name.toLowerCase().endsWith('.json'));

    if (!jsonFile) {
      return {};
    }

    return JSON.parse(readFileSync(join(root, jsonFile.name), 'utf8')) as CatalogConfig;
  } catch {
    return {};
  }
}

function isInsideRoot(root: string, target: string) {
  const rootPath = resolve(root);
  const targetPath = resolve(target);
  return targetPath === rootPath || targetPath.startsWith(rootPath + sep);
}

export function resolveUmbrellaImagePath(relativePath: string) {
  const root = getUmbrellaCatalogRoot();
  const target = resolve(root, relativePath);

  if (!isInsideRoot(root, target)) {
    return undefined;
  }

  if (!existsSync(target) || !statSync(target).isFile()) {
    return undefined;
  }

  const ext = extname(target).toLowerCase();
  if (!imageExtensions.has(ext)) {
    return undefined;
  }

  return target;
}

export function getUmbrellaCatalog() {
  const root = getUmbrellaCatalogRoot();

  if (!existsSync(root)) {
    return { root, exists: false, groups: [] as UmbrellaCatalogGroup[], imageCount: 0 };
  }

  const config = readCatalogConfig(root);
  const excludedFolders = new Set((config.excludedFolders || []).map(normalizePath));
  const files: string[] = [];

  function walk(current: string) {
    const relativeFolder = normalizePath(relative(root, current));

    if (relativeFolder && excludedFolders.has(relativeFolder)) {
      return;
    }

    for (const item of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, item.name);

      if (item.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (item.isFile() && imageExtensions.has(extname(item.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  walk(root);

  const grouped = new Map<string, string[]>();
  for (const file of files) {
    const folder = resolve(file, '..');
    const current = grouped.get(folder) || [];
    current.push(file);
    grouped.set(folder, current);
  }

  const groups = Array.from(grouped.entries())
    .map(([folder, items]) => {
      const sortedItems = items.sort((first, second) => first.localeCompare(second, 'zh-CN'));
      const relativeFolder = normalizePath(relative(root, folder)) || '.';
      const override = config.mainOverrides?.[relativeFolder];
      const overrideFullPath = override ? resolve(root, override) : undefined;
      const mainPath = overrideFullPath && existsSync(overrideFullPath) ? overrideFullPath : sortedItems[0];

      return {
        title: folder.split(/[\\/]/).pop() || relativeFolder,
        path: relativeFolder,
        count: sortedItems.length,
        main: normalizePath(relative(root, mainPath)),
        images: sortedItems.map((item) => ({
          name: item.split(/[\\/]/).pop() || item,
          path: normalizePath(relative(root, item))
        }))
      };
    })
    .sort((first, second) => first.path.localeCompare(second.path, 'zh-CN'));

  return { root, exists: true, groups, imageCount: files.length };
}
