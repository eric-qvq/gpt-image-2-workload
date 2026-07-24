// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  GenerationChat,
  type ChatMessage
} from "../../src/components/chat/GenerationChat";

describe("GenerationChat", () => {
  it("renders the prompt form with its stable id and submits a trimmed prompt", () => {
    const onSubmit = vi.fn();

    render(
      <GenerationChat
        activeConfigLabel="Proxy / gpt-image-2"
        formId="generation-prompt-form"
        initialPrompt="  Draw a red cube  "
        messages={[]}
        onSubmit={onSubmit}
      />
    );

    const form = screen.getByRole("form", { name: "Generation prompt" });
    const prompt = screen.getByLabelText("Prompt") as HTMLTextAreaElement;

    expect(form).toHaveAttribute("id", "generation-prompt-form");
    expect(form.closest(".prompt-panel")).toBeTruthy();
    expect(prompt.value).toBe("  Draw a red cube  ");
    expect(screen.getByText("15 / 1000")).toBeTruthy();
    expect(screen.getByText("Proxy / gpt-image-2")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Generate image" })).toBeNull();

    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledWith("Draw a red cube");
    expect(prompt.value).toBe("");
  });

  it("applies an authored template and submits only the positive prompt", () => {
    const onSubmit = vi.fn();

    render(
      <GenerationChat
        formId="generation-prompt-form"
        messages={[]}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Templates" }));
    const dialog = screen.getByRole("dialog", { name: "Prompt templates" });

    expect(
      within(dialog).getByRole("button", { name: "Cinematic city" })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Mountain landscape" })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Editorial portrait" })
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Cinematic city" })
    );
    expect(screen.getByLabelText("Prompt")).toHaveValue(
      "A futuristic city at sunset, cinematic lighting, ultra detailed."
    );
    fireEvent.change(screen.getByLabelText("Negative Prompt (optional)"), {
      target: { value: "blurry, watermark" }
    });
    expect(screen.getByLabelText("Negative Prompt (optional)")).toHaveValue(
      "blurry, watermark"
    );

    fireEvent.submit(screen.getByRole("form", { name: "Generation prompt" }));

    expect(onSubmit).toHaveBeenCalledWith(
      "A futuristic city at sunset, cinematic lighting, ultra detailed."
    );
    expect(onSubmit).not.toHaveBeenCalledWith(
      expect.stringContaining("blurry")
    );
  });

  it("previews prompt enhancement without network calls or prompt mutation", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(
      <GenerationChat
        formId="generation-prompt-form"
        initialPrompt="Keep this real prompt"
        messages={[]}
        onSubmit={vi.fn()}
      />
    );

    const promptForm = screen.getByRole("form", {
      name: "Generation prompt"
    });
    const promptPanel = screen.getByRole("region", {
      name: "Prompt panel"
    });
    const enhance = within(promptForm).getByRole("button", {
      name: "Enhance Prompt"
    });

    expect(enhance).toHaveClass("enhance-prompt-action");
    expect(
      within(
        promptPanel.querySelector(".prompt-tools") as HTMLElement
      ).queryByRole("button", { name: "Enhance Prompt" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Enhance Prompt" }));
    const dialog = screen.getByRole("dialog", { name: "Enhance Prompt" });

    expect(dialog).toHaveTextContent("Interface preview · Data not connected");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm preview" })
    );

    expect(screen.queryByRole("dialog", { name: "Enhance Prompt" }))
      .not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Interface preview · Prompt was not enhanced"
    );
    expect(screen.getByLabelText("Prompt")).toHaveValue(
      "Keep this real prompt"
    );
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockRestore();
  });

  it("shows the disabled reason and does not submit the prompt", () => {
    const onSubmit = vi.fn();

    render(
      <GenerationChat
        disabledReason="Configure an enabled provider first."
        formId="generation-prompt-form"
        initialPrompt="Draw a red cube"
        messages={[]}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Configure an enabled provider first."
    );

    fireEvent.submit(screen.getByRole("form", { name: "Generation prompt" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a real preview empty state before the first assistant job", () => {
    render(
      <GenerationChat
        formId="generation-prompt-form"
        messages={[]}
        onSubmit={vi.fn()}
      />
    );

    const preview = screen.getByRole("region", { name: "Image preview" });

    expect(preview).toHaveClass("preview-panel");
    expect(preview.querySelector(".preview-stage")).toBeTruthy();
    expect(screen.getByText("Your generated image will appear here.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Upscale|Variations/i })).toBeNull();
  });

  it("shows the latest real asset with network-free image actions", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const writeText = vi.fn(async () => undefined);
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard"
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    render(
      <GenerationChat
        formId="generation-prompt-form"
        initialPreviewAsset={{
          id: "asset_recent",
          src: "/api/image-assets/asset_recent",
          prompt: "Recent real image",
          model: "gpt-image-2",
          createdAt: "2026-07-12T01:02:03.000Z"
        }}
        messages={[]}
        onSubmit={vi.fn()}
      />
    );

    const preview = screen.getByRole("region", { name: "Image preview" });
    expect(within(preview).getByRole("img", { name: "Recent real image" }))
      .toHaveAttribute("src", "/api/image-assets/asset_recent");
    expect(within(preview).getByRole("link", { name: "Download" }))
      .toHaveAttribute("href", "/api/image-assets/asset_recent");

    fireEvent.click(within(preview).getByRole("button", { name: "Upscale" }));
    const upscaleDialog = screen.getByRole("dialog", { name: "Upscale image" });
    fireEvent.change(within(upscaleDialog).getByLabelText("Scale"), {
      target: { value: "4" }
    });
    fireEvent.click(
      within(upscaleDialog).getByRole("button", { name: "Confirm upscale" })
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Interface preview · Upscale was not saved"
    );

    fireEvent.click(within(preview).getByRole("button", { name: "Variations" }));
    const variationsDialog = screen.getByRole("dialog", {
      name: "Create variations"
    });
    fireEvent.change(within(variationsDialog).getByLabelText("Variation count"), {
      target: { value: "3" }
    });
    fireEvent.click(
      within(variationsDialog).getByRole("button", {
        name: "Confirm variations"
      })
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Interface preview · Variations was not saved"
    );

    fireEvent.click(
      within(preview).getByRole("button", { name: "More image actions" })
    );
    fireEvent.click(screen.getByRole("button", { name: "View details" }));
    expect(within(preview).getByText("gpt-image-2")).toBeInTheDocument();

    fireEvent.click(
      within(preview).getByRole("button", { name: "More image actions" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));
    expect(writeText).toHaveBeenCalledWith("Recent real image");
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockRestore();
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("prioritizes the latest real job over the initial preview asset", () => {
    render(
      <GenerationChat
        formId="generation-prompt-form"
        initialPreviewAsset={{
          id: "asset_recent",
          src: "/api/image-assets/asset_recent",
          prompt: "Recent real image"
        }}
        messages={[
          {
            id: "job-new",
            role: "assistant",
            content: "New image ready.",
            status: "succeeded",
            images: [
              {
                id: "asset_new",
                src: "/api/image-assets/asset_new",
                alt: "Newest real image"
              }
            ]
          }
        ]}
        onSubmit={vi.fn()}
      />
    );

    const preview = screen.getByRole("region", { name: "Image preview" });
    expect(within(preview).getByRole("img", { name: "Newest real image" }))
      .toHaveAttribute("src", "/api/image-assets/asset_new");
    expect(
      within(preview).queryByRole("img", { name: "Recent real image" })
    ).not.toBeInTheDocument();
    expect(within(preview).getByRole("link", { name: "Download" }))
      .toHaveAttribute("href", "/api/image-assets/asset_new");
  });

  it.each([
    ["queued", true],
    ["running", true],
    ["failed", false]
  ] as const)(
    "announces %s preview updates and exposes the active busy state",
    (status, isBusy) => {
      render(
        <GenerationChat
          formId="generation-prompt-form"
          messages={[
            {
              id: "latest-job",
              role: "assistant",
              content: `Generation ${status}`,
              status
            }
          ]}
          onSubmit={vi.fn()}
        />
      );

      const previewStage = document.querySelector(".preview-stage");

      expect(previewStage).toHaveAttribute("aria-live", "polite");
      if (isBusy) {
        expect(previewStage).toHaveAttribute("aria-busy", "true");
      } else {
        expect(previewStage).not.toHaveAttribute("aria-busy");
      }
    }
  );

  it.each([
    ["queued", "Generation queued"],
    ["running", "Generation running"],
    ["failed", "Provider failed"]
  ] as const)("shows the latest %s assistant job in the preview", (status, content) => {
    const messages: ChatMessage[] = [
      {
        id: "old-job",
        role: "assistant",
        content: "Older assistant state",
        status: "queued"
      },
      { id: "user-message", role: "user", content: "Draw a red cube" },
      { id: "latest-job", role: "assistant", content, status }
    ];

    render(
      <GenerationChat
        formId="generation-prompt-form"
        messages={messages}
        onSubmit={vi.fn()}
      />
    );

    const preview = screen.getByRole("region", { name: "Image preview" });

    expect(preview).toHaveTextContent(status);
    expect(preview).toHaveTextContent(content);
    expect(preview).not.toHaveTextContent("Older assistant state");
    expect(preview).not.toHaveTextContent("Draw a red cube");
  });

  it("shows succeeded images with real download and history actions", () => {
    render(
      <GenerationChat
        formId="generation-prompt-form"
        messages={[
          {
            id: "job-1",
            role: "assistant",
            content: "Image ready.",
            status: "succeeded",
            images: [
              {
                id: "asset-1",
                src: "/api/image-assets/asset-1",
                alt: "Red cube"
              },
              {
                id: "asset-2",
                src: "/api/image-assets/asset-2",
                alt: "Red cube variation"
              }
            ]
          }
        ]}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText("succeeded")).toBeTruthy();
    expect(screen.getByText("Image ready.")).toBeTruthy();
    expect(screen.getByAltText("Red cube")).toHaveAttribute(
      "src",
      "/api/image-assets/asset-1"
    );
    expect(screen.getByAltText("Red cube variation")).toHaveAttribute(
      "src",
      "/api/image-assets/asset-2"
    );
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "/api/image-assets/asset-1"
    );
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute(
      "download"
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/history"
    );
    expect(screen.getByRole("link", { name: "Download" }).closest(".preview-actions"))
      .toBeTruthy();
  });
});
