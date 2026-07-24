# Create Desktop Fidelity Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make the desktop Create page match the approved reference hierarchy more closely while preserving every real request, worker, archive, history, and mobile behavior.

**Architecture:** Keep GenerateWorkspace as the only generation state and network coordinator. Add one Create-specific page layout wrapper, flatten existing presentational wrappers only through scoped CSS, and improve prototype-only controls without changing their state type or allowing them into request payloads. Restore the existing sequential component boxes at 1023px and below.

**Tech Stack:** Next.js 15 App Router, React 19, strict TypeScript, Vitest 2, Testing Library, CSS, Docker Compose, gstack browse.

---

## Safety and Execution Rules

- Work only in C:\Users\29800\Desktop\gpt-image-2-workload\.worktrees\gpt-image-platform.
- Preserve every existing tracked and untracked change.
- Never run git reset, git clean, git checkout --, git add ., or git add -A.
- Do not modify the outer checkout, the 2026-07-10 or 2026-07-12 specifications, or plans dated 2026-07-11 or earlier.
- Do not modify APIs, Prisma, providers, jobs, worker, history, archive, storage, or generated images.
- Do not invent quota, billing, usage, notification, generation-time, pricing, region, or credential data.
- The user has not authorized commits. Replace every commit step with a scoped status and diff checkpoint.
- Use npm.cmd and npx.cmd in PowerShell.
- Before a production build, stop the running stack with docker compose down only. Never use docker compose down -v.
- Run the production build before Compose because the host and containers share .next.

## Current Evidence Baseline

Verified before this plan:

~~~text
npm.cmd test                  -> 39 files / 158 tests passed
npm.cmd run typecheck         -> exit code 0
npm.cmd run build             -> exit code 0
docker compose config --quiet -> exit code 0
~~~

At 375px, all nine authenticated routes have:

- no page-level horizontal overflow;
- no visible audited button, link, select, or tab below 44px;
- no browser console errors.

At 1536 × 1024 before this pass:

~~~text
Parameters top           351px
Generate top            1130px
Recent/Usage top        1215px
~~~

A temporary browser-only layout prototype produced:

~~~text
Parameters top            96px
Generate top             823px
Recent/Usage top         941px
~~~

The implementation should reproduce or improve those prototype measurements without using runtime DOM manipulation.

## File Map

### Create structure

- Modify: src/app/generate/page.tsx
  - Own the Create-specific page wrapper and create-page-heading class.
- Inspect only: src/components/generate/GenerateWorkspace.tsx
  - Preserve state and requests unchanged; its existing wrappers become layout participants through scoped CSS only.

### Control fidelity

- Modify: src/components/generate/CreateToolbar.tsx
  - Map raw resolution values to readable labels.
- Modify: src/components/generate/PromptComposer.tsx
  - Move Enhance Prompt from the header tool cluster into the prompt form.
- Modify: src/components/settings/ParameterPanel.tsx
  - Render Style as a segmented group, add guidance endpoints, and style the native Safety Filter checkbox as a switch.

### Styling and tests

- Modify: src/app/globals.css
- Modify: tests/ui/GeneratePage.test.tsx
- Modify: tests/ui/GenerateWorkspace.test.tsx
- Modify: tests/ui/GenerationChat.test.tsx
- Modify: tests/ui/ParameterPanel.test.tsx
- Modify: tests/ui/GlobalStyles.test.ts

## Task 0: Record the Baseline Without Changing Source

**Files:**
- Inspect only: repository state and running Create page.

- [ ] **Step 1: Verify the freeze boundary and feature branch**

Run:

~~~powershell
Get-Content -LiteralPath "C:\Users\29800\.gstack\freeze-dir.txt" -Raw
git branch --show-current
git status --short --branch
~~~

Expected:

~~~text
C:/Users/29800/Desktop/gpt-image-2-workload/.worktrees/gpt-image-platform/
feature/gpt-image-platform
~~~

The dirty status is expected and must not be normalized.

- [ ] **Step 2: Run the focused Create baseline**

