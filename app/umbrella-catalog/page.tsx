'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shell } from '@/components/Shell';

type CatalogImage = {
  name: string;
  path: string;
};

type CatalogGroup = {
  title: string;
  path: string;
  count: number;
  main: string;
  images: CatalogImage[];
};

type CatalogResponse = {
  root: string;
  exists: boolean;
  groups: CatalogGroup[];
  imageCount: number;
};

function imageUrl(path: string) {
  return `/api/umbrella-image?path=${encodeURIComponent(path)}`;
}

function matchesKeyword(group: CatalogGroup, keyword: string) {
  if (!keyword) {
    return true;
  }

  const words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  const text = [group.title, group.path, ...group.images.map((image) => image.name)].join(' ').toLowerCase();
  return words.every((word) => text.includes(word));
}

export default function UmbrellaCatalogPage() {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [keyword, setKeyword] = useState('');
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/umbrella-catalog')
      .then((response) => response.json())
      .then((data) => setCatalog(data))
      .catch((err) => setError(err.message || '读取伞款图库失败。'));
  }, []);

  const filteredGroups = useMemo(() => {
    return (catalog?.groups || []).filter((group) => matchesKeyword(group, keyword));
  }, [catalog, keyword]);

  return (
    <Shell active="伞款图库">
      <section className="rounded-2xl border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-xl font-bold text-ink">伞款图片索引</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              本地读取画报看板图片目录，用于业务快速检索伞款、找主图和查看同组细节图。图片不复制到驾驶舱仓库。
            </p>
          </div>
          <div className="grid gap-2 text-sm text-muted sm:grid-cols-3 xl:min-w-[520px]">
            <div className="rounded-xl bg-soft px-4 py-3">目录：{catalog?.exists ? catalog.root : '未连接'}</div>
            <div className="rounded-xl bg-soft px-4 py-3">伞款组：{catalog?.groups.length || 0}</div>
            <div className="rounded-xl bg-soft px-4 py-3">图片：{catalog?.imageCount || 0}</div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索伞款、年份、文件夹、图片名，例如 8057 / POE / 2025"
            className="min-h-12 flex-1 rounded-xl border border-line bg-white px-4 text-sm outline-none focus:border-brand"
          />
          <button onClick={() => setKeyword('')} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted hover:bg-soft">
            清空
          </button>
        </div>

        {error ? <div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div> : null}
        {catalog && !catalog.exists ? <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">没有找到本地目录：{catalog.root}</div> : null}
      </section>

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {filteredGroups.map((group) => (
          <article key={group.path} className="overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
            <img src={imageUrl(group.main)} alt={group.title} loading="lazy" className="aspect-square w-full bg-soft object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="line-clamp-2 font-bold text-ink">{group.title}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{group.path}</p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{group.count} 张</span>
              </div>
              <button
                onClick={() => setOpened((current) => ({ ...current, [group.path]: !current[group.path] }))}
                className="mt-4 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
              >
                {opened[group.path] ? '收起细节图' : '展开细节图'}
              </button>
            </div>
            {opened[group.path] ? (
              <div className="grid max-h-[420px] grid-cols-3 gap-2 overflow-y-auto border-t border-line bg-soft p-3">
                {group.images.map((image) => (
                  <a key={image.path} href={imageUrl(image.path)} target="_blank" className="block" rel="noreferrer">
                    <img src={imageUrl(image.path)} alt={image.name} loading="lazy" className="aspect-square rounded-lg bg-white object-cover" />
                    <span className="mt-1 block truncate text-[11px] text-muted">{image.name}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>

      {catalog && filteredGroups.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">没有找到匹配的伞款图片。</div>
      ) : null}
    </Shell>
  );
}
