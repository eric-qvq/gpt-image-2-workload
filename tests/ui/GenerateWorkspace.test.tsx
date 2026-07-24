// @vitest-environment jsdom

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React, { type ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GenerateWorkspace } from "../../src/components/generate/GenerateWorkspace";
import { ShellStateProvider } from "../../src/components/layout/ShellState";

function renderWorkspace(props: ComponentProps<typeof GenerateWorkspace>) {
  return render(
    <ShellStateProvider initialModelName="Not connected">
      <GenerateWorkspace {...props} />
    </ShellStateProvider>
  );
}

describe("GenerateWorkspace", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a conversation, queues a generation job, and displays archived images", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ conversation: { id: "conversation_1" } }), {
          status: 201
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ job: { id: "job_1", status: "QUEUED" } }), {
          status: 201
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job: {
              id: "job_1",
              status: "ARCHIVED",
              imageAssets: [{ id: "asset_1" }]
            }
          }),
          { status: 200 }
        )
      );

    renderWorkspace({
      providers: [{ id: "provider_1", name: "Proxy" }],
      models: [
        {
          id: "model_1",
          providerId: "provider_1",
          name: "gpt-image-2",
          defaultParams: {},
          capabilities: {}
        }
      ],
      initialParameters: { count: 2, quality: "high", size: "1024x1024" },
      pollIntervalMs: 0,
      maxPollAttempts: 1
    });

    expect(document.querySelector(".generation-workspace")).toBeTruthy();
    expect(document.querySelector(".generation-editor")).toBeTruthy();
    expect(document.querySelector(".generation-parameters")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "Draw a red cube" }
    });
    const generateButton = screen.getByRole("button", { name: "Generate image" });

    expect(generateButton).toHaveAttribute("form", "generation-prompt-form");
    fireEvent.click(generateButton);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/conversations",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "Draw a red cube" })
        })
      )
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/conversations/conversation_1/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          prompt: "Draw a red cube",
          providerId: "provider_1",
          modelId: "model_1",
          requestParams: {
            size: "1024x1024",
            quality: "high",
            count: 2,
            responseFormat: "b64_json"
          }
        })
      })
    );
    expect(await screen.findByAltText("Draw a red cube")).toHaveAttribute(
      "src",
      "/api/image-assets/asset_1"
    );
    expect(screen.getByText("succeeded")).toBeTruthy();
    expect(
      within(screen.getByRole("region", { name: "Prompt panel" })).getByText(
        "Proxy / gpt-image-2"
      )
    ).toBeTruthy();
  });

  it("posts the response format selected in the UI", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ conversation: { id: "conversation_url" } }), {
          status: 201
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ job: { id: "job_url", status: "QUEUED" } }), {
          status: 201
        })
      );

    renderWorkspace({
      providers: [{ id: "provider_1", name: "Proxy" }],
      models: [
        {
          id: "model_1",
          providerId: "provider_1",
          name: "gpt-image-2",
          defaultParams: {},
          capabilities: {}
        }
      ],
      maxPollAttempts: 0
    });

    fireEvent.click(screen.getByText("Advanced delivery"));
    fireEvent.change(screen.getByLabelText("Delivery"), {
      target: { value: "url" }
    });
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "Draw a hosted image" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate image" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/conversations/conversation_url/messages",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            prompt: "Draw a hosted image",
            providerId: "provider_1",
            modelId: "model_1",
            requestParams: {
              size: "1024x1024",
              quality: "standard",
              count: 1,
              responseFormat: "url"
            }
          })
        })
      )
    );
  });

  it("disables generation when no enabled provider or model exists", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    renderWorkspace({ providers: [], models: [] });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No enabled provider found. Go to Models"
    );
    expect(screen.getByRole("button", { name: "Generate image" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("updates provider and shell labels atomically when the model changes", () => {
    renderWorkspace({
      providers: [
        { id: "provider_1", name: "First provider" },
        { id: "provider_2", name: "Second provider" }
      ],
      models: [
        {
          id: "model_1",
          providerId: "provider_1",
          name: "First model",
          defaultParams: {},
          capabilities: {}
        },
        {
          id: "model_2",
          providerId: "provider_2",
          name: "Second model",
          defaultParams: {},
          capabilities: {}
        },
        {
          id: "model_3",
          providerId: "provider_2",
          name: "Third model",
          defaultParams: {},
          capabilities: {}
        }
      ],
      initialParameters: { providerId: "provider_1", modelId: "model_1" }
    });

    expect(screen.queryByLabelText("Provider")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Model"), {
      target: { value: "model_2" }
    });

    expect(screen.getByLabelText("Model")).toHaveValue("model_2");
    expect(
      within(screen.getByRole("region", { name: "Prompt panel" })).getByText(
        "Second provider / Second model"
      )
    ).toBeTruthy();
  });

  it("keeps prototype parameters out of the real generation request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ conversation: { id: "conversation_1" } }), {
          status: 201
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ job: { id: "job_1", status: "QUEUED" } }), {
          status: 201
        })
      );

    renderWorkspace({
      providers: [{ id: "provider_1", name: "Proxy" }],
      models: [
        {
          id: "model_1",
          providerId: "provider_1",
          name: "gpt-image-2",
          defaultParams: {},
          capabilities: {}
        }
      ],
      maxPollAttempts: 0
    });

    fireEvent.click(screen.getByRole("button", { name: "Ultra" }));
    fireEvent.click(
      within(screen.getByRole("group", { name: "Style" })).getByRole(
        "button",
        { name: "Vivid" }
      )
    );
    fireEvent.change(screen.getByLabelText("Seed (optional)"), {
      target: { value: "42" }
    });
    fireEvent.input(screen.getByLabelText("Guidance Scale"), {
      target: { value: "12" }
    });
    fireEvent.change(screen.getByLabelText("Output Format"), {
      target: { value: "jpeg" }
    });
    fireEvent.click(screen.getByLabelText("Safety Filter"));
    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "Draw a red cube" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate image" }));

    const expectedBody = JSON.stringify({
      prompt: "Draw a red cube",
      providerId: "provider_1",
      modelId: "model_1",
      requestParams: {
        size: "1024x1024",
        quality: "standard",
        count: 1,
        responseFormat: "b64_json"
      }
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/conversations/conversation_1/messages",
        expect.objectContaining({ method: "POST", body: expectedBody })
      )
    );

    for (const prototypeToken of [
      "ultra",
      "style",
      "seed",
      "guidance",
      "jpeg",
      "safety"
    ]) {
      expect(expectedBody.toLowerCase()).not.toContain(prototypeToken);
    }
  });

  it("opens a credential-free request example without navigation or network calls", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const initialHref = window.location.href;

    renderWorkspace({
      providers: [{ id: "provider_1", name: "Proxy" }],
      models: [
        {
          id: "model_1",
          providerId: "provider_1",
          name: "gpt-image-2",
          defaultParams: {},
          capabilities: {}
        }
      ]
    });

    const resolution = screen.getByLabelText("Resolution");

    expect(
      within(resolution).getByRole("option", {
        name: "1024 × 1024 (1:1)"
      })
    ).toHaveValue("1024x1024");
    expect(
      within(resolution).getByRole("option", {
        name: "1536 × 1024 (3:2)"
      })
    ).toHaveValue("1536x1024");
    expect(
      within(resolution).getByRole("option", {
        name: "1024 × 1536 (2:3)"
      })
    ).toHaveValue("1024x1536");
    expect(resolution).toHaveValue("1024x1024");
    fireEvent.click(screen.getByRole("button", { name: "View Code" }));

    const dialog = screen.getByRole("dialog", { name: "Request example" });
    expect(dialog).toHaveTextContent("POST /api/conversations/{id}/messages");
    expect(dialog).toHaveTextContent('"providerId": "provider_1"');
    expect(dialog).not.toHaveTextContent(/authorization|bearer|api[_ -]?key/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe(initialHref);
  });
});
