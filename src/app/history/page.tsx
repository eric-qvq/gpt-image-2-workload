import React from "react";

import { ImageGrid } from "../../components/assets/ImageGrid";
import { HistoryToolbar } from "../../components/history/HistoryToolbar";
import { LocalizedPageHeading } from "../../components/i18n/LocalizedPageHeading";
import {
  AuthenticatedAppShell,
  getAuthenticatedShellContext
} from "../../components/layout/AuthenticatedAppShell";
import { requireMemberPageSession } from "../../server/auth/page-session";
import {
  countHistoryAssets,
  listHistoryAssets
} from "../../server/history/assets";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type HistoryPageProps = {
  searchParams?: Promise<{ query?: string; page?: string }>;
};

type HistoryAsset = Awaited<ReturnType<typeof listHistoryAssets>>[number];

function readPage(value: string | undefined): number {
  const page = Math.trunc(Number(value ?? 1));

  return Number.isFinite(page) && page > 0 ? page : 1;
}

function pageHref(page: number, query: string): string {
  const params = new URLSearchParams();

  if (query) params.set("query", query);
  if (page > 1) params.set("page", String(page));

  return `/history${params.size ? `?${params}` : ""}`;
}

function filterAssets(assets: HistoryAsset[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return assets;

  return assets.filter((asset) =>
    [asset.prompt, asset.model, asset.createdAt]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await requireMemberPageSession();
  const params = searchParams ? await searchParams : {};
  const query = params.query ?? "";
  const page = readPage(params.page);
  const offset = (page - 1) * PAGE_SIZE;
  const [assets, total] = await Promise.all([
    listHistoryAssets(session, { limit: PAGE_SIZE, offset }),
    countHistoryAssets(session)
  ]).catch(() => [[], 0] as [HistoryAsset[], number]);
  const filteredAssets = filterAssets(assets, query);
  const hasPrevious = page > 1;
  const hasNext = offset + PAGE_SIZE < total;
  const shellContext = await getAuthenticatedShellContext({ session });

  return (
    <AuthenticatedAppShell context={shellContext}>
      <LocalizedPageHeading
        id="history-title"
        copy={{
          en: {
            eyebrow: "Archive",
            title: "History",
            description: "Search generated images and reuse prior prompts."
          },
          zh: {
            eyebrow: "归档",
            title: "历史记录",
            description: "搜索已生成的图片，并复用以前的提示词。"
          }
        }}
      />
      <HistoryToolbar
        query={query}
        page={page}
        visibleCount={filteredAssets.length}
        total={total}
        previousHref={hasPrevious ? pageHref(page - 1, query) : undefined}
        nextHref={hasNext ? pageHref(page + 1, query) : undefined}
      />
      <ImageGrid assets={filteredAssets} />
    </AuthenticatedAppShell>
  );
}