Run:

~~~powershell
npm.cmd test -- tests/ui/GeneratePage.test.tsx tests/ui/GenerateWorkspace.test.tsx tests/ui/GenerationChat.test.tsx tests/ui/ParameterPanel.test.tsx tests/ui/GlobalStyles.test.ts
npm.cmd run typecheck
~~~

Expected: all focused tests pass and TypeScript exits 0 before new source edits.

- [ ] **Step 3: Record the current browser measurements**

At http://localhost:3000/generate with a 1536 × 1024 viewport, evaluate:

~~~js
(() => {
  const top = (selector) =>
    Math.round(document.querySelector(selector).getBoundingClientRect().top);

  return {
    parametersTop: top(".generation-parameters"),
    submitTop: top(".generation-submit"),
    recentTop: top(".recent-generations"),
    usageTop: top(".todays-usage")
  };
})()
~~~

Expected baseline: Parameters around 351px, Generate around 1130px, and Recent/Usage around 1215px.

## Task 1: Add Human-Readable Resolution Labels

**Files:**
- Modify: tests/ui/GenerateWorkspace.test.tsx
- Modify: src/components/generate/CreateToolbar.tsx

- [ ] **Step 1: Add failing option-label assertions**

In the existing request-example test in tests/ui/GenerateWorkspace.test.tsx, add:

~~~tsx
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
~~~

Keep the existing request-example, no-network, and unchanged-URL assertions.

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

~~~powershell
npm.cmd test -- tests/ui/GenerateWorkspace.test.tsx
~~~

Expected: FAIL because the options currently expose raw values as their visible names.

- [ ] **Step 3: Replace the raw size list with labeled options**

In src/components/generate/CreateToolbar.tsx, replace the sizes constant with:

~~~ts
const sizeOptions = [
  { value: "1024x1024", label: "1024 × 1024 (1:1)" },
  { value: "1536x1024", label: "1536 × 1024 (3:2)" },
  { value: "1024x1536", label: "1024 × 1536 (2:3)" }
] as const;
~~~

Replace the option rendering with:

~~~tsx
{sizeOptions.map((option) => (
  <option key={option.value} value={option.value}>
    {option.label}
  </option>
))}
~~~

Do not change value.size, onSizeChange, or the request example.

- [ ] **Step 4: Verify labels and connected request values**

Run:

~~~powershell
npm.cmd test -- tests/ui/GenerateWorkspace.test.tsx tests/ui/GeneratePage.test.tsx
~~~

Expected: both files pass; select values and generation payloads still use raw strings such as 1024x1024.

- [ ] **Step 5: Save a scoped checkpoint**

Run:

~~~powershell
git diff -- src/components/generate/CreateToolbar.tsx tests/ui/GenerateWorkspace.test.tsx
git status --short -- src/components/generate/CreateToolbar.tsx tests/ui/GenerateWorkspace.test.tsx
~~~

Expected: only the labeled option mapping and its test are new in this task.

## Task 2: Match Style, Guidance, and Safety Controls to the Reference

**Files:**
- Modify: tests/ui/ParameterPanel.test.tsx
- Modify: tests/ui/GenerateWorkspace.test.tsx
- Modify: src/components/settings/ParameterPanel.tsx

- [ ] **Step 1: Rewrite the Style assertions around a segmented group**

Update the Testing Library import in tests/ui/ParameterPanel.test.tsx to:

~~~ts
import { fireEvent, render, screen, within } from "@testing-library/react";
~~~

In tests/ui/ParameterPanel.test.tsx, replace the select assertion with:

~~~tsx
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
~~~

Add:

~~~tsx
const guidanceLimits = within(
  screen.getByRole("group", { name: "Guidance limits" })
);

expect(guidanceLimits.getByText("1")).toBeInTheDocument();
expect(guidanceLimits.getByText("20")).toBeInTheDocument();
expect(
  screen.getByRole("checkbox", { name: "Safety Filter" })
).toHaveClass("safety-switch__input");
expect(
  screen.getByRole("checkbox", { name: "Safety Filter" }).closest(
    ".safety-switch"
  )
).toBeTruthy();
~~~

