# Create First-Viewport Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the truthful desktop sidebar controls and useful Recent Generations content into the first `1536 × 1024` viewport without changing generation behavior or verified responsive flows.

**Architecture:** Keep the existing shell, Create DOM, state, and request boundaries. Use one small ParameterPanel disclosure restructure plus scoped CSS: pin the full desktop sidebar beneath the header, compact only the `1280px+` Create composition, and collapse the existing request summary and prototype explanation behind an always-truthful native disclosure.

**Tech Stack:** Next.js 15 App Router, React 19, strict TypeScript, Vitest 2, Testing Library, CSS, Docker Compose, gstack browse.

---

## Safety and Execution Rules

- Work only in `C:\Users\29800\Desktop\gpt-image-2-workload\.worktrees\gpt-image-platform`.
- Preserve every existing tracked and untracked change.
- Never run `git reset`, `git clean`, `git checkout --`, `git add`, `git commit`, `git push`, `git merge`, or worktree cleanup commands.
- Do not modify the outer checkout or any specification/plan created before this pass.
- Do not modify API routes, Prisma, providers, jobs, worker, history, archive, storage, or generated images.
- Do not invent quota, usage, timing, region, model, or generation data.
- Use `npm.cmd` and `npx.cmd` in PowerShell.
- Before a production build, use `docker compose down` only. Never use `docker compose down -v`.
- Run the host production build before rebuilding Compose because the host and containers share `.next`.

## File Map

- Modify: `src/components/settings/ParameterPanel.tsx`
  - Keep connected/prototype state unchanged; move existing truth blocks inside Advanced delivery and add a visible compact hint.
- Modify: `src/app/globals.css`
  - Add disclosure styling, sticky full-desktop sidebar rules, and scoped Create density rules.
- Modify: `tests/ui/ParameterPanel.test.tsx`
  - Prove the request summary and full prototype boundary belong to the disclosure while the compact hint remains visible.
- Modify: `tests/ui/GlobalStyles.test.ts`
  - Prove the desktop sidebar and Create first-viewport CSS contract.
- Inspect only: `tests/ui/GenerateWorkspace.test.tsx`
  - Preserve its request-body boundary coverage.

## Task 0: Record the Current Runtime Baseline

**Files:**
- Inspect only: current Git state and `http://localhost:3000/generate`.

- [ ] **Step 1: Verify the feature boundary**

Run:

```powershell
Get-Content -LiteralPath "C:\Users\29800\.gstack\freeze-dir.txt" -Raw
git branch --show-current
git status --short --branch
```

Expected:

```text
C:/Users/29800/Desktop/gpt-image-2-workload/.worktrees/gpt-image-platform/
feature/gpt-image-platform
```

The dirty worktree is expected and must not be normalized.

- [ ] **Step 2: Run the focused baseline**

Run:

```powershell
npm.cmd test -- tests/ui/ParameterPanel.test.tsx tests/ui/GlobalStyles.test.ts tests/ui/GenerateWorkspace.test.tsx tests/ui/GeneratePage.test.tsx
npm.cmd run typecheck
```

Expected: all selected tests pass and TypeScript exits 0 before new source edits.

- [ ] **Step 3: Capture exact desktop positions**

At `1536 × 1024` on `/generate`, evaluate:

```js
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
    sidebar: rect(".app-sidebar"),
    sidebarNav: rect(".sidebar-nav"),
    sidebarFooter: rect(".sidebar-footer"),
    editor: rect(".generation-editor"),
    parameters: rect(".generation-parameters"),
    submit: rect(".generation-submit"),
    recent: rect(".recent-generations"),
    usage: rect(".todays-usage"),
    horizontalOverflow:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  };
})()
```

Expected current evidence: editor around `334px`, submit around `856px`, Recent/Usage around `941px`, and the sidebar footer below the first viewport.

- [ ] **Step 4: Preserve a before screenshot**

Capture:

```text
.gstack/create-first-viewport-1536-before.png
```

