// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { ImageGrid } from "../../src/components/assets/ImageGrid";
import { ShellStateProvider } from "../../src/components/layout/ShellState";

vi.stubGlobal("React", React);

const assets = [
  {
    id: "asset_copper",
    src: "/api/image-assets/asset_copper",
    prompt: "Copper & glass at dawn / close-up?",
    providerId: "provider alpha",
    modelId: "model/image-2",
    model: "gpt-image-2",
    createdAt: "2026-07-12T01:02:03.000Z",
    requestParams: {
      size: "1536x1024",
      quality: "high",
      count: 3,
      responseFormat: "url",
      transparentBackground: false
    }
  },
  {
    id: "asset_ocean",
    src: "/api/image-assets/asset_ocean",
    prompt: "A teal ocean at dusk",
    providerId: "provider_2",
    modelId: "model_2",
    model: "image-beta",
    createdAt: "2026-07-11T01:02:03.000Z",
    requestParams: {
      size: "1024x1536",
      quality: "standard",
      count: 1,
      responseFormat: "b64_json",
      transparentBackground: true
    }
  }
];

const assetWithConflictingRequestParams = {
  ...assets[0],
  id: "asset_conflicting",
  requestParams: {
    ...assets[0].requestParams,
    prompt: "Injected prompt",
    providerId: "injected_provider",
    modelId: "injected_model_id",
    model: "injected_model"
  }
};

function renderGrid(gridAssets: typeof assets) {
  return render(
    <ShellStateProvider initialModelName="Not connected">
      <ImageGrid assets={gridAssets} />
    </ShellStateProvider>
  );
}