- [ ] **Step 2: Update prototype interaction tests**

Replace:

~~~tsx
fireEvent.change(screen.getByLabelText("Style"), {
  target: { value: "vivid" }
});
~~~

with:

~~~tsx
fireEvent.click(
  within(screen.getByRole("group", { name: "Style" })).getByRole("button", {
    name: "Vivid"
  })
);
~~~

After the click, add:

~~~tsx
expect(
  within(screen.getByRole("group", { name: "Style" })).getByRole("button", {
    name: "Vivid"
  })
).toHaveAttribute("aria-pressed", "true");
~~~

Make the same interaction replacement in the prototype-request-boundary test in tests/ui/GenerateWorkspace.test.tsx.

- [ ] **Step 3: Run both tests and verify failure**

Run:

~~~powershell
npm.cmd test -- tests/ui/ParameterPanel.test.tsx tests/ui/GenerateWorkspace.test.tsx
~~~

Expected: FAIL because Style is still a select, guidance endpoints do not exist, and Safety Filter has no switch class.

- [ ] **Step 4: Implement the Style segmented group**

In src/components/settings/ParameterPanel.tsx, add:

~~~ts
const styleOptions = [
  { value: "auto", label: "Auto" },
  { value: "vivid", label: "Vivid" },
  { value: "natural", label: "Natural" }
] as const;
~~~

Replace the Style label/select with:

~~~tsx
<div className="setting-field">
  <span>Style</span>
  <div className="style-segments" role="group" aria-label="Style">
    {styleOptions.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={prototype.style === option.value}
        onClick={() => updatePrototype({ style: option.value })}
      >
        {option.label}
      </button>
    ))}
  </div>
</div>
~~~

This updates only PrototypeGenerationParameters.style.

- [ ] **Step 5: Add guidance endpoint labels**

Immediately after the existing range input, add:

~~~tsx
<div
  className="guidance-scale__limits"
  role="group"
  aria-label="Guidance limits"
>
  <span>1</span>
  <span>20</span>
</div>
~~~

Keep min="1", max="20", step="0.5", and the current output unchanged.

- [ ] **Step 6: Style the native Safety Filter checkbox as a switch**

Replace the checkbox label with:

~~~tsx
<label className="checkbox-field safety-switch">
  <input
    className="safety-switch__input"
    type="checkbox"
    checked={prototype.safetyFilter}
    onChange={(event) =>
      updatePrototype({ safetyFilter: event.target.checked })
    }
  />
  <span className="safety-switch__track" aria-hidden="true">
    <span />
  </span>
  <span>Safety Filter</span>
</label>
~~~

Do not replace the native checkbox with a click-only div or button.

- [ ] **Step 7: Verify state separation and semantics**

Run:

~~~powershell
npm.cmd test -- tests/ui/ParameterPanel.test.tsx tests/ui/GenerateWorkspace.test.tsx
npm.cmd run typecheck
~~~

Expected:

- Style Vivid updates prototype state only;
- Safety Filter remains a checked native checkbox;
- the real generation body still contains only prompt, providerId, modelId, size, quality, count, and responseFormat;
- TypeScript exits 0.

- [ ] **Step 8: Save a scoped checkpoint**

Run:

~~~powershell
git diff -- src/components/settings/ParameterPanel.tsx tests/ui/ParameterPanel.test.tsx tests/ui/GenerateWorkspace.test.tsx
~~~

Expected: no connected request type or request-building code changed.

## Task 3: Move Enhance Prompt Into the Prompt Workflow

**Files:**
- Modify: tests/ui/GenerationChat.test.tsx
- Modify: src/components/generate/PromptComposer.tsx

- [ ] **Step 1: Add a failing placement test**

In the existing prompt-enhancement test, add:

~~~tsx
const promptForm = screen.getByRole("form", { name: "Generation prompt" });
const promptPanel = screen.getByRole("region", { name: "Prompt panel" });
const enhance = within(promptForm).getByRole("button", {
  name: "Enhance Prompt"
});

