import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ImageGrid } from "../../components/assets/ImageGrid";
import { requireMember } from "../../server/auth/guards";
import { getSessionFromToken } from "../../server/auth/request-session";
import { listHistoryAssets } from "../../server/history/assets";

export const dynamic = "force-dynamic";

type HistoryPageProps = {
  searchParams?: Promise<{ query?: string }>;
};

type HistoryAsset = Awaited<ReturnType<typeof listHistoryAssets>>[number];

async function requireMemberPageSession() {
  const cookieStore = await cookies();
  const session = await getSessionFromToken(cookieStore.get("session")?.value);

  try {
    return requireMember(session);
  } catch {
    redirect("/login");
  }
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
  const assets = await listHistoryAssets(session).catch(() => []);
  const filteredAssets = filterAssets(assets, query);

  return (
    <main>
      <h1>History</h1>
      <form method="get">
        <label>
          Filter
          <input
            name="query"
            placeholder="Prompt, model, or date"
            defaultValue={query}
          />
        </label>
        <button type="submit">Apply</button>
      </form>
      <ImageGrid assets={filteredAssets} />
    </main>
  );
}
