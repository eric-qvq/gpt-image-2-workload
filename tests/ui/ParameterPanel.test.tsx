// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  ParameterPanel,
  type ParameterPanelValue
} from "../../src/components/settings/ParameterPanel";

type PrototypeValue = {
  previewQuality: "ultra" | null;
  style: "auto" | "vivid" | "natural";
  seed: string;
  guidance: number;
  outputFormat: "png" | "jpeg" | "webp";
  safetyFilter: boolean;
};

const initialConnected: ParameterPanelValue = {
  providerId: "provider_1",
  modelId: "model_1",
  size: "1024x1024",
  count: 1,
  quality: "standard",
  responseFormat: "b64_json"
};

const initialPrototype: PrototypeValue = {
  previewQuality: null,
  style: "auto",
  seed: "",
  guidance: 7.5,
  outputFormat: "png",
  safetyFilter: true
};

describe("ParameterPanel", () => {
  function renderPanel(submitDisabled = false) {
    const onConnectedChange = vi.fn();
    const onPrototypeChange = vi.fn();
    const onReset = vi.fn();

    function PanelHarness() {
      const [connected, setConnected] = React.useState(initialConnected);
      const [prototype, setPrototype] = React.useState(initialPrototype);

      function handleConnectedChange(next: ParameterPanelValue) {
        onConnectedChange(next);
        setConnected(next);
      }

      function handlePrototypeChange(next: PrototypeValue) {
        onPrototypeChange(next);
        setPrototype(next);
      }

      function handleReset() {
        onReset();
        setConnected(initialConnected);
        setPrototype(initialPrototype);
      }

      return (
        <ParameterPanel
          formId="generation-prompt-form"
          submitDisabled={submitDisabled}
          connected={connected}
          prototype={prototype}
          onConnectedChange={handleConnectedChange}
          onPrototypeChange={handlePrototypeChange}
          onReset={handleReset}
        />
      );
    }

    render(<PanelHarness />);

    return { onConnectedChange, onPrototypeChange, onReset };
  }

  it("renders connected and prototype controls with a truthful request summary", () => {
    renderPanel();

    expect(
      screen.getByRole("complementary", { name: "Generation parameters" })
    ).toHaveClass("generation-parameters");
    expect(screen.queryByLabelText("Provider")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Model")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Standard" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "High" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "Ultra" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    const style = within(screen.getByRole("group", { name: "Style" }));

    expect(style.getByRole("button", { name: "Auto" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(style.getByRole("button", { name: "Vivid" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(style.getByRole("button", { name: "Natural" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByLabelText("Seed (optional)")).toHaveValue("");
    expect(screen.getByLabelText("Guidance Scale")).toHaveValue("7.5");
    const guidanceLimits = within(
      screen.getByRole("group", { name: "Guidance limits" })
    );

    expect(guidanceLimits.getByText("1")).toBeInTheDocument();
    expect(guidanceLimits.getByText("20")).toBeInTheDocument();
    expect(screen.getByLabelText("Output Format")).toHaveValue("png");
    expect(
      screen.getByRole("checkbox", { name: "Safety Filter" })
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Safety Filter" })
    ).toHaveClass("safety-switch__input");
    expect(
      screen.getByRole("checkbox", { name: "Safety Filter" }).closest(
        ".safety-switch"
      )
    ).toBeTruthy();
    const advancedLabel = screen.getByText("Advanced delivery");
    const advanced = advancedLabel.closest("details");

    expect(advanced).toBeInstanceOf(HTMLDetailsElement);
    expect(advanced).not.toHaveAttribute("open");
    expect(
      within(advanced as HTMLElement).getByText(
        "Interface-only controls are not sent"
      )
    ).toBeInTheDocument();
    expect(
      within(advanced as HTMLElement).getByText(
        "Sent: Standard · Base64 JSON · 1 image"
      )
    ).toBeInTheDocument();
    expect(
      within(advanced as HTMLElement).getByText(
        /Ultra, Style, Seed, Guidance, Output Format, and Safety Filter/
      )
    ).toBeInTheDocument();
  });

  it("keeps Ultra and visual controls in prototype-only state", () => {
    const { onConnectedChange, onPrototypeChange } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Ultra" }));

    expect(onPrototypeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ previewQuality: "ultra" })
    );
    expect(onConnectedChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Ultra" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Standard" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    fireEvent.click(
      within(screen.getByRole("group", { name: "Style" })).getByRole(
        "button",
        { name: "Vivid" }
      )
    );
    expect(
      within(screen.getByRole("group", { name: "Style" })).getByRole(
        "button",
        { name: "Vivid" }
      )
    ).toHaveAttribute("aria-pressed", "true");
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

    expect(onPrototypeChange).toHaveBeenCalledWith(
      expect.objectContaining({ style: "vivid" })
    );
    expect(onPrototypeChange).toHaveBeenCalledWith(
      expect.objectContaining({ seed: "42" })
    );
    expect(onPrototypeChange).toHaveBeenCalledWith(
      expect.objectContaining({ guidance: 12 })
    );
    expect(onPrototypeChange).toHaveBeenCalledWith(
      expect.objectContaining({ outputFormat: "jpeg" })
    );
    expect(onPrototypeChange).toHaveBeenCalledWith(
      expect.objectContaining({ safetyFilter: false })
    );
    expect(onConnectedChange).not.toHaveBeenCalled();
  });

  it("keeps real quality, count, and delivery in connected state", () => {
    const { onConnectedChange, onPrototypeChange } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Ultra" }));
    onConnectedChange.mockClear();
    onPrototypeChange.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "High" }));

    expect(onConnectedChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ quality: "high" })
    );
    expect(onPrototypeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ previewQuality: null })
    );

    fireEvent.click(screen.getByText("Advanced delivery"));
    onConnectedChange.mockClear();
    onPrototypeChange.mockClear();
    fireEvent.change(screen.getByLabelText("Count"), {
      target: { value: "4" }
    });
    fireEvent.change(screen.getByLabelText("Delivery"), {
      target: { value: "url" }
    });

    expect(onConnectedChange).toHaveBeenCalledWith(
      expect.objectContaining({ count: 4 })
    );
    expect(onConnectedChange).toHaveBeenCalledWith(
      expect.objectContaining({ responseFormat: "url" })
    );
    expect(onPrototypeChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("Sent: High · Provider URL · 4 images")
    ).toBeInTheDocument();
  });

  it("associates reset and disabled submit actions with the prompt form", () => {
    const { onReset } = renderPanel(true);

    fireEvent.click(screen.getByRole("button", { name: "Reset parameters" }));
    expect(onReset).toHaveBeenCalledOnce();

    const submit = screen.getByRole("button", { name: "Generate image" });
    expect(submit).toHaveClass("generation-submit");
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit).toHaveAttribute("form", "generation-prompt-form");
    expect(submit).toBeDisabled();
  });
});
