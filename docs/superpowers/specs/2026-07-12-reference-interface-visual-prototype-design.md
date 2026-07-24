# GPT Image Workbench Reference Interface Visual Prototype

## Status and Document Priority

This specification records the user-approved direction from 2026-07-12. It adds a complete, interactive visual prototype for the controls and destinations visible in `gpt-image-2 interface.png` while preserving the application's working generation flows.

The 2026-07-10 specification remains frozen. Where the two documents conflict, this specification takes precedence for visible navigation, prototype controls, and route scope. The older specification remains authoritative for authentication, provider security, generation jobs, worker processing, archiving, history, download, reuse, and error preservation. Plans dated 2026-07-11 or earlier remain historical and must not be edited or re-executed.

## Goal

Make the application visibly match the reference interface before implementing every referenced business capability. Users must be able to see and interact with the complete shell, Create controls, and secondary pages. Unsupported controls change local frontend state, open panels, and show feedback, but they must not call an API, write to the database, or claim that work succeeded.

The prototype must not fabricate jobs, datasets, API keys, quota percentages, usage totals, billing amounts, regions, notifications, or generated images. Missing values use `—`, `Not connected`, or `Local` as appropriate.

## Product Boundary

### Connected behavior

The following remain connected to the existing application:

- login, logout, JWT sessions, and ADMIN/MEMBER authorization;
- Provider and Model storage and administration;
- model selection, with the selected model determining its Provider;
- resolution, Standard/High quality, count, and URL/Base64 JSON delivery;
- prompt submission, job creation, worker polling, archive states, and errors;
- real archived-image preview, Recent Generations, History, Download, and Reuse.

### Interface-preview behavior

The following are interactive visual previews only:

- Batch Jobs, Dataset, API Keys, Usage & Billing, and most Settings actions;
- Quota, notification, and account popovers beyond real session information;
- Templates, Enhance Prompt, Negative Prompt, View Code, Upscale, and Variations;
- Ultra quality, Style, Seed, Guidance Scale, PNG/JPEG/WebP output format, and Safety Filter.

Every preview surface must explain its boundary in plain language. Preview state is frontend-only and resets on a full reload. It must never be added to the real generation request until separate backend work is designed and approved.

## Routes and Navigation

The authenticated sidebar contains these destinations in this order:

1. Overview — `/`
2. Create — `/generate`
3. History — `/history`
4. Batch Jobs — `/batch-jobs`
5. Dataset — `/dataset`
6. Models — `/models`
7. API Keys — `/api-keys`
8. Usage & Billing — `/usage`
9. Settings — `/settings`

All authenticated users can see the complete navigation. Models is role-aware: ADMIN users receive the existing Provider/Model management interface, while MEMBER users receive a read-only catalog containing only safe model and provider names. API keys, provider secrets, and other administrative fields must never be exposed to members.

`/admin/providers` remains as a compatibility URL. ADMIN requests redirect to `/models`; MEMBER and unauthenticated requests retain the existing authorization boundary. `/login` stays outside the authenticated shell.

## Application Shell

### Header

Keep the existing GPT Image Workbench product identity and light visual language. The header follows the reference hierarchy and contains:

- a Quota control whose value is `Not connected`, without a percentage or invented progress;
- a Docs control that opens an in-app help panel describing the real Models → Create → History workflow;
- a notification control that opens an empty state and never displays a fabricated badge count;
- an account control populated from the real user record and session role, with Logout available inside the menu.

If a username cannot be loaded, show the real role or safe user identifier. Do not synthesize an email address.

### Sidebar footer

The bottom of the desktop sidebar and mobile drawer contains:

- Language / 语言: switches shell and new prototype-page labels in frontend state; it does not change stored user preferences or server-returned error text;
- Current Model: shows the selected real model, falls back to the first enabled real model, and uses `Not connected` when no model is available;
- Region: displays `Local` because the current deployment has no region service.

## Create Page

### Page header and primary selection

The page header contains Create Image, its supporting text, Model, Resolution, and View Code. The Model selector lists options as `Provider Name / Model Name`. Selecting a model synchronizes the real `providerId` and `modelId`; a separate visible Provider selector is unnecessary. Duplicate model names remain distinguishable through the Provider prefix.

View Code opens a preview dialog containing a credential-free example based only on fields the current backend supports. It must not include provider API keys or imply that preview-only controls are accepted by the API.

### Prompt panel

The Prompt panel contains the prompt textarea, character count, Templates, Enhance Prompt, and Negative Prompt. Templates opens a panel of clearly authored starter prompts; choosing one fills the prompt textarea. Enhance Prompt opens an interface-preview panel and does not call a model or silently rewrite the prompt. Negative Prompt is editable local state and is not included in the request.

### Preview panel

Before a new generation starts, display the most recent real archived image when one exists; otherwise show a truthful empty canvas. During generation, preserve queued, running, archiving, failed, and archived states. Successful real assets retain Download and History actions.

