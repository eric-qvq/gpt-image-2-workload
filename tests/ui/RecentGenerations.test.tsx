// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, expect, it } from "vitest";

import { RecentGenerations } from "../../src/components/generate/RecentGenerations";

const assets = Array.from({ length: 7 }, (_, index) => ({
  id: `asset_${index + 1}`,
  src: `/api/image-assets/asset_${index + 1}`,
  prompt: `Real generation prompt ${index + 1}`,
  providerId: "provider_1",
  modelId: "model_1",
  model: "gpt-image-2",
  createdAt: `2026-07-${String(12 - index).padStart(2, "0")}T01:02:03.000Z`,
  requestParams: { quality: "high" }
}));

describe("RecentGenerations", () => {
  it("renders the first six real assets in order with prompt-based alt text", () => {
    render(<RecentGenerations assets={assets} />);

    const section = screen.getByRole("region", {
      name: "Recent Generations"
    });
    const images = screen.getAllByRole("img");

    expect(section).toHaveClass("recent-generations");
    expect(images).toHaveLength(6);
    expect(images.map((image) => image.getAttribute("src"))).toEqual(
      assets.slice(0, 6).map((asset) => asset.src)
    );
    expect(images.map((image) => image.getAttribute("alt"))).toEqual(
      assets.slice(0, 6).map((asset) => asset.prompt)
    );
    expect(images.every((image) => image.getAttribute("loading") === "lazy"))
      .toBe(true);
    expect(images.every((image) => image.getAttribute("decoding") === "async"))
      .toBe(true);
    expect(
      screen.queryByRole("img", { name: assets[6].prompt })
    ).not.toBeInTheDocument();
  });

  it("offers only the real history navigation action", () => {
    render(<RecentGenerations assets={assets.slice(0, 1)} />);

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("View All");
    expect(links[0]).toHaveAttribute("href", "/history");
    expect(screen.queryByRole("link", { name: /reuse/i })).not.toBeInTheDocument();
  });

  it("keeps history navigation beside a clear empty state", () => {
    render(<RecentGenerations assets={[]} />);

    expect(screen.getByText("No generated images yet.")).toBeInTheDocument();
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "View All" })).toHaveAttribute(
      "href",
      "/history"
    );
  });
});