Read the image after capture and verify it shows the current blank lower sidebar area and only the Recent/Usage headings near the viewport bottom.

## Task 1: Put the Truth Blocks Inside Advanced Delivery

**Files:**
- Modify: `tests/ui/ParameterPanel.test.tsx`
- Modify: `src/components/settings/ParameterPanel.tsx`

- [ ] **Step 1: Add failing disclosure-ownership assertions**

In `renders connected and prototype controls with a truthful request summary`, replace the two standalone text assertions with:

```tsx
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
```

Keep the existing control semantics and state assertions.

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```powershell
npm.cmd test -- tests/ui/ParameterPanel.test.tsx
```

Expected: FAIL because the compact hint does not exist and the request/prototype paragraphs are siblings of `details`.

- [ ] **Step 3: Add the compact disclosure summary**

Replace the current summary with:

```tsx
<summary>
  <span>Advanced delivery</span>
  <small>Interface-only controls are not sent</small>
</summary>
```

- [ ] **Step 4: Move the existing truth blocks into the disclosure**

Immediately after the inner Advanced delivery `.setting-stack`, before `</details>`, place:

```tsx
<p className="parameter-summary">
  Sent: {qualityLabel(connected.quality)} · {deliveryLabel} · {countLabel}
</p>
<p className="prototype-notice">
  Interface preview · Ultra, Style, Seed, Guidance, Output Format, and
  Safety Filter are not sent to the provider.
</p>
```

Remove the identical two paragraphs from below the outer `.setting-stack`. Leave the Generate button in its current outer position.

- [ ] **Step 5: Verify disclosure behavior and state boundaries**

Run:

```powershell
npm.cmd test -- tests/ui/ParameterPanel.test.tsx tests/ui/GenerateWorkspace.test.tsx
npm.cmd run typecheck
```

Expected:

- the native disclosure is closed by default;
- its visible summary names the interface-only boundary;
- Count and Delivery still become interactive after opening it;
- connected and prototype updates remain separated;
- the generation request still excludes prototype fields;
- TypeScript exits 0.

## Task 2: Lock the Desktop CSS Contract

**Files:**
- Modify: `tests/ui/GlobalStyles.test.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add a failing sticky-sidebar contract test**

After the existing `1280px and wider` density test, add:

```ts
it("keeps truthful full-desktop sidebar controls inside the viewport", () => {
  const media = getMinWidthMediaBody(styles, 1280) ?? "";
  const shellBody = getDeclarations(media, ".app-shell-body");
  const sidebar = getDeclarations(media, ".app-sidebar");
  const footer = getDeclarations(styles, ".sidebar-footer");

  expect(media).not.toBe("");
  expect(normalizeValue(shellBody.get("min-height"))).toContain("100dvh - 68px");
  expect(normalizeValue(sidebar.get("position"))).toBe("sticky");
  expect(normalizeValue(sidebar.get("top"))).toBe("68px");
  expect(normalizeValue(sidebar.get("height"))).toContain("100dvh - 68px");
  expect(normalizeValue(sidebar.get("overflow-y"))).toBe("auto");
  expect(normalizeValue(footer.get("margin-top"))).toBe("auto");
});
```

- [ ] **Step 2: Tighten the failing high-density assertions**

In `uses the verified high-density Create values at 1280px and wider`, add declarations for:

```ts
const pageLayout = getDeclarations(media, ".create-page-layout");
const heading = getDeclarations(
  media,
  ".create-page-layout > .create-page-heading"
);
const eyebrow = getDeclarations(
  media,
  ".create-page-layout .create-page-heading .eyebrow"
);
const title = getDeclarations(
  media,
  ".create-page-layout .create-page-heading h1"
);
const headingCopy = getDeclarations(
  media,
  ".create-page-layout .create-page-heading .muted"
);
const toolbar = getDeclarations(media, ".create-page-layout .create-toolbar");
```

Add assertions:

```ts
expect(normalizeValue(pageLayout.get("row-gap"))).toBe("10px");
expect(normalizeValue(heading.get("gap"))).toBe("2px");
expect(normalizeValue(eyebrow.get("display"))).toBe("none");
expect(normalizeValue(title.get("font-size"))).toBe("30px");
expect(normalizeValue(headingCopy.get("max-width"))).toBe("none");
expect(normalizeValue(toolbar.get("padding"))).toBe("10px 14px");
```

Change the existing positive prompt and preview image thresholds to:

```ts
expect(Number.parseFloat(prompt.get("min-height") ?? ""))
  .toBeLessThanOrEqual(160);