Upscale and Variations are clickable previews. Upscale opens a dialog with 2× and 4× choices; Variations opens a dialog with a local count selector. Confirming either action displays preview feedback and does not create a job. The overflow menu contains View details and Copy prompt when the underlying real asset supplies that information; unavailable actions are omitted rather than simulated.

### Parameters panel

The panel uses the reference layout and visibly separates connected settings from previews.

Connected settings:

- Model and Resolution, controlled by the page-header selectors and summarized rather than duplicated in the panel;
- Standard and High quality;
- Count;
- Delivery: URL or Base64 JSON;
- Generate.

Interface-preview settings:

- Ultra quality;
- Style: Auto, Vivid, or Natural;
- optional Seed;
- Guidance Scale;
- Output Format: PNG, JPEG, or WebP;
- Safety Filter;
- Reset.

Count and Delivery sit in a compact, collapsed-by-default Advanced delivery disclosure so the visual hierarchy remains close to the reference. Its summary always shows the current count and delivery values. Generate submits only the connected fields. Reset restores frontend defaults without making a request.

Selecting a preview-only value must not silently map it to a supported backend value. The request summary above Generate always shows the exact outgoing Standard/High quality and URL/Base64 JSON delivery. If Ultra or PNG/JPEG/WebP is selected visually, the summary continues to show the last connected quality and delivery values, and those are the only values sent.

The panel includes this persistent explanation:

> Interface preview
>
> Connected: Model, Resolution, Standard/High, Count and Delivery.
>
> Other settings are visual previews and are not sent yet.

### Lower content

Recent Generations shows real archived images only and links to History. Today's Usage retains the reference card structure, but Images Generated and Compute Time display `—`; reset time and progress bars are omitted unless real usage data is added later.

## Secondary Pages

All unconnected pages use a shared visible banner:

> Interface preview · Data not connected

Their tabs, filters, selectors, drawers, and dialogs work in local frontend state. A create or save action produces accessible inline feedback such as `Interface preview · No data was saved` and never adds a fake row.

### Batch Jobs

Provide All, Queued, Running, Completed, and Failed filters; search; an empty job table; and a New Batch Job dialog with file upload, model selection, and output settings. The table defines Job ID, Input, Model, Progress, Status, Created, and Actions columns but contains no sample jobs.

### Dataset

Provide Dataset and Files views, summary cards whose values are `—`, an empty table, and an Import Dataset drawer with drag-and-drop styling and dataset naming. Selected files remain local to the control and are not uploaded.

### Models

Reuse the real Provider/Model repositories and existing admin forms rather than building a duplicate model store. ADMIN users can create and edit Providers and Models with the existing validation, encrypted credentials, error messages, and refresh behavior. MEMBER users see a read-only catalog. The page also identifies the real current model when available.

### API Keys

Provide an empty key table and a Create API Key dialog with name, scope, and expiration controls. Submitting displays preview feedback. Never generate a sample secret, masked fake key, or copyable credential.

### Usage & Billing

Provide period controls, summary cards, chart structure, usage details, and billing status. Numerical values display `—`; billing status displays `Not connected`; no plan name, price, credit balance, or quota is invented.

### Settings

Provide Profile, Appearance, Language, Generation, and Notifications sections. Profile uses real identity fields that are already safely available. Language, appearance, default-generation, and notification controls change local selected state but are not persisted. Region remains `Local`.

## Prototype Interaction Contract

Shared prototype components should own the banner, explanatory copy, and action feedback so every page uses the same language and semantics. Preview actions must not be implemented as permanently gray disabled controls: they should be discoverable and clickable, then state clearly what is not connected.

Prototype actions must not invoke `fetch`, server actions, Prisma, job repositories, storage, or Provider adapters. They must not modify URL query parameters in a way that could be mistaken for saved state. Real and preview state should be separate types so preview values cannot accidentally enter the existing generation payload.

Existing real errors remain specific and prominent. A missing Provider or Model still disables real Generate and displays the current accessible alert. A prototype boundary is informational, not a destructive-error state, and should not be styled as a failure.

## Component and Data Boundaries

- `AppShell` remains the authenticated frame and receives a safe account summary, role, and initial real model from server-rendered pages.
- `SidebarNav` owns one data-driven list of the nine routes. Desktop navigation, the icon rail, and the mobile drawer render that same list so labels, permissions, and active-route behavior cannot drift.
- A small shell-state provider owns the open drawer, language selection, and current model label. `GenerateWorkspace` publishes real model changes to this provider while mounted. The provider uses frontend memory only, resets on full reload, and exposes no persistence API.
- A shared prototype-page frame owns `Interface preview · Data not connected`, empty-state structure, and accessible action feedback.
- `GenerateWorkspace` remains the only generation network coordinator. Its connected request type stays separate from a new prototype-only state type; only the connected type can reach the existing conversation and generation-job requests.
- The Models route reuses current repositories and admin forms. Its MEMBER view maps server results to a safe read-only model catalog and excludes credentials and administrative fields.
- Account display data is loaded server-side from the existing user record by session `userId`; no identity endpoint, schema change, or client-side secret is introduced.

The intended Create data flow is:

```text
real model/resolution/quality/count/delivery + prompt
  -> existing GenerateWorkspace request path
  -> existing conversation and generation-job APIs

templates/negative prompt/ultra/style/seed/guidance/file format/safety
  -> prototype-only React state
  -> visible request summary explains omission
  -> no API or server action
```

## Responsive Behavior

- At 1280px and above, use the complete approximately 248px sidebar and the full Prompt/Preview/Parameters Create layout.
- From 768px through 1279px, collapse the sidebar to an icon rail. Labels remain available to assistive technology and through visible hover/focus tooltips.
- From 1024px through 1279px, use a two-region Create layout: Prompt and Preview stack in the flexible main region while Parameters remains in the narrower right region.
- From 768px through 1023px, use a single content sequence: primary selection, Prompt, Preview, Parameters, Recent Generations, Today's Usage.
- Below 768px, replace the horizontal navigation strip with a menu button and left-side drawer containing the full navigation and sidebar-footer controls.
- The mobile header keeps the menu button, compact brand, and account button. Quota, Docs, notifications, account details, Logout, Language, Current Model, and Region are also reachable inside the drawer.
- The drawer closes on navigation, backdrop click, close button, and Escape; it traps focus while open and restores focus to the menu button when closed.
- On mobile, use a near-square preview, full-width primary actions, and stacked controls. Data tables become labeled information cards rather than forcing page-level horizontal scrolling.
- Verify 1536, 1279, 1023, 767, and 375px widths. No tested width may produce page-level horizontal overflow.

## Accessibility and Motion

- Preserve semantic header, navigation, main, complementary, dialog, table, and form landmarks.
- Keep `aria-current="page"` on the active destination and use `aria-expanded`/`aria-controls` for menus and drawers.
- Give every icon-only control an accessible name and every input a persistent label.
- Dialogs and popovers receive an accessible title, predictable initial focus, Escape handling, and focus restoration.
- Prototype action feedback uses an `aria-live` status region.
- Selected, connected, preview, warning, and error states must not rely on color alone.
- Interactive targets are at least 44px, focus rings remain visible, and color contrast remains suitable on the light surfaces.
- Respect `prefers-reduced-motion` for drawers, dialogs, progress treatments, and hover transitions.

## Testing and Verification

Existing tests that deliberately prohibit the newly approved interface must be revised, especially:

- `tests/ui/AppShell.test.tsx`, which currently asserts that expanded navigation, Quota, and notifications do not exist;
- `tests/ui/ParameterPanel.test.tsx`, which currently asserts that Style, Seed, Guidance, Safety, and output-format previews do not exist.

Add or update coverage for:

- all nine destinations, active-route semantics, role-aware Models content, and the `/admin/providers` compatibility redirect;
- header panels, real account content, `Not connected`/`Local` fallbacks, and Logout;
- mobile drawer opening, closing, Escape, focus management, and navigation;
- connected versus preview parameter state and the exact real generation payload;
- Templates, View Code, Upscale, Variations, prototype dialogs, and accessible feedback;
- every prototype route, empty state, local filters, and the guarantee that prototype actions issue no network request;
- responsive table/card behavior, 44px controls, reduced motion, and absence of page-level overflow;
- preservation of generation polling, archive errors, Provider errors, History, Download, and Reuse.

Verification order:

```powershell
npm.cmd test -- tests/ui
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
docker compose config
docker compose up --build -d
docker compose ps
```

Run production build before starting Compose because the host and container share `.next`. After startup, check `/`, `/generate`, `/history`, `/batch-jobs`, `/dataset`, `/models`, `/api-keys`, `/usage`, `/settings`, and `/login` in the browser at the target widths. Verify console output, keyboard navigation, dialogs, real generation, and truthful empty states.

## Change Safety and Out of Scope

Implementation must be incremental because the feature worktree contains substantial existing tracked and untracked user work. Do not reset, clean, replace whole files unnecessarily, bulk-stage, or commit generated images. Preserve `storage/generated-images/` contents and secrets.

This visual-prototype phase does not add database models, API routes, worker behavior, persistent settings, real batch processing, dataset upload, API-key issuance, usage metering, billing, quota calculation, remote region selection, notification delivery, prompt enhancement, negative-prompt support, upscaling, or variations. Each requires a later product and backend specification.

## Acceptance Criteria

- The authenticated shell visibly contains the complete reference navigation, header actions, language, current model, and region areas.
- Create visibly contains every approved reference control while clearly distinguishing connected behavior from preview behavior.
- All secondary destinations open complete, interactive, truthful prototype pages rather than disabled placeholders.
- No fake metrics, records, credentials, notifications, regions, or images appear.
- Only existing supported fields enter real generation requests; preview fields cannot leak into the backend payload.
- Existing authentication, Provider/Model management, generation, worker, archive, History, Download, and Reuse behavior remains intact.
- Desktop, tablet, and mobile navigation are usable; the mobile drawer is keyboard accessible; 375px has no page-level horizontal overflow.
- Focused UI tests, the full suite, typecheck, build, Compose validation, and browser verification pass before implementation is declared complete.
