# Create First-Viewport Polish Design

## Purpose

Finish the remaining desktop fidelity work on the authenticated Create page. The previous pass established the correct three-column composition and accessible prototype controls, but the first `1536 × 1024` viewport still differs from the approved reference in two visible ways:

- the real Language, Current Model, and Region controls exist in the sidebar but are pushed to the bottom of the long document instead of the bottom of the viewport;
- the Prompt/Preview row begins around `334px` and Recent Generations begins around `941px`, so the first viewport shows only the lower-section headings rather than useful image content.

This pass improves the first-screen composition without changing the product identity, generation behavior, stored data, or mobile flow.

## Scope and Safety Boundary

Work is limited to `C:\Users\29800\Desktop\gpt-image-2-workload\.worktrees\gpt-image-platform` on `feature/gpt-image-platform`.

The pass may modify:

- `src/components/settings/ParameterPanel.tsx`;
- `src/app/globals.css`;
- focused UI tests for the parameter structure and CSS contract.

It must not modify APIs, Prisma, providers, jobs, worker, history, archive, storage, generated images, or the outer coordination checkout. Existing tracked and untracked changes must be preserved. No staging, commit, push, merge, reset, clean, or worktree cleanup is authorized.

## Recommended Composition

### Desktop Sidebar

At `1280px` and wider, the application body should occupy at least the viewport height below the 68px header. The sidebar should remain sticky beneath the header, use the remaining viewport height, and scroll internally only if its truthful controls do not fit.

This keeps Language, Current Model, and Region visible in the lower-left area as shown by the reference. It does not invent a remote region or add a Change action: the existing `Local` value and current model remain authoritative.

The existing 80px icon rail at `1024–1279px` and mobile drawer below `768px` remain unchanged.

### Compact Create Heading and Editor

At `1280px` and wider only:

- hide the decorative `Workbench` eyebrow on the Create page;
- render the Create `h1` at 30px;
- allow the truthful supporting sentence to use the full primary column so it remains on one line when space permits;
- reduce the Create grid row gap from 14px to 10px;
- reduce toolbar padding to `10px 14px`;
- use the previously validated final density values of 160px for the positive prompt and 370px for the preview image maximum.

The DOM, heading semantics, copy, model and resolution controls, real image containment, and View Code behavior remain unchanged. At 1279px and below, the current heading, toolbar, and sequential reading order remain intact.

### Compact Request Boundary

The current Parameters panel renders three consecutive blocks after its controls: Advanced delivery, a connected request summary, and a multi-line prototype notice. Together they add roughly the height that separates the current page from the reference.

Keep Advanced delivery as the disclosure boundary, but make its always-visible summary communicate both concepts:

- primary label: `Advanced delivery`;
- compact hint: `Interface-only controls are not sent`.

Move the existing connected request summary and full prototype explanation inside the disclosure after Count and Delivery. When closed, users still see the truthful interface-only warning. When opened, they see the real connected fields, exact sent values, and complete list of controls excluded from the provider request.

No state, request type, request builder, or control ownership changes. Ultra, Style, Seed, Guidance, Output Format, and Safety Filter remain prototype-only. Count and Delivery remain connected.

## Accessibility

- Advanced delivery remains a native `details`/`summary` disclosure.
- The summary hint is visible text, not a tooltip-only explanation.
- Existing keyboard behavior, focus rings, native checkbox semantics, and 44px action targets remain intact.
- Sidebar internal scrolling must not trap keyboard focus or hide the mobile drawer footer.
- Heading semantics remain `h1`; only desktop presentation changes.

## Responsive Contract

- `1280px+`: sticky full sidebar, compact Create heading, compact request disclosure, and high-density editor.
- `1024–1279px`: retain the 80px icon rail, stacked Prompt/Preview main area, hidden sidebar footer, and upper Parameters column.
- `768–1023px`: preserve Toolbar → Prompt → Preview → Parameters → Recent → Usage.
- below `768px`: preserve the mobile drawer, sidebar footer inside the drawer, single-column layout, square preview, 44px targets, and zero horizontal overflow.

## Acceptance Criteria

At `1536 × 1024` with the current real preview asset:

- sidebar footer is visible inside the viewport and does not overlap navigation;
- Parameters top is `≤110px`;
- Generate top is `≤790px`;
- Prompt/Preview begins at `≤290px`;
- Recent Generations and Today's Usage begin at `≤885px`;
- no page-level horizontal overflow exists;
- full connected and prototype explanations remain available after opening Advanced delivery.

At 1279, 1023, 767, and 375px, existing layout ordering, drawer behavior, touch targets, and no-overflow guarantees remain unchanged.

## Verification

Use test-first changes for the disclosure structure and CSS contract. Then run:

- focused ParameterPanel and GlobalStyles tests;
- the complete UI suite;
- the full Vitest suite;
- strict TypeScript;
- the Next.js production build;
- Docker Compose config and rebuilt local stack;
- browser measurements and screenshots at 1536, 1279, 1023, 767, and 375px.

Request-boundary tests must continue to prove that prototype fields never enter the generation payload.
