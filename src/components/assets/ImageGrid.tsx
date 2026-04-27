type ImageGridAsset = {
  id: string;
  src: string;
  prompt: string;
  model: string;
  createdAt: string;
};

type ImageGridProps = {
  assets: ImageGridAsset[];
};

export function ImageGrid({ assets }: ImageGridProps) {
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
          <a href={`/generate?prompt=${encodeURIComponent(asset.prompt)}`}>
            Reuse
          </a>
        </article>
      ))}
    </section>
  );
}