expect(enhance).toHaveClass("enhance-prompt-action");
expect(
  within(
    promptPanel.querySelector(".prompt-tools") as HTMLElement
  ).queryByRole("button", { name: "Enhance Prompt" })
).not.toBeInTheDocument();
~~~

Keep all existing dialog, no-fetch, no-prompt-mutation, and feedback assertions.

- [ ] **Step 2: Run the test and verify failure**

Run:

~~~powershell
npm.cmd test -- tests/ui/GenerationChat.test.tsx
~~~

Expected: FAIL because Enhance Prompt is still inside the header tool group.

- [ ] **Step 3: Keep only Templates in the header tools**

In src/components/generate/PromptComposer.tsx, leave this button inside prompt-tools:

~~~tsx
<button
  ref={templatesTriggerRef}
  type="button"
  onClick={() => setTemplatesOpen(true)}
>
  Templates
</button>
~~~

Remove the Enhance Prompt button from that header group.

- [ ] **Step 4: Add the wide Enhance Prompt action after the primary prompt**

Immediately after the Prompt label and before Negative Prompt, add:

~~~tsx
<button
  ref={enhanceTriggerRef}
  type="button"
  className="enhance-prompt-action"
  onClick={() => setEnhanceOpen(true)}
>
  <span aria-hidden="true">✦</span>
  <span>Enhance Prompt</span>
  <span aria-hidden="true">+</span>
</button>
~~~

Keep the existing PrototypeDialog, status message, and trigger ref.

- [ ] **Step 5: Verify prompt behavior**

Run:

~~~powershell
npm.cmd test -- tests/ui/GenerationChat.test.tsx tests/ui/GenerateWorkspace.test.tsx
npm.cmd run typecheck
~~~

Expected: prompt templates, trimming, disabled state, image preview, and enhancement preview tests all pass; Enhance Prompt still performs no fetch and does not mutate the prompt.

## Task 4: Add the Create Page Layout Boundary

**Files:**
- Modify: tests/ui/GeneratePage.test.tsx
- Modify: src/app/generate/page.tsx

- [ ] **Step 1: Add a failing layout-boundary assertion**

In the primary GeneratePage test, add:

~~~tsx
const createLayout = container.querySelector(".create-page-layout");

expect(createLayout).toBeInTheDocument();
expect(
  createLayout?.querySelector(":scope > .create-page-heading")
).toBe(pageHeading);
expect(
  createLayout?.querySelector(":scope > .create-workbench")
).toBeInTheDocument();
expect(
  createLayout?.querySelector(":scope > .create-lower-grid")
).toBe(lowerGrid);
~~~

Keep the existing Recent Generations, truthful Today's Usage, model, prompt, reuse, and session assertions.

- [ ] **Step 2: Run the page test and verify failure**

Run:

~~~powershell
npm.cmd test -- tests/ui/GeneratePage.test.tsx
~~~

Expected: FAIL because the page has no create-page-layout wrapper or create-page-heading class.

- [ ] **Step 3: Wrap the existing Create content**

In src/app/generate/page.tsx, keep all current data loading and replace only the returned Create children with:

~~~tsx
<AuthenticatedAppShell context={shellContext}>
  <div className="create-page-layout">
    <section
      className="page-heading create-page-heading"
      aria-labelledby="generate-title"
    >
      <p className="eyebrow">Workbench</p>
      <h1 id="generate-title">Create Image</h1>
      <p className="muted">
        Submit a prompt, let the worker call your configured provider, and
        view archived outputs when they are ready.
      </p>
    </section>
    <GenerateWorkspace
      providers={options.providers}
      models={options.models}
      initialPrompt={params.prompt ?? ""}
      initialPreviewAsset={recentAssets[0]}
      initialParameters={{
        providerId: params.providerId,
        modelId: params.modelId,
        size: params.size,
        count: readCount(params.count),
        quality: readQuality(params.quality),
        responseFormat: readResponseFormat(params.responseFormat)
      }}
    />
    <div className="create-lower-grid">
      <RecentGenerations assets={recentAssets} />
      <TodaysUsage />
    </div>
  </div>
