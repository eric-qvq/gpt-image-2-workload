# Create Desktop Fidelity Pass Design

## Purpose

Bring the desktop Create page closer to the approved `gpt-image-2 interface.png` reference without changing any real generation behavior. The current application is functionally complete and its mobile layouts are already verified. This pass addresses the remaining evidence-backed gap: the desktop Create page is substantially taller and less dense than the reference, so the Generate action and lower content are not visible in the first `1536 × 1024` viewport.

Current measurements at `1536 × 1024`:

- the Create heading ends near `213px`;
- the toolbar ends near `333px`;
- Prompt and Preview begin near `351px` and end near `1048px`;
- Parameters begins near `351px`, extends beyond `1190px`, and places Generate below the viewport;
- Recent Generations and Today's Usage begin near `1215px`.

The reference establishes a denser hierarchy in which Parameters starts beside the main heading area and both the primary action and lower content are visible much earlier.

## Scope

This pass is limited to the runnable feature worktree and the authenticated `/generate` interface. It may adjust Create-specific React structure, presentation-only controls, CSS, and UI tests.

It must not modify:

- API routes or request schemas;
- Prisma models or database data;
- provider adapters, worker behavior, polling, archive, storage, History, Download, or Reuse behavior;
- quota, billing, usage, notification, region, or generation-time data;
- the 2026-07-10 or 2026-07-12 design specifications;
- plans dated 2026-07-11 or earlier;
- the outer coordination checkout.

No commit, staging, push, merge, reset, clean, or worktree cleanup is part of this pass.

## Recommended Approach

Use a focused structural and visual pass rather than a full page rewrite or a CSS-only squeeze.

The page keeps the existing `GenerateWorkspace` state and network boundary. A Create-specific layout wrapper coordinates the page heading, toolbar, editor, Parameters, Recent Generations, and Today's Usage. Existing components remain responsible for their current behavior.

The outer desktop composition has two visual regions:

1. **Primary region:** heading, model/resolution toolbar, Prompt and Preview, then Recent Generations.
2. **Secondary region:** Parameters, then Today's Usage.

CSS grid and narrowly scoped wrapper classes may flatten existing layout boxes where useful, but no absolute positioning or JavaScript measurement may be used. The Parameters panel should visually start near the heading/toolbar area instead of only after the full-width toolbar.

## Desktop Layout

At `1280px` and wider:

- retain the full 248px application sidebar;
- use a flexible primary region plus a 332px Parameters region;
- keep Prompt at approximately 300–312px and let Preview consume the remaining primary width;
- align Parameters with the upper Create composition;
- reduce excessive vertical gaps and panel padding while preserving the 8px spacing rhythm;
- target a first viewport where Generate is visible and at least the Recent Generations/Today's Usage headings begin within `1536 × 1024`;
- keep real images contained without cropping, stretching, or replacing them with samples.

This is a density target, not a fixed-height canvas. Long provider names, error messages, generated status text, and image aspect ratios must still expand naturally.

## Control Fidelity

Presentation-only changes may improve reference fidelity while preserving state contracts:

- **Resolution:** display `1024 × 1024 (1:1)`, `1536 × 1024 (3:2)`, and `1024 × 1536 (2:3)` while retaining the existing raw values as connected request values.
- **Style:** render Auto, Vivid, and Natural as an accessible segmented group backed only by `PrototypeGenerationParameters.style`.
- **Safety Filter:** retain a native checkbox and style its label as a switch, preserving native checked and keyboard semantics while updating only `PrototypeGenerationParameters.safetyFilter`.
- **Enhance Prompt:** present it as a wider secondary action beneath the primary prompt area, while retaining the existing preview dialog and zero-network behavior.
- **Guidance:** retain the current range input and display its existing `1` and `20` limits as compact endpoint labels.

Standard, High, Count, Delivery, provider ID, model ID, and resolution remain the only existing connected generation fields. Ultra, Style, Seed, Guidance, Output Format, Safety Filter, Negative Prompt, Templates, Enhance Prompt, Upscale, and Variations remain interface-preview state and must never enter a request body.

## Responsive Behavior

- `1280px+`: full high-density desktop composition.
- `1024–1279px`: icon rail, flexible main region, and narrower Parameters region; Prompt and Preview may stack as already specified.
- `768–1023px`: preserve the verified single sequence of toolbar, Prompt, Preview, Parameters, Recent Generations, and Today's Usage.
- below `768px`: preserve the current mobile drawer, single-column order, square preview, full-width actions, 44px touch targets, and zero horizontal overflow.

The pass must not regress the nine-route mobile audit that currently reports no horizontal overflow, no undersized visible buttons/links/tabs, and no console errors at 375px.

## Accessibility and Truthfulness

- Segmented controls use buttons with `aria-pressed` inside named groups.
- The Safety Filter switch preserves native checkbox semantics, checked state, Space-key behavior, and an associated visible label.
- Focus rings remain visible and keyboard order follows the rendered reading order.
- Every interactive target remains at least 44px on touch layouts.
- Prototype boundaries remain visible; compacting the explanation must not make unsupported controls appear connected.
- No sample usage numbers, quota percentages, prices, reset timers, secret keys, generated rows, or invented images may be introduced.

## Expected Files

Likely modifications are limited to:

- `src/app/generate/page.tsx`;
- `src/components/generate/GenerateWorkspace.tsx`;
- `src/components/generate/CreateToolbar.tsx`;
- `src/components/generate/PromptComposer.tsx`;
- `src/components/settings/ParameterPanel.tsx`;
- `src/app/globals.css`;
- focused tests under `tests/ui/`.

Other files may be inspected but should not be changed unless a failing focused test proves they are directly required.

## Testing Strategy

Use test-first, incremental changes:

1. Extend UI tests for readable resolution labels, segmented Style state, Safety Filter semantics, Enhance Prompt placement, and unchanged request payloads.
2. Extend the CSS contract for the Create-specific desktop wrapper, upper Parameters placement, breakpoint restoration, and compact desktop values.
3. Run focused Create tests after each behavior or CSS group.
4. Run the complete UI suite, full Vitest suite, strict TypeScript, production build, and Compose configuration.
5. Rebuild the local stack and verify `1536`, `1279`, `1023`, `767`, and `375px` in the browser.
6. Capture before/after screenshots and measure the first-screen positions of Parameters, Generate, Recent Generations, and Today's Usage.

Existing request-boundary tests must continue to prove that prototype values do not appear in generation payloads.

## Acceptance Criteria

- The desktop Create page is visibly denser and closer to the reference hierarchy.
- Parameters starts in the upper desktop composition rather than below the complete full-width toolbar flow.
- Generate is visible within a normal `1536 × 1024` first viewport for the current configured state.
- Recent Generations and Today's Usage begin substantially earlier than the current approximately `1215px` position, with their headings visible or immediately reachable in the first viewport.
- Resolution labels are human-readable without changing submitted values.
- Style and Safety Filter visually match the reference more closely while remaining prototype-only.
- Enhance Prompt remains network-free and visually belongs to the prompt workflow.
- Real generation, polling, archive, Download, History, Reuse, provider/model selection, and reset behavior remain unchanged.
- All existing automated gates pass.
- The nine-route 375px audit remains free of horizontal overflow, undersized audited controls, and console errors.
- Only files inside the feature worktree are modified, with no staged or committed changes.
