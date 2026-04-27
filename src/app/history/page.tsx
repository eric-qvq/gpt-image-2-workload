import { ImageGrid } from "../../components/assets/ImageGrid";

const assets = [
  {
    id: "asset_1",
    src: "/placeholder-image.png",
    prompt: "Draw a red cube",
    providerId: "provider_1",
    modelId: "model_1",
    model: "gpt-image-2",
    createdAt: "2026-04-27",
    requestParams: {
      size: "1024x1024",
      count: 1,
      quality: "standard"
    }
  }
];

type HistoryPageProps = {
  searchParams?: Promise<{ query?: string }> | { query?: string };
};

function filterAssets(query: string) {
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
  const params = searchParams ? await searchParams : {};
  const query = params.query ?? "";
  const filteredAssets = filterAssets(query);

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