</AuthenticatedAppShell>
~~~

Do not move server queries or pass Recent Generations into GenerateWorkspace.

- [ ] **Step 4: Verify the semantic wrapper**

Run:

~~~powershell
npm.cmd test -- tests/ui/GeneratePage.test.tsx tests/ui/GenerateWorkspace.test.tsx
npm.cmd run typecheck
~~~

Expected: the page and workspace tests pass before CSS layout changes.

## Task 5: Implement the Desktop Grid and Density Contract

**Files:**
- Modify: tests/ui/GlobalStyles.test.ts
- Modify: src/app/globals.css

- [ ] **Step 1: Add a min-width media helper to the CSS contract test**

After getMediaBody in tests/ui/GlobalStyles.test.ts, add:

~~~ts
function getMinWidthMediaBody(
  source: string,
  breakpoint: number
): string | undefined {
  const mediaPattern = new RegExp(
    "^@media\\s*\\(\\s*min-width\\s*:\\s*" +
      breakpoint +
      "px\\s*\\)$",
    "i"
  );

  return getAtRuleBody(source, (prelude) => mediaPattern.test(prelude));
}
~~~

- [ ] **Step 2: Extend the required selector list**

Add these names to requiredSelectors:

~~~ts
"create-page-layout",
"style-segments",
"guidance-scale__limits",
"safety-switch",
"enhance-prompt-action"
~~~

- [ ] **Step 3: Replace the desktop Create proportion assertions**

In the desktop layout test, read:

~~~ts
const pageLayout = getDeclarations(styles, ".create-page-layout");
const workbenchContents = getDeclarations(
  styles,
  ".create-page-layout > .create-workbench"
);
const workspaceContents = getDeclarations(
  styles,
  ".create-page-layout .generation-workspace"
);
const lowerContents = getDeclarations(
  styles,
  ".create-page-layout > .create-lower-grid"
);
~~~

Assert:

~~~ts
expect(normalizeValue(pageLayout.get("grid-template-columns"))).toContain(
  "332px"
);
expect(normalizeValue(pageLayout.get("grid-template-areas"))).toContain(
  "heading parameters"
);
expect(normalizeValue(pageLayout.get("grid-template-areas"))).toContain(
  "recent usage"
);
expect(normalizeValue(workbenchContents.get("display"))).toBe("contents");
expect(normalizeValue(workspaceContents.get("display"))).toBe("contents");
expect(normalizeValue(lowerContents.get("display"))).toBe("contents");
~~~

Retain the 248px shell, 312px Prompt column, sticky Parameters, and full-width Generate assertions.

- [ ] **Step 4: Add density assertions for 1280px and wider**

Add a test:

~~~ts
it("uses the verified high-density Create values at 1280px and wider", () => {
  const media = getMinWidthMediaBody(styles, 1280) ?? "";
  const promptForm = getDeclarations(
    media,
    ".create-page-layout .prompt-panel form"
  );
  const prompt = getDeclarations(
    media,
    '.create-page-layout .prompt-panel textarea[rows="5"]'
  );
  const negative = getDeclarations(
    media,
    '.create-page-layout .prompt-panel textarea[rows="2"]'
  );
  const preview = getDeclarations(
    media,
    ".create-page-layout .preview-stage"
  );
  const previewImage = getDeclarations(
    media,
    ".create-page-layout .initial-preview-result img"
  );
  const parameters = getDeclarations(
    media,
    ".create-page-layout .generation-parameters"
  );

  expect(media).not.toBe("");
  expect(normalizeValue(promptForm.get("gap"))).toBe("10px");
  expect(normalizeValue(promptForm.get("margin-top"))).toBe("12px");
  expect(Number.parseFloat(prompt.get("min-height") ?? ""))
    .toBeLessThanOrEqual(170);
  expect(Number.parseFloat(negative.get("min-height") ?? ""))
    .toBeLessThanOrEqual(72);
  expect(Number.parseFloat(preview.get("min-height") ?? ""))
    .toBeLessThanOrEqual(320);
  expect(Number.parseFloat(previewImage.get("max-height") ?? ""))
    .toBeLessThanOrEqual(390);
  expect(normalizeValue(parameters.get("gap"))).toBe("10px");
});
~~~

