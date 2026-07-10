# GPT Image Workbench Reference UI Redesign

## Goal

Replace the current dark glass-style frontend with a light, high-density application shell inspired by `gpt-image-2 interface.png`. The redesign must make the product feel like one coherent image-generation console while preserving the working authentication, provider, generation, worker, archive, history, download, and reuse flows.

## Scope

Apply a shared authenticated shell to `/`, `/generate`, `/history`, and `/admin/providers`. Keep `/login` outside the shell but align it with the same visual system. The Create page receives the largest structural change: a prompt column, a central result preview, a parameters column, and a compact recent-generations row.

Only expose routes and controls backed by the current application. The navigation contains Overview, Create, History, and Provider Admin. Generation controls remain Provider, Model, Size, Quality, Count, and Response Format.

Do not add placeholder links or simulated data for Quota, Usage, Billing, Batch Jobs, Dataset, API Keys, Region, Notifications, Templates, Negative Prompt, Style, Seed, Guidance, Safety Filter, Upscale, or Variations. Those require separate product and backend work.

## Visual System

- Use a light neutral canvas (`#f7f8fc`), white surfaces, subtle gray borders, and dark text.
- Use indigo as the single primary accent, with pale indigo active states and accessible focus rings.
- Prefer borders over large shadows. Cards use 10-12px radii; inputs use 8-10px radii.
- Use the local system font stack rather than a network font dependency.
- Desktop shell: approximately 68px header, 248px sidebar, and a fluid content area.
- Main spacing follows an 8px rhythm, with compact 40-44px controls and clear 12-14px labels.
- Use small inline SVG icons so the redesign introduces no icon-library dependency.

## Application Shell

Create a reusable `AppShell` composed of a top header, `SidebarNav`, and content viewport. `SidebarNav` is a client component using the current pathname to expose `aria-current="page"`. It links only to the four real routes.

The header shows the GPT Image Workbench brand, a lightweight worker-mode indicator, the authenticated role, and the existing logout action. It must not invent a quota, account email, notification count, or usage data that the current session does not provide.

Overview, Create, History, and Provider Admin render inside the shell. The existing per-page `BackButton` and repeated navigation button rows are removed from authenticated pages once the shared shell is present. Login remains a focused standalone card with the seeded-account hint and existing form behavior.

## Create Workspace

The Create page keeps its server-side session guard, provider/model query, and history-reuse query parameters. It also loads up to six recent archived assets for the authenticated user through the existing history repository.

The desktop workbench uses three columns:

1. **Prompt column:** active provider/model summary, prompt textarea, character count, disabled-state alert, and concise generation guidance.
2. **Preview column:** empty canvas before generation; queued, running, archiving, failed, and successful states after submission; real archived images only. Successful images expose Download and History actions.
3. **Parameters column:** controlled Provider, Model, Size, Quality, Count, and Response Format controls. Quality uses a segmented treatment while other fields remain accessible native controls. The primary Generate button visually sits at the bottom of this panel but submits the existing prompt form through a stable form ID.

Below the desktop workbench, `RecentGenerations` displays real archived images from the current user. If there are no assets, show a compact empty state instead of sample images.

## Data Flow and Behavior Preservation

`GenerateWorkspace` remains the state and network coordinator. It must continue to:

- validate and initialize provider/model selections, including history reuse parameters;
- reset the model when the provider changes;
- create a conversation, create a queued generation job, and send `size`, `quality`, `count`, and `responseFormat`;
- poll the job and map queued/running/succeeded/failed/archive states;
- show archived image assets and the existing HTML-provider/Base-URL error guidance;
- disable submission with an accessible alert when no provider or model is available.

No API contract, Prisma model, worker behavior, or provider adapter changes are part of this redesign.

## Other Routes

- **Overview:** replace the oversized hero with a compact welcome header and cards linking to Create, History, and Provider Admin. Capability summaries use truthful labels only.
- **History:** retain pagination, current-page filtering, total counts, image lightbox, download, and full reuse parameters. Restyle the toolbar, cards, and modal to match the shell.
- **Provider Admin:** retain authentication, provider table, create/edit forms, model form, required-field validation, API error text, and `router.refresh()` behavior. Reorganize these into clear white cards without changing CRUD behavior.
- **Login:** retain the existing endpoint, redirect, validation, and local account hint; update only layout and visual styling.

## Responsive Behavior

- At widths below roughly 1280px, collapse the sidebar to an icon rail and combine prompt with the preview column.
- Below 1024px, stack the parameters panel beneath the main creation area.
- Below 768px, use a single column, a compact top bar, horizontally scrollable navigation where needed, a square preview, and a full-width Generate action.
- The page must not create horizontal scrolling at 375px viewport width.

## Error Handling and Accessibility

Preserve semantic labels such as Prompt, Generation parameters, Image history, and Image preview. All navigation and controls must be keyboard reachable. Focus states must remain visible against the light palette. Status cannot rely on color alone. Existing alerts and provider errors remain readable and are not replaced with generic toast text.

## Testing and Verification

- Preserve and update existing UI tests for prompt submission, polling, status rendering, history reuse, parameter changes, and missing provider/model states.
- Add shell navigation coverage for real links and active-route semantics.
- Expand parameter tests across every supported control.
- Add or extend image-grid coverage for empty state, lightbox close behavior, download, and reuse URLs.
- Run focused UI tests, then the full Vitest suite, typecheck, and production build.
- Start Docker Compose and capture desktop and mobile screenshots of the redesigned Create page. Compare them against the reference for layout hierarchy, density, color, and control placement, not unsupported feature parity.

## Change Safety

The feature worktree already contains substantial uncommitted user work, including an untracked `globals.css`, navigation component, and UI test. Implementation must use small patches, preserve existing business changes, and never reset or replace the worktree wholesale.

## Acceptance Criteria

The authenticated routes share one light application shell; Create visibly matches the reference's three-part workflow; all displayed controls are backed by current behavior; generation, status polling, archive display, history, download, reuse, and provider administration still work; desktop and mobile layouts are usable; and no fake links or sample usage data are introduced.