expect(Number.parseFloat(previewImage.get("max-height") ?? ""))
  .toBeLessThanOrEqual(370);
```

- [ ] **Step 3: Add a failing disclosure-summary style test**

Add:

```ts
it("keeps the compact request boundary readable and touch accessible", () => {
  const summary = getDeclarations(styles, ".advanced-delivery summary");
  const hint = getDeclarations(styles, ".advanced-delivery summary small");

  expect(normalizeValue(summary.get("display"))).toBe("grid");
  expect(Number.parseFloat(summary.get("min-height") ?? "0"))
    .toBeGreaterThanOrEqual(44);
  expect(normalizeValue(hint.get("font-size"))).toBe("11px");
  expect(Number.parseFloat(hint.get("line-height") ?? "0"))
    .toBeGreaterThanOrEqual(1.2);
});
```

- [ ] **Step 4: Run the CSS test and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/GlobalStyles.test.ts
```

Expected: FAIL for the missing sticky-sidebar, compact heading, tighter density, and disclosure-summary rules.

- [ ] **Step 5: Style the compact disclosure summary**

Extend the existing `.advanced-delivery summary` rule with:

```css
display: grid;
align-content: center;
gap: 2px;
```

Add:

```css
.advanced-delivery summary small {
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
}
```

Keep the existing 44px minimum height, border, and open-state behavior.

- [ ] **Step 6: Add the full-desktop sidebar rules**

At the start of the existing `@media (min-width: 1280px)` block, add:

```css
.app-shell-body {
  min-height: calc(100dvh - 68px);
}

.app-sidebar {
  position: sticky;
  top: 68px;
  align-self: start;
  height: calc(100dvh - 68px);
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

- [ ] **Step 7: Add the compact Create desktop rules**

Inside the same `@media (min-width: 1280px)` block, add or update:

```css
.create-page-layout {
  row-gap: 10px;
}

.create-page-layout > .create-page-heading {
  gap: 2px;
}

.create-page-layout .create-page-heading .eyebrow {
  display: none;
}

.create-page-layout .create-page-heading h1 {
  font-size: 30px;
}

.create-page-layout .create-page-heading .muted {
  max-width: none;
  line-height: 1.4;
}

.create-page-layout .create-toolbar {
  padding: 10px 14px;
}

.create-page-layout .prompt-panel textarea[rows="5"] {
  min-height: 160px;
}