describe("ImageGrid", () => {
  it("renders a clear empty state without images or a lightbox", () => {
    renderGrid([]);

    expect(screen.getByText("No generated images yet.")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Image preview" })
    ).not.toBeInTheDocument();
  });

  it("opens the selected real asset with its prompt, model, and request parameters", () => {
    renderGrid(assets);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Preview image generated with image-beta"
      })
    );

    const dialog = screen.getByRole("dialog", { name: "Image preview" });
    const preview = within(dialog);

    expect(
      preview.getByRole("img", { name: "A teal ocean at dusk" })
    ).toHaveAttribute("src", "/api/image-assets/asset_ocean");
    expect(preview.getByText("A teal ocean at dusk")).toBeInTheDocument();
    expect(
      preview.getByRole("heading", { name: "image-beta" })
    ).toBeInTheDocument();
    expect(preview.getByText("size: 1024x1536")).toBeInTheDocument();
    expect(preview.getByText("quality: standard")).toBeInTheDocument();
    expect(preview.getByText("count: 1")).toBeInTheDocument();
    expect(preview.getByText("responseFormat: b64_json")).toBeInTheDocument();
    expect(preview.getByText("transparentBackground: true")).toBeInTheDocument();
  });

  it("keeps the preview open for card clicks and closes it from the backdrop", () => {
    renderGrid(assets.slice(0, 1));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Preview image generated with gpt-image-2"
      })
    );

    const dialog = screen.getByRole("dialog", { name: "Image preview" });
    const card = dialog.querySelector(".image-lightbox-card");

    expect(card).toBeInTheDocument();
    fireEvent.click(card as HTMLElement);
    expect(
      screen.getByRole("dialog", { name: "Image preview" })
    ).toBeInTheDocument();

    fireEvent.click(dialog);
    expect(
      screen.queryByRole("dialog", { name: "Image preview" })
    ).not.toBeInTheDocument();
  });

  it("closes from an accessible button and from the Escape key", () => {
    renderGrid(assets.slice(0, 1));
    const openPreview = screen.getByRole("button", {
      name: "Preview image generated with gpt-image-2"
    });

    fireEvent.click(openPreview);
    fireEvent.click(
      within(
        screen.getByRole("dialog", { name: "Image preview" })
      ).getByRole("button", { name: "Close image preview" })
    );
    expect(
      screen.queryByRole("dialog", { name: "Image preview" })
    ).not.toBeInTheDocument();

    fireEvent.click(openPreview);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Image preview" })
    ).not.toBeInTheDocument();
  });

  it("registers keydown only while open and removes the same handler", () => {
    const addEventListener = vi.spyOn(document, "addEventListener");
    const removeEventListener = vi.spyOn(document, "removeEventListener");

    try {
      const { unmount } = renderGrid(assets.slice(0, 1));
      const keydownAdds = () =>
        addEventListener.mock.calls.filter(([type]) => type === "keydown");
      const keydownRemovals = () =>
        removeEventListener.mock.calls.filter(([type]) => type === "keydown");
      const openPreview = screen.getByRole("button", {
        name: "Preview image generated with gpt-image-2"
      });

      expect(keydownAdds()).toHaveLength(0);

      fireEvent.click(openPreview);
      expect(keydownAdds()).toHaveLength(1);
      const firstHandler = keydownAdds()[0][1];

      fireEvent.click(
        within(
          screen.getByRole("dialog", { name: "Image preview" })
        ).getByRole("button", { name: "Close image preview" })
      );
      expect(
        keydownRemovals().some(([, handler]) => handler === firstHandler)
      ).toBe(true);

      fireEvent.click(openPreview);
      expect(keydownAdds()).toHaveLength(2);
      const secondHandler = keydownAdds()[1][1];

      unmount();
      expect(
        keydownRemovals().some(([, handler]) => handler === secondHandler)
      ).toBe(true);
    } finally {
      addEventListener.mockRestore();
      removeEventListener.mockRestore();
    }
  });

  it("downloads the real asset from both the card and lightbox", () => {
    renderGrid(assets.slice(0, 1));

    expect(screen.getByRole("link", { name: "Download" }))
      .toHaveAttribute("href", assets[0].src);
    expect(screen.getByRole("link", { name: "Download" }))
      .toHaveAttribute("download");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Preview image generated with gpt-image-2"
      })
    );

    const lightboxDownload = within(
      screen.getByRole("dialog", { name: "Image preview" })
    ).getByRole("link", { name: "Download image" });

    expect(lightboxDownload).toHaveAttribute("href", assets[0].src);
    expect(lightboxDownload).toHaveAttribute("download");
  });

  it("reuses every real primitive parameter with URL-safe encoding", () => {
    renderGrid(assets.slice(0, 1));

    const cardReuse = screen.getByRole("link", { name: "Reuse" });
    const rawHref = cardReuse.getAttribute("href") ?? "";
    const reuseUrl = new URL(rawHref, "http://localhost");

    expect(rawHref).toContain(
      "prompt=Copper+%26+glass+at+dawn+%2F+close-up%3F"
    );
    expect(reuseUrl.pathname).toBe("/generate");
    expect(Array.from(reuseUrl.searchParams.entries())).toEqual([
      ["prompt", assets[0].prompt],
      ["providerId", assets[0].providerId],
      ["modelId", assets[0].modelId],
      ["model", assets[0].model],
      ["size", "1536x1024"],
      ["quality", "high"],
      ["count", "3"],
      ["responseFormat", "url"],
      ["transparentBackground", "false"]
    ]);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Preview image generated with gpt-image-2"
      })
    );
    const lightboxReuse = within(
      screen.getByRole("dialog", { name: "Image preview" })
    ).getByRole("link", { name: "Reuse prompt" });

    expect(lightboxReuse).toHaveAttribute("href", rawHref);
  });

  it("keeps canonical asset fields when request parameters contain conflicts", () => {
    renderGrid([assetWithConflictingRequestParams]);

    const rawHref = screen.getByRole("link", { name: "Reuse" })
      .getAttribute("href") ?? "";
    const reuseParams = new URL(rawHref, "http://localhost").searchParams;

    expect(reuseParams.get("prompt")).toBe(assetWithConflictingRequestParams.prompt);
    expect(reuseParams.get("providerId"))
      .toBe(assetWithConflictingRequestParams.providerId);
    expect(reuseParams.get("modelId"))
      .toBe(assetWithConflictingRequestParams.modelId);
    expect(reuseParams.get("model")).toBe(assetWithConflictingRequestParams.model);
    expect(Object.fromEntries(reuseParams.entries())).toMatchObject({
      size: "1536x1024",
      quality: "high",
      count: "3",
      responseFormat: "url",
      transparentBackground: "false"
    });
  });
});
