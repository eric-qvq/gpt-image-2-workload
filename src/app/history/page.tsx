import { ImageGrid } from "../../components/assets/ImageGrid";

const assets = [
  {
    id: "asset_1",
    src: "/placeholder-image.png",
    prompt: "Draw a red cube",
    model: "gpt-image-2",
    createdAt: "2026-04-27"
  }
];

export default function HistoryPage() {
  return (
    <main>
      <h1>History</h1>
      <form>
        <label>
          Filter
          <input name="query" placeholder="Prompt, model, or date" />
        </label>
        <button type="submit">Apply</button>
      </form>
      <ImageGrid assets={assets} />
    </main>
  );
}