.create-page-layout .initial-preview-result img {
  max-height: 370px;
}
```

Do not add these values to the base rules or the `max-width` media blocks.

- [ ] **Step 8: Verify the focused CSS and UI gates**

Run:

```powershell
npm.cmd test -- tests/ui/GlobalStyles.test.ts tests/ui/ParameterPanel.test.tsx tests/ui/GenerateWorkspace.test.tsx tests/ui/GeneratePage.test.tsx
npm.cmd run typecheck
```

Expected: all selected tests pass and TypeScript exits 0.

## Task 3: Verify the Whole Application

**Files:**
- Modify only if a focused regression proves a defect in the two source files listed above.

- [ ] **Step 1: Run the complete UI suite**

Run:

```powershell
npm.cmd test -- tests/ui
```

Expected: all UI test files pass.

- [ ] **Step 2: Run all automated gates**

Run:

```powershell
npm.cmd test
npm.cmd run typecheck
```

Expected: the complete Vitest suite and strict TypeScript pass.

- [ ] **Step 3: Stop the stack safely and build**

Run:

```powershell
docker compose down
npm.cmd run build
docker compose config --quiet
```

Expected: no volume is deleted; build and Compose validation exit 0.

- [ ] **Step 4: Rebuild and restart Compose**

Run:

```powershell
docker compose up --build -d
docker compose ps
```

Expected: app and worker are Up, Postgres is healthy, and port 3000 is mapped.

## Task 4: Verify the First Viewport and Responsive Regressions

**Files:**
- Capture evidence only under `.gstack/`.

- [ ] **Step 1: Measure the desktop acceptance contract**

At `1536 × 1024`, evaluate the Task 0 measurement script and verify:

```text
sidebarFooter.bottom <= 1024
sidebarNav.bottom <= sidebarFooter.top
editor.top <= 290
parameters.top <= 110
submit.top <= 790
recent.top <= 885
usage.top <= 885
horizontalOverflow = false
```

If one threshold fails, inspect the responsible box before editing. Permitted final adjustments are limited to:

```text
Create row gap:       10px -> 8px
Toolbar vertical pad: 10px -> 8px
Positive prompt:     160px -> 150px
Preview max height:  370px -> 350px
Parameter child gap:   8px -> 6px
```

After any adjustment, update the exact CSS contract assertion and rerun the focused tests before remeasuring.

- [ ] **Step 2: Verify disclosure behavior in the browser**

Check:

- `Advanced delivery` is closed by default;
- `Interface-only controls are not sent` remains visible while closed;
- opening the disclosure reveals Count, Delivery, the exact Sent summary, and the complete prototype list;
- changing Style, Guidance, Output Format, or Safety Filter still does not add those keys to View Code;
- Generate remains associated with the prompt form.

- [ ] **Step 3: Verify exact responsive widths**

At 1279, 1023, 767, and 375px verify:

- 1279px retains the 80px icon rail and hides the desktop sidebar footer;
- 1023px retains Toolbar → Prompt → Preview → Parameters → Recent → Usage;
- 767px and 375px retain the mobile drawer and show the sidebar footer inside it;
- no width has page-level horizontal overflow;
- visible audited buttons, links, selects, and tabs at 375px remain at least 44px;
- browser console contains no errors.

- [ ] **Step 4: Capture and read after screenshots**

Capture:

```text
.gstack/create-first-viewport-1536-after.png
.gstack/create-first-viewport-1279-after.png
.gstack/create-first-viewport-1023-after.png
.gstack/create-first-viewport-375-after.png
```

Read every screenshot and compare sidebar visibility, heading density, Generate placement, Recent content visibility, and mobile regressions against the before image and approved reference.

- [ ] **Step 5: Run the final Git safety audit**

Run:

```powershell
git status --short --branch
git diff --check
git diff --cached --name-only
git status --short -- src/components/settings/ParameterPanel.tsx src/app/globals.css tests/ui/ParameterPanel.test.tsx tests/ui/GlobalStyles.test.ts docs/superpowers/specs/2026-07-13-create-first-viewport-polish-design.md docs/superpowers/plans/2026-07-13-create-first-viewport-polish.md
```

Expected:

- no staged files and no commits created;
- no outer-checkout, API, database, provider, worker, archive, history, storage, or generated-image files changed by this pass;
- `git diff --check` exits 0 apart from possible Windows line-ending warnings;
- the pass is limited to the two source files, two focused tests, new spec, and new plan.

## Completion Criteria

This plan is complete only when:

1. truthful sidebar footer controls are visible in the full desktop viewport;
2. Advanced delivery retains an always-visible interface-only warning and exposes the full truth blocks when opened;
3. Prompt/Preview, Generate, Recent Generations, and Today's Usage meet the measured desktop thresholds;
4. connected and prototype request boundaries remain unchanged;
5. 1279, 1023, 767, and 375px responsive behavior remains verified;
6. the complete test, typecheck, build, Compose, browser, screenshot, and Git gates pass;
7. no file outside the feature worktree is modified and no staged or committed changes exist.