- [ ] **Step 5: Extend the 1279px contract**

In the 1279px test, add:

~~~ts
const pageLayout = getDeclarations(media, ".create-page-layout");

expect(normalizeValue(pageLayout.get("grid-template-columns"))).toContain(
  "300px"
);
~~~

Keep the existing 80px icon rail and single-column generation-editor assertions.

- [ ] **Step 6: Extend the 1023px restoration contract**

In the 1023px test, read:

~~~ts
const pageLayout = getDeclarations(media, ".create-page-layout");
const workbench = getDeclarations(
  media,
  ".create-page-layout > .create-workbench"
);
const workspace = getDeclarations(
  media,
  ".create-page-layout .generation-workspace"
);
const lowerGrid = getDeclarations(
  media,
  ".create-page-layout > .create-lower-grid"
);
~~~

Assert:

~~~ts
expect(isSingleColumn(pageLayout.get("grid-template-columns"))).toBe(true);
expect(normalizeValue(workbench.get("display"))).toBe("grid");
expect(normalizeValue(workspace.get("display"))).toBe("grid");
expect(isSingleColumn(workspace.get("grid-template-columns"))).toBe(true);
expect(normalizeValue(lowerGrid.get("display"))).toBe("grid");
expect(isSingleColumn(lowerGrid.get("grid-template-columns"))).toBe(true);
~~~

- [ ] **Step 7: Run the CSS contract and verify failure**

Run:

~~~powershell
npm.cmd test -- tests/ui/GlobalStyles.test.ts
~~~

Expected: FAIL for the missing layout, control, density, and breakpoint rules.

- [ ] **Step 8: Add the base Create layout grid**

Append focused rules to src/app/globals.css:

~~~css
.create-page-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 332px;
  grid-template-areas:
    "heading parameters"
    "toolbar parameters"
    "editor parameters"
    "recent usage";
  column-gap: 18px;
  row-gap: 14px;
  align-items: start;
  min-width: 0;
}

.create-page-layout > .create-page-heading {
  grid-area: heading;
  max-width: none;
}

.create-page-layout > .create-workbench,
.create-page-layout > .create-lower-grid,
.create-page-layout .generation-workspace {
  display: contents;
}

.create-page-layout .create-toolbar {
  grid-area: toolbar;
}

.create-page-layout .generation-editor {
  grid-area: editor;
}

.create-page-layout .generation-parameters {
  grid-area: parameters;
}

.create-page-layout .recent-generations {
  grid-area: recent;
}

.create-page-layout .todays-usage {
  grid-area: usage;
}
~~~

Do not remove the existing general generation-workspace or create-lower-grid rules; they are restored at narrower widths.

- [ ] **Step 9: Add Style, guidance, switch, and Enhance Prompt styles**

Add:

~~~css
.style-segments {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-muted);
  padding: 4px;
}

.style-segments button {
  min-height: 44px;
  border-color: transparent;
  background: transparent;
  color: var(--muted);
  padding: 6px 8px;
  font-size: 12px;
}

.style-segments button[aria-pressed="true"] {
  border-color: #c7d2fe;
  background: var(--surface);
  color: var(--primary-hover);
  box-shadow: var(--shadow-card);
}

.guidance-scale__limits {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 11px;
  font-weight: 500;
}

.safety-switch {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  min-height: 44px;
  gap: 10px;
  cursor: pointer;
}

.safety-switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
}

.safety-switch__track {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--border-strong);
  transition: background-color 160ms ease-out;
}

.safety-switch__track span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  transition: transform 160ms ease-out;
}

.safety-switch__input:checked + .safety-switch__track {
  background: var(--primary);
}

