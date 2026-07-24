// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React, { useRef, useState } from "react";
import { describe, expect, it } from "vitest";

import { ShellStateProvider } from "../../src/components/layout/ShellState";
import {
  PrototypeDialog,
  PrototypeNotice,
  PrototypePageFrame,
  PrototypeStatus,
  usePrototypeFeedback
} from "../../src/components/prototype/PrototypeScaffold";

function PrototypeHarness() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("standard");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { message, showPreviewFeedback } = usePrototypeFeedback();

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Open preview
      </button>
      <PrototypeStatus message={message} />
      <PrototypeDialog
        open={open}
        title="Preview settings"
        onClose={() => setOpen(false)}
        returnFocusRef={triggerRef}
        actions={
          <button
            type="button"
            onClick={() => {
              showPreviewFeedback({ en: "Settings", zh: "设置" });
              setOpen(false);
            }}
          >
            Confirm preview
          </button>
        }
      >
        <label>
          Quality
          <select
            aria-label="Quality"
            value={choice}
            onChange={(event) => setChoice(event.target.value)}
          >
            <option value="standard">Standard</option>
            <option value="ultra">Ultra</option>
          </select>
        </label>
      </PrototypeDialog>
    </>
  );
}

function renderPrototype(ui: React.ReactNode) {
  return render(
    <ShellStateProvider initialModelName="Not connected">
      {ui}
    </ShellStateProvider>
  );
}

describe("prototype scaffold", () => {
  it("renders the shared page frame and truthful preview boundary", () => {
    renderPrototype(
      <PrototypePageFrame
        title="Batch Jobs"
        description="Manage queued batches."
      >
        <PrototypeNotice />
      </PrototypePageFrame>
    );

    expect(
      screen.getByRole("heading", { name: "Batch Jobs" })
    ).toBeInTheDocument();
    expect(screen.getByText("Manage queued batches.")).toBeInTheDocument();
    expect(
      screen.getAllByText("Interface preview · Data not connected")
    ).toHaveLength(2);
  });

  it("renders a modal dialog only while it is open", () => {
    renderPrototype(<PrototypeHarness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open preview" }));

    expect(
      screen.getByRole("dialog", { name: "Preview settings" })
    ).toHaveAttribute("aria-modal", "true");
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    renderPrototype(<PrototypeHarness />);
    const trigger = screen.getByRole("button", { name: "Open preview" });

    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("closes on the backdrop but not on dialog content", () => {
    renderPrototype(<PrototypeHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Open preview" }));
    const dialog = screen.getByRole("dialog", { name: "Preview settings" });
    fireEvent.mouseDown(dialog);
    expect(dialog).toBeInTheDocument();

    fireEvent.mouseDown(dialog.parentElement as HTMLElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("announces feedback politely without modifying the URL", () => {
    const initialHref = window.location.href;
    renderPrototype(<PrototypeHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Open preview" }));
    fireEvent.change(screen.getByLabelText("Quality"), {
      target: { value: "ultra" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm preview" }));

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(
      "Interface preview · Settings was not saved"
    );
    expect(window.location.href).toBe(initialHref);
  });
});
