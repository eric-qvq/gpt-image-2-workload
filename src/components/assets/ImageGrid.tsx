type ImageGridAsset = {
  id: string;
  src: string;
  prompt: string;
  providerId: string;
  modelId: string;
  model: string;
  createdAt: string;
  requestParams: Record<string, string | number | boolean>;
};

type ImageGridProps = {
  assets: ImageGridAsset[];
};

export function ImageGrid({ assets }: ImageGridProps) {
  function reuseHref(asset: ImageGridAsset): string {
    const params = new URLSearchParams({
      prompt: asset.prompt,
      providerId: asset.providerId,
      modelId: asset.modelId,
      model: asset.model
    });

    for (const [key, value] of Object.entries(asset.requestParams)) {
      params.set(key, String(value));
    }

    return `/generate?${params.toString()}`;
  }

  return (
    <section aria-label="Image history">
      {assets.map((asset) => (
        <article key={asset.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.src} alt={asset.prompt} />
          <h3>{asset.model}</h3>
          <p>{asset.prompt}</p>
          <time dateTime={asset.createdAt}>{asset.createdAt}</time>
          <a href={asset.src} download>
            Download
          </a>
          <a href={reuseHref(asset)}>Reuse</a>
        </article>
      ))}
    </section>
  );
}