.safety-switch__input:checked + .safety-switch__track span {
  transform: translateX(16px);
}

.safety-switch__input:focus-visible + .safety-switch__track {
  outline: 3px solid rgba(79, 70, 229, 0.24);
  outline-offset: 2px;
}

.enhance-prompt-action {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  width: 100%;
  min-height: 44px;
  gap: 8px;
  text-align: left;
}
~~~

Do not add another reduced-motion block. The existing
prefers-reduced-motion rule already applies its transition-duration override
to every element and pseudo-element, including the switch track and thumb.

- [ ] **Step 10: Add the verified desktop density values**

Add:

~~~css
@media (min-width: 1280px) {
  .create-page-layout .create-page-heading .muted {
    line-height: 1.4;
  }

  .create-page-layout .create-toolbar {
    padding: 12px 16px;
  }

  .create-page-layout .prompt-panel,
  .create-page-layout .preview-panel,
  .create-page-layout .generation-parameters,
  .create-page-layout .recent-generations,
  .create-page-layout .todays-usage {
    padding: 16px;
  }

  .create-page-layout .prompt-panel,
  .create-page-layout .preview-panel {
    min-height: 0;
  }

  .create-page-layout .prompt-panel form {
    gap: 10px;
    margin-top: 12px;
  }

  .create-page-layout .prompt-panel textarea[rows="5"] {
    min-height: 170px;
  }

  .create-page-layout .prompt-panel textarea[rows="2"] {
    min-height: 72px;
  }

  .create-page-layout .preview-panel {
    gap: 12px;
  }

  .create-page-layout .preview-stage {
    min-height: 320px;
    padding: 12px;
  }

  .create-page-layout .initial-preview-result img {
    max-height: 390px;
  }

  .create-page-layout .generation-parameters {
    top: 84px;
    gap: 10px;
  }

  .create-page-layout .generation-parameters > .setting-stack {
    gap: 8px;
  }

  .create-page-layout .parameter-summary,
  .create-page-layout .prototype-notice {
    padding: 10px 12px;
  }

  .create-page-layout .recent-generations,
  .create-page-layout .todays-usage {
    gap: 12px;
  }
}
~~~

- [ ] **Step 11: Add the 1279px column adjustment**

Inside the existing max-width: 1279px media block, add:

~~~css
.create-page-layout {
  grid-template-columns: minmax(0, 1fr) 300px;
}
~~~

- [ ] **Step 12: Restore normal boxes and reading order at 1023px**

Inside the existing max-width: 1023px media block, add:

~~~css
.create-page-layout {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: none;
  gap: 20px;
}

.create-page-layout > .create-page-heading,
.create-page-layout .create-toolbar,
.create-page-layout .generation-editor,
.create-page-layout .generation-parameters,
.create-page-layout .recent-generations,
.create-page-layout .todays-usage {
  grid-area: auto;
}

.create-page-layout > .create-workbench {
  display: grid;
  gap: 18px;
}

.create-page-layout .generation-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.create-page-layout > .create-lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}
~~~

Do not change the existing 767px mobile drawer, square preview, table-card, or full-width action rules.

- [ ] **Step 13: Run the CSS and complete focused UI gates**

Run:

~~~powershell
npm.cmd test -- tests/ui/GlobalStyles.test.ts
npm.cmd test -- tests/ui/GeneratePage.test.tsx tests/ui/GenerateWorkspace.test.tsx tests/ui/GenerationChat.test.tsx tests/ui/ParameterPanel.test.tsx
npm.cmd run typecheck
~~~

Expected: all focused tests and TypeScript pass.

## Task 6: Verify the Request Boundary and Responsive Layout

**Files:**
- Modify only if a focused regression test exposes a defect in files already listed above.

- [ ] **Step 1: Run the complete UI suite**

Run:

~~~powershell
npm.cmd test -- tests/ui
~~~

Expected: all UI files pass. Do not weaken assertions that prototype controls remain network-free.

- [ ] **Step 2: Run the complete automated gates**

Run:

~~~powershell
npm.cmd test
npm.cmd run typecheck
~~~

Expected: the complete Vitest suite and strict TypeScript pass.

- [ ] **Step 3: Stop the stack safely and build**

Run:

~~~powershell
docker compose down
npm.cmd run build
docker compose config --quiet
~~~

Expected: production build and Compose validation exit 0. No volume is deleted.

- [ ] **Step 4: Rebuild and restart the local stack**

Run:

~~~powershell
docker compose up --build -d
docker compose ps
~~~

Expected:

- app and worker are Up;
- postgres is healthy;
- http://localhost:3000 is mapped to the app.

- [ ] **Step 5: Verify desktop measurements**

At 1536 × 1024 on /generate, evaluate:

~~~js
(() => {
  const rect = (selector) => {
    const box = document.querySelector(selector).getBoundingClientRect();
    return {
      top: Math.round(box.top),
      bottom: Math.round(box.bottom),
      height: Math.round(box.height)
    };
  };

  return {
    parameters: rect(".generation-parameters"),
    submit: rect(".generation-submit"),
    recent: rect(".recent-generations"),
    usage: rect(".todays-usage"),
    horizontalOverflow:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  };
})()
~~~

Acceptance thresholds:

~~~text
Parameters top <= 120px
Generate top   <= 900px
Recent top     <= 1000px
Usage top      <= 1000px
horizontalOverflow = false
~~~

If a threshold fails, inspect the responsible box before editing. Only these density values may be tightened in one final pass:

~~~text
positive prompt min-height: 170px -> 160px
preview image max-height:   390px -> 370px
desktop row-gap:             14px -> 12px
parameter child gap:         10px -> 8px
~~~

Re-run the focused CSS test and browser measurement after any such change.

- [ ] **Step 6: Verify the exact responsive widths**

At 1279, 1023, 767, and 375px verify:

- 1279px keeps the 80px icon rail, stacked Prompt/Preview main region, and upper Parameters region;
- 1023px restores the sequence Toolbar → Prompt → Preview → Parameters → Recent → Usage;
- 767px and 375px retain the mobile drawer and one-column layout;
- no tested width has page-level horizontal overflow;
- all visible audited buttons, links, selects, and tabs at 375px are at least 44px;
- browser console contains no errors.

- [ ] **Step 7: Verify control behavior in the browser**

Check:

- every Resolution option shows the readable label but View Code uses the raw value;
- Style buttons update aria-pressed locally;
- the Safety Filter switch toggles with mouse and Space;
- Guidance displays 1 and 20 endpoints;
- Enhance Prompt opens the same Interface preview dialog and creates no network request;
- Generate still sends no prototype fields.

- [ ] **Step 8: Capture before and after evidence**

Preserve the existing current screenshot:

~~~text
.gstack/recommendation-create-1536-current.png
~~~

Capture:

~~~text
.gstack/create-fidelity-1536-after.png
.gstack/create-fidelity-1279-after.png
.gstack/create-fidelity-1023-after.png
.gstack/create-fidelity-375-after.png
~~~

Read each screenshot after capture and compare hierarchy, density, control placement, and mobile regression.

- [ ] **Step 9: Run the final Git safety audit**

Run:

~~~powershell
git status --short --branch
git diff --check
git diff --cached --name-only
git diff --stat
~~~

Expected:

- no staged files;
- no commits created;
- no secrets, generated images, database data, or outer-checkout files added;
- only the Create source/tests, this new spec, and this new plan are new for this pass;
- git diff --check exits 0, aside from possible Windows line-ending warnings.

## Completion Criteria

This plan is complete only when:

1. the source implements the approved desktop composition rather than only a browser-injected prototype;
2. all acceptance thresholds are proven by fresh browser measurements;
3. readable resolution labels preserve raw request values;
4. Style, Safety Filter, Guidance, and Enhance Prompt remain prototype-only and accessible;
5. all automated gates pass;
6. every required responsive width is rechecked;
7. no files outside the feature worktree are modified;
8. no staged or committed changes exist.
