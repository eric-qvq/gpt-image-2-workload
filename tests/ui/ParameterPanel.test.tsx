// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { ParameterPanel } from "../../src/components/settings/ParameterPanel";

describe("ParameterPanel", () => {
  it("renders provider, model, size, and count controls and emits changes", () => {
    const onChange = vi.fn();

    render(
      <ParameterPanel
        value={{
          providerId: "provider_1",
          modelId: "model_1",
          size: "1024x1024",
          count: 1,
          quality: "standard"
        }}
        providers={[{ id: "provider_1", name: "OpenAI" }]}
        models={[{ id: "model_1", name: "gpt-image-2" }]}
        onChange={onChange}
      />
    );

    expect((screen.getByLabelText("Provider") as HTMLSelectElement).value).toBe("provider_1");
    expect((screen.getByLabelText("Model") as HTMLSelectElement).value).toBe("model_1");
    expect((screen.getByLabelText("Size") as HTMLSelectElement).value).toBe("1024x1024");
    expect((screen.getByLabelText("Count") as HTMLInputElement).value).toBe("1");

    fireEvent.change(screen.getByLabelText("Count"), { target: { value: "4" } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ count: 4 }));
  });
});
