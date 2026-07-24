# Global Language Persistence Implementation Plan

> **For agentic workers:** Execute inline in the existing `feature/gpt-image-platform` worktree. Do not create another worktree, commit, stage, push, reset, clean, or modify backend data logic.

**Goal:** Persist the selected English/Chinese language and apply it to every authenticated interface surface.

**Architecture:** `ShellState` owns a validated local-storage-backed language value and synchronizes the root HTML language. A typed localization helper selects component-local copy. Server routes retain authentication and data loading while focused client presentation components consume serializable props.

**Tech Stack:** Next.js App Router, React, strict TypeScript, Vitest, Testing Library, browser `localStorage`.

---

### Task 1: Prove the regression

**Files:**
- Modify: `tests/ui/AppShell.test.tsx`
- Modify: `tests/ui/OverviewPage.test.tsx`
- Modify: `tests/ui/GeneratePage.test.tsx`
- Modify: `tests/ui/HistoryPage.test.tsx`
- Modify: `tests/ui/ModelsPage.test.tsx`
- Modify: `tests/ui/PrototypePages.test.tsx`

- [x] Replace the old “without persistent storage” assertion with tests that select Chinese, verify `localStorage`, verify `<html lang="zh-CN">`, unmount/remount, and confirm Chinese is restored.
- [x] Add page-level assertions proving headings, actions, form labels, empty states, and dialogs switch while real model names, account values, prompts, and URLs stay unchanged.
- [x] Run the focused tests and confirm they fail because persistence and body translations are missing.

### Task 2: Persist the global language state

**Files:**
- Modify: `src/components/layout/ShellState.tsx`
- Create: `src/components/i18n/localization.ts`

- [x] Add `LANGUAGE_STORAGE_KEY`, a language type guard, safe storage reads/writes, and a storage-event listener.
- [x] Expose a stable setter that updates React state and browser storage.
- [x] Synchronize `document.documentElement.lang` and its language data attribute.
- [x] Add a typed `useLocalizedCopy` helper for component-owned `en`/`zh` copy objects.
- [x] Run `npm.cmd test -- tests/ui/AppShell.test.tsx` and confirm the persistence tests pass.

### Task 3: Translate the shared authenticated shell and prototype framework

**Files:**
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/components/layout/HeaderActions.tsx`
- Modify: `src/components/layout/MobileNavigationDrawer.tsx`
- Modify: `src/components/layout/ShellFooterControls.tsx`
- Modify: `src/components/layout/SidebarNav.tsx`
- Modify: `src/components/auth/LogoutButton.tsx`
- Modify: `src/components/prototype/PrototypeScaffold.tsx`

- [x] Translate visible text and accessibility labels for desktop/mobile navigation, utility panels, disconnected values, region, logout, prototype notices, dialog close controls, and local feedback.
- [x] Keep account, role, current model, and server error values unchanged.
- [x] Run AppShell and PrototypeScaffold tests.

### Task 4: Translate authenticated route bodies

**Files:**
- Create: `src/components/i18n/LocalizedPageHeading.tsx`
- Create: `src/components/overview/OverviewContent.tsx`
- Create: `src/components/history/HistoryToolbar.tsx`
- Create: `src/components/models/ProviderList.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/generate/page.tsx`
- Modify: `src/app/history/page.tsx`
- Modify: `src/app/models/page.tsx`
- Modify: `src/components/assets/ImageGrid.tsx`
- Modify: `src/components/models/ModelCatalog.tsx`
- Modify: provider admin form components.

- [x] Keep server authentication, filtering, pagination, and repository calls unchanged.
- [x] Move only presentation that needs live language access into focused client components.
- [x] Translate headings, capability cards, history controls, pagination, image actions, model/provider labels, states, and local form feedback.
- [x] Run Overview, History, Models, and admin UI tests.

### Task 5: Translate Create and remaining prototype pages

**Files:**
- Modify: Create workspace components under `src/components/generate/`.
- Modify: `src/components/settings/ParameterPanel.tsx`.
- Modify: prototype page components under `src/components/prototype/`.

- [x] Translate Create headings, toolbar, prompt tools, preview, parameters, recent history, usage, dialogs, placeholders, and locally generated status text.
- [x] Translate API Keys, Batch Jobs, Dataset, Usage, and Settings, including shared preview boundary text.
- [x] Preserve real prompts, filenames, models, account values, and provider/server errors.
- [x] Run Generate and prototype UI tests.

### Task 6: Verify the complete behavior

- [x] Run `npm.cmd test -- tests/ui`.
- [x] Run `npm.cmd test`.
- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run build`.
- [x] Start the available local runtime without deleting volumes, then verify English → Chinese → route navigation → refresh → English at desktop and 375px.
- [x] Inspect Git status and diff to confirm only intended frontend, tests, and new documentation changed.
