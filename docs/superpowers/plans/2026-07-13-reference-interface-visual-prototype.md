# Reference Interface Visual Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing GPT Image Workbench into the approved reference-style interface, preserving all real generation behavior while adding truthful, interactive frontend prototypes for unsupported controls and routes.

**Architecture:** Keep `GenerateWorkspace` as the only real generation network coordinator, separate connected request state from prototype-only state, and extend the authenticated shell through focused client components backed by safe server-rendered account/model context. New secondary routes share prototype primitives and never call an API; Models reuses the existing Provider/Model repositories and forms with role-aware rendering.

**Tech Stack:** Next.js 15 App Router, React 19, strict TypeScript, Prisma 6, Vitest 2, Testing Library, CSS, Docker Compose.

---

## Safety and Execution Rules

- Work only in `C:\Users\29800\Desktop\gpt-image-2-workload\.worktrees\gpt-image-platform`.
- Preserve all existing tracked and untracked user changes. Never run `git reset`, `git clean`, `git checkout --`, `git add .`, or `git add -A`.
- Do not modify the frozen 2026-07-10 design or plans dated 2026-07-11 or earlier.
- Do not add API routes, Prisma schema changes, worker behavior, generated images, usage records, or fake credentials.
- The worktree is already dirty and the user has not authorized commits. Replace commit steps with scoped `git diff`/`git status` checkpoints. Commit only after separate approval.
- Use `npm.cmd` and `npx.cmd` in PowerShell.
- Run production build before starting Compose because the host and container share `.next`.

## Current Verified Baseline

Verified on 2026-07-13 before writing this plan:

```text
npm.cmd test -- tests/ui  -> 17 files / 95 tests passed
npm.cmd run typecheck     -> exit code 0
```

## File Map

### Server and shell context

- Create: `src/server/auth/page-session.ts` — shared authenticated page guards.
- Create: `src/server/users/repository.ts` — safe account/email lookup by session user ID.
- Create: `src/components/layout/AuthenticatedAppShell.tsx` — server wrapper that supplies safe account and initial model data.
- Create: `src/components/layout/ShellState.tsx` — frontend-only language, drawer, and current-model state.
- Create: `src/components/layout/HeaderActions.tsx` — Quota, Docs, notifications, account, and Logout panels.
- Create: `src/components/layout/MobileNavigationDrawer.tsx` — accessible mobile navigation drawer.
- Create: `src/components/layout/ShellFooterControls.tsx` — Language, Current Model, and Region controls shared by sidebar and drawer.
- Create: `src/components/ui/useOverlayFocus.ts` — shared Escape/focus-trap/focus-return behavior.
- Modify: `src/components/layout/AppShell.tsx`, `src/components/layout/SidebarNav.tsx`.

### Create workspace

- Create: `src/components/generate/types.ts` — connected and prototype state types.
- Create: `src/components/generate/CreateToolbar.tsx` — Model, Resolution, and View Code.
- Create: `src/components/generate/PromptComposer.tsx` — Prompt, Templates, Enhance Prompt, and Negative Prompt.
- Create: `src/components/generate/ImagePreview.tsx` — real preview plus prototype image actions.
- Create: `src/components/generate/TodaysUsage.tsx` — truthful usage card with `—` values.
- Modify: `src/components/generate/GenerateWorkspace.tsx`.
- Modify: `src/components/chat/GenerationChat.tsx`.
- Modify: `src/components/settings/ParameterPanel.tsx`.
- Modify: `src/components/generate/RecentGenerations.tsx`.
- Modify: `src/app/generate/page.tsx`.

### Prototype primitives and routes

- Create: `src/components/prototype/PrototypeScaffold.tsx` — notice, status, modal, and shared page frame.
- Create: `src/components/prototype/BatchJobsPreview.tsx`.
- Create: `src/components/prototype/DatasetPreview.tsx`.
- Create: `src/components/prototype/ApiKeysPreview.tsx`.
- Create: `src/components/prototype/UsagePreview.tsx`.
- Create: `src/components/prototype/SettingsPreview.tsx`.
- Create: `src/app/batch-jobs/page.tsx`.
- Create: `src/app/dataset/page.tsx`.
- Create: `src/app/api-keys/page.tsx`.
- Create: `src/app/usage/page.tsx`.
- Create: `src/app/settings/page.tsx`.

### Models and existing pages

- Create: `src/components/models/ModelCatalog.tsx`.
- Create: `src/app/models/page.tsx`.
- Modify: `src/app/admin/providers/page.tsx` — compatibility redirect only.
- Modify: `src/app/page.tsx`, `src/app/history/page.tsx`.

### Tests and styling

- Create: `tests/users/repository.test.ts`.
- Create: `tests/auth/page-session.test.ts`.
- Create: `tests/ui/PrototypeScaffold.test.tsx`.
- Create: `tests/ui/PrototypePages.test.tsx`.
- Create: `tests/ui/ModelsPage.test.tsx`.
- Modify: `tests/ui/AppShell.test.tsx`.
- Modify: `tests/ui/GenerateWorkspace.test.tsx`.
- Modify: `tests/ui/GenerationChat.test.tsx`.
- Modify: `tests/ui/ParameterPanel.test.tsx`.
- Modify: `tests/ui/GeneratePage.test.tsx`.
- Modify: `tests/ui/OverviewPage.test.tsx`.
- Modify: `tests/ui/HistoryPage.test.tsx`.
- Modify: `tests/ui/AdminProvidersPage.test.tsx`.
- Modify: `tests/ui/GlobalStyles.test.ts`.
- Modify: `src/app/globals.css` incrementally; do not replace the file wholesale.

## Specification Coverage Map

- Application shell, full navigation, header actions, account data, language, current model, region, and mobile drawer: Tasks 1–3.
- Connected/prototype data separation, Create toolbar, Parameters, request summary, and View Code: Task 5.
- Templates, Enhance Prompt, Negative Prompt, real/default preview, Upscale, Variations, Download, and Copy prompt: Tasks 6–7.
- Recent Generations and truthful Today's Usage: Task 8.
- Role-aware Models and `/admin/providers` compatibility: Task 9.
- Batch Jobs, Dataset, API Keys, Usage & Billing, and Settings previews: Tasks 10–11.
- Responsive breakpoints, mobile table cards, focus visibility, 44px targets, and reduced motion: Task 12.
- Existing generation/provider/history regressions, build, Compose, browser routes, screenshots, and final safety audit: Task 13.

## Task 0: Preserve and Record the Baseline

**Files:**
- Inspect only: repository and worktree status.

- [ ] **Step 1: Record both checkout states**

Run:

```powershell
git -C "C:\Users\29800\Desktop\gpt-image-2-workload" status --short --branch
git status --short --branch
git diff --stat
```

Expected: outer checkout is ahead of origin and dirty; feature worktree is `feature/gpt-image-platform` with substantial existing tracked and untracked changes. Do not normalize or clean either checkout.

- [ ] **Step 2: Re-run the focused baseline**

Run:

```powershell
npm.cmd test -- tests/ui
npm.cmd run typecheck
```

Expected: `17 files / 95 tests` pass and typecheck exits 0 before feature edits.

- [ ] **Step 3: Save a scoped status checkpoint**

Run:

```powershell
git status --short --branch
git diff --stat -- src tests
```

Expected: no new source/test changes from this task.

## Task 1: Add Shared Page Sessions and Safe Account Lookup

**Files:**
- Create: `src/server/auth/page-session.ts`
- Create: `src/server/users/repository.ts`
- Create: `tests/auth/page-session.test.ts`
- Create: `tests/users/repository.test.ts`

- [ ] **Step 1: Write the failing account repository test**

Create `tests/users/repository.test.ts`:

```ts
// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { getAccountSummary } from "../../src/server/users/repository";

describe("user repository", () => {
  it("returns only safe account fields for the session user", async () => {
    const db = {
      user: {
        findUnique: vi.fn(async () => ({
          account: "admin",
          email: "admin@example.com"
        }))
      }
    };

    await expect(getAccountSummary("user_1", { db })).resolves.toEqual({
      account: "admin",
      email: "admin@example.com"
    });
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user_1" },
      select: { account: true, email: true }
    });
  });

  it("returns null when the user record is unavailable", async () => {
    const db = { user: { findUnique: vi.fn(async () => null) } };

    await expect(getAccountSummary("missing", { db })).resolves.toBeNull();
  });
});
```

- [ ] **Step 2: Run the repository test and verify failure**

Run:

```powershell
npm.cmd test -- tests/users/repository.test.ts
```

Expected: FAIL because `src/server/users/repository.ts` does not exist.

- [ ] **Step 3: Implement the safe user repository**

Create `src/server/users/repository.ts`:

```ts
import { prisma } from "../db/client";

type AccountRecord = {
  account: string;
  email: string;
};

type UserDb = {
  user: {
    findUnique(args: {
      where: { id: string };
      select: { account: true; email: true };
    }): Promise<AccountRecord | null>;
  };
};

export async function getAccountSummary(
  userId: string,
  context: { db?: UserDb } = {}
): Promise<AccountRecord | null> {
  const db = (context.db ?? prisma) as UserDb;

  return db.user.findUnique({
    where: { id: userId },
    select: { account: true, email: true }
  });
}
```

- [ ] **Step 4: Write the failing shared page-session tests**

Create `tests/auth/page-session.test.ts` with hoisted mocks for `next/headers`, `next/navigation`, and `getSessionFromToken`. Cover these exact cases:

```ts
it("returns a member session from the session cookie", async () => {
  mocks.cookieGet.mockReturnValue({ value: "token" });
  mocks.getSessionFromToken.mockResolvedValue({
    userId: "user_1",
    role: "MEMBER"
  });

  await expect(requireMemberPageSession()).resolves.toEqual({
    userId: "user_1",
    role: "MEMBER"
  });
});

it("redirects a member away from an admin page", async () => {
  mocks.getSessionFromToken.mockResolvedValue({
    userId: "user_2",
    role: "MEMBER"
  });
  mocks.redirect.mockImplementation(() => {
    throw new Error("NEXT_REDIRECT");
  });

  await expect(requireAdminPageSession()).rejects.toThrow("NEXT_REDIRECT");
  expect(mocks.redirect).toHaveBeenCalledWith("/login");
});
```

- [ ] **Step 5: Run the page-session test and verify failure**

Run:

```powershell
npm.cmd test -- tests/auth/page-session.test.ts
```

Expected: FAIL because `src/server/auth/page-session.ts` does not exist.

- [ ] **Step 6: Implement shared page guards**

Create `src/server/auth/page-session.ts`:

```ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireAdmin, requireMember } from "./guards";
import { getSessionFromToken } from "./request-session";
import type { Session } from "./session";

async function readPageSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return getSessionFromToken(cookieStore.get("session")?.value);
}

export async function requireMemberPageSession(): Promise<Session> {
  try {
    return requireMember(await readPageSession());
  } catch {
    redirect("/login");
  }
}

export async function requireAdminPageSession(): Promise<Session> {
  try {
    return requireAdmin(await readPageSession());
  } catch {
    redirect("/login");
  }
}
```

- [ ] **Step 7: Run focused tests and checkpoint**

Run:

```powershell
npm.cmd test -- tests/users/repository.test.ts tests/auth/page-session.test.ts
npm.cmd run typecheck
git status --short -- src/server tests/auth tests/users
```

Expected: focused tests and typecheck pass; only the four intended new files appear.

## Task 2: Build the Complete Interactive Application Shell

**Files:**
- Create: `src/components/layout/ShellState.tsx`
- Create: `src/components/layout/HeaderActions.tsx`
- Create: `src/components/layout/MobileNavigationDrawer.tsx`
- Create: `src/components/layout/ShellFooterControls.tsx`
- Create: `src/components/ui/useOverlayFocus.ts`
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/components/layout/SidebarNav.tsx`
- Modify: `tests/ui/AppShell.test.tsx`

- [ ] **Step 1: Replace the old shell assertions with failing reference-shell tests**

Update `tests/ui/AppShell.test.tsx` to render:

```tsx
<AppShell
  role="ADMIN"
  accountLabel="admin"
  accountEmail="admin@example.com"
  initialModelName="Proxy / gpt-image-2"
>
  Dashboard
</AppShell>
```

Assert all nine links and the shell facts:

```ts
const expectedLinks = [
  ["Overview", "/"],
  ["Create", "/generate"],
  ["History", "/history"],
  ["Batch Jobs", "/batch-jobs"],
  ["Dataset", "/dataset"],
  ["Models", "/models"],
  ["API Keys", "/api-keys"],
  ["Usage & Billing", "/usage"],
  ["Settings", "/settings"]
] as const;

for (const [name, href] of expectedLinks) {
  expect(nav.getByRole("link", { name })).toHaveAttribute("href", href);
}
expect(screen.getByText("Not connected")).toBeInTheDocument();
expect(screen.getByText("Proxy / gpt-image-2")).toBeInTheDocument();
expect(screen.getByText("Local")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Docs" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Account: admin" })).toBeInTheDocument();
```

Add tests that:

- MEMBER receives the same nine destinations;
- active nested routes still set `aria-current="page"` correctly;
- Language switches the navigation to Chinese and back without storage calls;
- opening Mobile navigation produces a dialog, Escape closes it, and focus returns to the menu button;
- Docs, Notifications, and Account panels show truthful content and never show quota percentages or notification counts.

- [ ] **Step 2: Run the shell test and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/AppShell.test.tsx
```

Expected: FAIL because the shell still exposes four routes and lacks the approved controls.

- [ ] **Step 3: Add shell state with no persistence**

Create `src/components/layout/ShellState.tsx`:

```tsx
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type ShellLanguage = "en" | "zh";

type ShellStateValue = {
  language: ShellLanguage;
  setLanguage: (language: ShellLanguage) => void;
  currentModelName: string;
  setCurrentModelName: (name: string) => void;
  mobileNavigationOpen: boolean;
  setMobileNavigationOpen: (open: boolean) => void;
};

const ShellStateContext = createContext<ShellStateValue | null>(null);

export function ShellStateProvider({
  children,
  initialModelName
}: {
  children: React.ReactNode;
  initialModelName: string;
}) {
  const [language, setLanguage] = useState<ShellLanguage>("en");
  const [currentModelName, setCurrentModelName] = useState(initialModelName);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currentModelName,
      setCurrentModelName,
      mobileNavigationOpen,
      setMobileNavigationOpen
    }),
    [language, currentModelName, mobileNavigationOpen]
  );

  return (
    <ShellStateContext.Provider value={value}>
      {children}
    </ShellStateContext.Provider>
  );
}

export function useShellState(): ShellStateValue {
  const value = useContext(ShellStateContext);
  if (!value) throw new Error("useShellState must be used inside ShellStateProvider");
  return value;
}
```

- [ ] **Step 4: Add reusable overlay focus behavior**

Create `src/components/ui/useOverlayFocus.ts` with this contract:

```ts
"use client";

import { type RefObject, useEffect } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function useOverlayFocus(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  returnFocusRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
    focusable()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (returnFocusRef?.current ?? previous)?.focus();
    };
  }, [open, containerRef, onClose, returnFocusRef]);
}
```

- [ ] **Step 5: Replace the navigation definition with all approved routes**

In `src/components/layout/SidebarNav.tsx`, remove `adminOnly` filtering and define one ordered list with English and Chinese labels:

```ts
const navigationItems = [
  { href: "/", label: { en: "Overview", zh: "概览" }, icon: "overview" },
  { href: "/generate", label: { en: "Create", zh: "创建" }, icon: "create" },
  { href: "/history", label: { en: "History", zh: "历史记录" }, icon: "history" },
  { href: "/batch-jobs", label: { en: "Batch Jobs", zh: "批量任务" }, icon: "batch" },
  { href: "/dataset", label: { en: "Dataset", zh: "数据集" }, icon: "dataset" },
  { href: "/models", label: { en: "Models", zh: "模型" }, icon: "models" },
  { href: "/api-keys", label: { en: "API Keys", zh: "API 密钥" }, icon: "keys" },
  { href: "/usage", label: { en: "Usage & Billing", zh: "用量与账单" }, icon: "usage" },
  { href: "/settings", label: { en: "Settings", zh: "设置" }, icon: "settings" }
] as const;
```

Keep the current active-path function. Extend the inline SVG map without installing an icon dependency:

```tsx
batch: <path d="M4 7h16M4 12h16M4 17h10M7 4v6M17 4v6" />,
dataset: <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm-8 4 8 4 8-4M12 11v10" />,
models: <path d="M5 5h14v14H5V5Zm3 3h8v8H8V8Zm4-6v3m0 14v3M2 12h3m14 0h3" />,
keys: <path d="M14 7a5 5 0 1 0-3.9 4.88L13 15h3v3h3v-3.17l-5.1-5.1A5 5 0 0 0 14 7Z" />,
usage: <path d="M4 19V9m6 10V5m6 14v-7m4 7V3" />,
settings: <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8.2 3a6.8 6.8 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.8-1L15.6 3h-4l-.4 3.1a8 8 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a6.8 6.8 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.8 1l.4 3.1h4l.4-3.1a8 8 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5a6.8 6.8 0 0 0 .1-1Z" />
```

Accept an optional `onNavigate` callback so the mobile drawer closes after a link click.

- [ ] **Step 6: Implement shared sidebar-footer controls**

Create `src/components/layout/ShellFooterControls.tsx`:

```tsx
"use client";

import React from "react";

import { useShellState } from "./ShellState";

export function ShellFooterControls() {
  const { language, setLanguage, currentModelName } = useShellState();
  const copy = language === "zh"
    ? { currentModel: "当前模型", region: "区域" }
    : { currentModel: "Current Model", region: "Region" };

  return (
    <div className="sidebar-footer">
      <label className="sidebar-footer__card">
        <span>Language / 语言</span>
        <select
          aria-label="Language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as "en" | "zh")}
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </label>
      <div className="sidebar-footer__card">
        <span>{copy.currentModel}</span>
        <strong>{currentModelName}</strong>
      </div>
      <div className="sidebar-footer__card">
        <span>{copy.region}</span>
        <strong>Local</strong>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Implement truthful header panels**

Create `src/components/layout/HeaderActions.tsx` with this public contract:

```ts
type HeaderActionsProps = {
  role: "ADMIN" | "MEMBER";
  accountLabel: string;
  accountEmail?: string;
  mobile?: boolean;
};
```

Maintain one `openPanel` state with values `"quota" | "docs" | "notifications" | "account" | null`. Render:

```tsx
<button type="button" aria-expanded={openPanel === "quota"}>
  Quota <span>Not connected</span>
</button>
```

The Docs panel contains the ordered real workflow `Models → Create → History`. The notification panel contains `No notifications.` with no badge. The account panel shows `accountLabel`, optional real `accountEmail`, `role`, and exactly one `LogoutButton`. Panel containers use `role="dialog"`, accessible headings, and Escape-close handling through `useOverlayFocus`.

Read `language` from `useShellState` and provide complete English/Chinese labels for Quota, Docs, Notifications, Account, the panel headings, and their empty/help text. Keep real account values and server error text untranslated.

- [ ] **Step 8: Implement the mobile drawer**

Create `src/components/layout/MobileNavigationDrawer.tsx` with:

```ts
type MobileNavigationDrawerProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  role: "ADMIN" | "MEMBER";
  accountLabel: string;
  accountEmail?: string;
};
```

Render the open state as:

```tsx
<div className="mobile-nav-backdrop" onMouseDown={onClose}>
  <aside
    ref={drawerRef}
    id="mobile-navigation"
    aria-label="Mobile navigation"
    aria-modal="true"
    className="mobile-nav-drawer"
    role="dialog"
    onMouseDown={(event) => event.stopPropagation()}
  >
    <button type="button" aria-label="Close navigation" onClick={onClose} />
    <SidebarNav onNavigate={onClose} />
    <ShellFooterControls />
    <HeaderActions
      role={role}
      accountLabel={accountLabel}
      accountEmail={accountEmail}
      mobile
    />
  </aside>
</div>
```

Use `useOverlayFocus` and restore focus to the menu button. The drawer must render only while open.

- [ ] **Step 9: Recompose AppShell**

Update `src/components/layout/AppShell.tsx` to accept:

```ts
type AppShellProps = {
  children: ReactNode;
  role: AppRole;
  accountLabel?: string;
  accountEmail?: string;
  initialModelName?: string;
};
```

Mark the file `"use client"`. Keep the exported `AppShell` as the provider boundary and define an internal `AppShellChrome` that calls `useShellState`, owns the menu-button ref, and opens/closes the drawer. Wrap the shell with `ShellStateProvider`, default missing identity to the real role, default model to `Not connected`, render the menu button with `aria-controls="mobile-navigation"`, render `HeaderActions`, desktop `SidebarNav`, `ShellFooterControls`, and `MobileNavigationDrawer`. Pass role/account props to both header and drawer. Remove the obsolete `Async worker` chip.

- [ ] **Step 10: Run the shell tests and checkpoint**

Run:

```powershell
npm.cmd test -- tests/ui/AppShell.test.tsx tests/ui/LogoutButton.test.tsx
npm.cmd run typecheck
git status --short -- src/components/layout src/components/ui tests/ui/AppShell.test.tsx
```

Expected: shell tests pass; Logout still calls only `/api/logout`; no route page has been changed yet.

## Task 3: Supply Safe Shell Data and Migrate Existing Member Pages

**Files:**
- Create: `src/components/layout/AuthenticatedAppShell.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/generate/page.tsx`
- Modify: `src/app/history/page.tsx`
- Modify: `tests/ui/OverviewPage.test.tsx`
- Modify: `tests/ui/GeneratePage.test.tsx`
- Modify: `tests/ui/HistoryPage.test.tsx`

- [ ] **Step 1: Update page tests to expect safe shell data**

Mock `getAccountSummary` to return `{ account: "member", email: "member@example.com" }` and keep `listGenerationOptions` returning real models. Update assertions so all three pages show:

```ts
expect(screen.getByRole("button", { name: "Account: member" })).toBeInTheDocument();
expect(screen.getByText("Proxy / gpt-image-2")).toBeInTheDocument();
expect(screen.getByText("Local")).toBeInTheDocument();
```

Overview actions should link to `/generate`, `/history`, and `/models`; Models is visible for both roles.

- [ ] **Step 2: Run the three page tests and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/OverviewPage.test.tsx tests/ui/GeneratePage.test.tsx tests/ui/HistoryPage.test.tsx
```

Expected: FAIL because pages still construct `AppShell` directly and repeat session code.

- [ ] **Step 3: Implement the authenticated server shell wrapper**

Create `src/components/layout/AuthenticatedAppShell.tsx` as a synchronous view plus an explicit async loader so Vitest page rendering never depends on an async React component:

```tsx
import React, { type ReactNode } from "react";

import type { Session } from "../../server/auth/session";
import { listGenerationOptions } from "../../server/providers/repository";
import { getAccountSummary } from "../../server/users/repository";
import { AppShell } from "./AppShell";

type GenerationOptions = Awaited<ReturnType<typeof listGenerationOptions>>;

export type AuthenticatedShellContext = {
  role: Session["role"];
  accountLabel: string;
  accountEmail?: string;
  initialModelName: string;
};

export async function getAuthenticatedShellContext(
  { session, generationOptions }: {
    session: Session;
    generationOptions?: GenerationOptions;
  }
): Promise<AuthenticatedShellContext> {
  const [account, options] = await Promise.all([
    getAccountSummary(session.userId).catch(() => null),
    generationOptions
      ? Promise.resolve(generationOptions)
      : listGenerationOptions().catch(() => ({ providers: [], models: [] }))
  ]);
  const providerNames = new Map(options.providers.map((provider) => [provider.id, provider.name]));
  const initialModel = options.models[0];
  const initialModelName = initialModel
    ? `${providerNames.get(initialModel.providerId) ?? "Provider"} / ${initialModel.name}`
    : "Not connected";

  return {
    role: session.role,
    accountLabel: account?.account ?? session.role,
    accountEmail: account?.email,
    initialModelName
  };
}

export function AuthenticatedAppShell({
  children,
  context
}: {
  children: ReactNode;
  context: AuthenticatedShellContext;
}) {
  return (
    <AppShell
      role={context.role}
      accountLabel={context.accountLabel}
      accountEmail={context.accountEmail}
      initialModelName={context.initialModelName}
    >
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 4: Migrate Overview, Generate, and History**

In each page:

- replace local duplicated cookie/session functions with `requireMemberPageSession`;
- Overview and History call `getAuthenticatedShellContext({ session })`;
- Generate calls `getAuthenticatedShellContext({ session, generationOptions: options })` so its already loaded options are reused;
- replace direct `AppShell` usage with `<AuthenticatedAppShell context={shellContext}>`;
- change Overview's Provider Admin card to Models at `/models` and remove `adminOnly` filtering;
- retain existing History queries, filtering, paging, error fallbacks, and Generate reuse parameters exactly.

- [ ] **Step 5: Run migrated page tests and the focused shell suite**

Run:

```powershell
npm.cmd test -- tests/ui/AppShell.test.tsx tests/ui/OverviewPage.test.tsx tests/ui/GeneratePage.test.tsx tests/ui/HistoryPage.test.tsx
npm.cmd run typecheck
```

Expected: PASS; login redirects, history behavior, and generation option fallbacks remain covered.

- [ ] **Step 6: Check only intended page/shell changes**

Run:

```powershell
git diff -- src/app/page.tsx src/app/generate/page.tsx src/app/history/page.tsx src/components/layout src/server/auth/page-session.ts src/server/users/repository.ts
```

Expected: no API, Prisma, worker, or storage changes.

## Task 4: Add Shared Prototype Primitives

**Files:**
- Create: `src/components/prototype/PrototypeScaffold.tsx`
- Create: `tests/ui/PrototypeScaffold.test.tsx`

- [ ] **Step 1: Write failing tests for the shared prototype contract**

Create `tests/ui/PrototypeScaffold.test.tsx` covering:

```tsx
render(
  <PrototypePageFrame title="Batch Jobs" description="Manage queued batches.">
    <PrototypeNotice />
  </PrototypePageFrame>
);

expect(screen.getByRole("heading", { name: "Batch Jobs" })).toBeInTheDocument();
expect(screen.getByText("Interface preview · Data not connected")).toBeInTheDocument();
```

For `PrototypeDialog`, assert that it:

- renders only when `open` is true;
- uses `role="dialog"` and `aria-modal="true"`;
- closes on Escape and restores focus to the trigger;
- closes on backdrop click but not on dialog-content click.

For `PrototypeStatus`, assert the text is inside `role="status"` with `aria-live="polite"`.

Record `window.location.href` before opening, changing, and confirming prototype controls; assert it is unchanged afterward so preview state cannot be mistaken for a saved URL state.

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/PrototypeScaffold.test.tsx
```

Expected: FAIL because the shared primitives do not exist.

- [ ] **Step 3: Implement the scaffold and modal**

Create `src/components/prototype/PrototypeScaffold.tsx` with these exports:

```tsx
"use client";

import React, { type ReactNode, useCallback, useId, useRef, useState } from "react";

import { useOverlayFocus } from "../ui/useOverlayFocus";

export const prototypeBoundaryMessage =
  "Interface preview · Data not connected";

export function PrototypeNotice() {
  return <p className="prototype-notice">{prototypeBoundaryMessage}</p>;
}

export function PrototypeStatus({ message }: { message: string }) {
  return message ? (
    <p className="prototype-status" role="status" aria-live="polite">
      {message}
    </p>
  ) : null;
}

export function usePrototypeFeedback() {
  const [message, setMessage] = useState("");
  const showPreviewFeedback = useCallback((action: string) => {
    setMessage(`Interface preview · ${action} was not saved`);
  }, []);
  return { message, showPreviewFeedback, clearPreviewFeedback: () => setMessage("") };
}

export function PrototypePageFrame({
  title,
  description,
  actions,
  children
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <section className="page-heading prototype-page-heading">
        <div>
          <p className="eyebrow">Interface preview</p>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
        </div>
        {actions}
      </section>
      <PrototypeNotice />
      {children}
    </>
  );
}

export function PrototypeDialog({
  open,
  title,
  onClose,
  returnFocusRef,
  children,
  actions
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayFocus(open, dialogRef, onClose, returnFocusRef);
  if (!open) return null;

  return (
    <div className="prototype-dialog-backdrop" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className="prototype-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2 id={titleId}>{title}</h2>
          <button type="button" aria-label="Close dialog" onClick={onClose}>×</button>
        </header>
        <div className="prototype-dialog__body">{children}</div>
        {actions ? <footer>{actions}</footer> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the scaffold tests and typecheck**

Run:

```powershell
npm.cmd test -- tests/ui/PrototypeScaffold.test.tsx
npm.cmd run typecheck
```

Expected: PASS; no network calls are introduced.

## Task 5: Separate Connected and Prototype Generation Parameters

**Files:**
- Create: `src/components/generate/types.ts`
- Create: `src/components/generate/CreateToolbar.tsx`
- Modify: `src/components/generate/GenerateWorkspace.tsx`
- Modify: `src/components/settings/ParameterPanel.tsx`
- Modify: `src/app/generate/page.tsx`
- Modify: `tests/ui/GenerateWorkspace.test.tsx`
- Modify: `tests/ui/ParameterPanel.test.tsx`
- Modify: `tests/ui/GeneratePage.test.tsx`

- [ ] **Step 1: Rewrite parameter tests around the approved state boundary**

Update `tests/ui/ParameterPanel.test.tsx` so the harness supplies separate connected and prototype values. Assert:

```ts
expect(screen.queryByLabelText("Provider")).not.toBeInTheDocument();
expect(screen.queryByLabelText("Model")).not.toBeInTheDocument();
expect(screen.getByRole("button", { name: "Standard" })).toHaveAttribute("aria-pressed", "true");
expect(screen.getByRole("button", { name: "Ultra" })).toHaveAttribute("aria-pressed", "false");
expect(screen.getByLabelText("Style")).toHaveValue("auto");
expect(screen.getByLabelText("Seed (optional)")).toHaveValue("");
expect(screen.getByLabelText("Guidance Scale")).toHaveValue("7.5");
expect(screen.getByLabelText("Output Format")).toHaveValue("png");
expect(screen.getByLabelText("Safety Filter")).toBeChecked();
expect(screen.getByText(/Sent: Standard · Base64 JSON · 1 image/)).toBeInTheDocument();
```

Click Ultra and verify only `onPrototypeChange` receives `{ previewQuality: "ultra" }`; the connected quality remains `standard`. Change Count and Delivery inside the Advanced delivery disclosure and verify only connected state changes.

Update `tests/ui/GeneratePage.test.tsx` so `quality=high` initializes High and an unsupported value such as `quality=ultra` falls back to Standard rather than entering connected state.

- [ ] **Step 2: Add a failing request-boundary test**

In `tests/ui/GenerateWorkspace.test.tsx`, select Ultra, Vivid, a seed, guidance 12, JPEG, and Safety Filter off, then generate. Assert the message request body is still exactly:

```ts
body: JSON.stringify({
  prompt: "Draw a red cube",
  providerId: "provider_1",
  modelId: "model_1",
  requestParams: {
    size: "1024x1024",
    quality: "standard",
    count: 1,
    responseFormat: "b64_json"
  }
})
```

Also assert the serialized body does not contain `ultra`, `style`, `seed`, `guidance`, `jpeg`, or `safety`.

- [ ] **Step 3: Run the two tests and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/ParameterPanel.test.tsx tests/ui/GenerateWorkspace.test.tsx
```

Expected: FAIL because the current panel intentionally omits all prototype controls.

- [ ] **Step 4: Define the shared generation types**

Create `src/components/generate/types.ts`:

```ts
export type ProviderOption = { id: string; name: string };

export type ModelOption = {
  id: string;
  providerId: string;
  name: string;
  defaultParams: unknown;
  capabilities: unknown;
};

export type ConnectedGenerationParameters = {
  providerId: string;
  modelId: string;
  size: string;
  count: number;
  quality: "standard" | "high";
  responseFormat: "url" | "b64_json";
};

export type PrototypeGenerationParameters = {
  previewQuality: "ultra" | null;
  style: "auto" | "vivid" | "natural";
  seed: string;
  guidance: number;
  outputFormat: "png" | "jpeg" | "webp";
  safetyFilter: boolean;
};

export const defaultPrototypeParameters: PrototypeGenerationParameters = {
  previewQuality: null,
  style: "auto",
  seed: "",
  guidance: 7.5,
  outputFormat: "png",
  safetyFilter: true
};
```

Keep `ParameterPanelValue` as an exported alias to `ConnectedGenerationParameters` during migration so History reuse and existing test imports do not break unnecessarily.

In `src/app/generate/page.tsx`, add a strict parser:

```ts
function readQuality(value: string | undefined): "standard" | "high" | undefined {
  return value === "standard" || value === "high" ? value : undefined;
}
```

Pass `quality: readQuality(params.quality)` to the workspace. In `resolveInitialParameters`, default any missing connected quality to `standard`; never cast arbitrary query text into the union.

- [ ] **Step 5: Add the page-level Model/Resolution toolbar**

Create `src/components/generate/CreateToolbar.tsx`. It receives all models and providers, derives labels as `Provider / Model`, and exposes only model and resolution changes:

```ts
type CreateToolbarProps = {
  providers: ProviderOption[];
  models: ModelOption[];
  value: ConnectedGenerationParameters;
  onModelChange: (modelId: string) => void;
  onSizeChange: (size: string) => void;
};
```

Render `Model`, `Resolution`, and `View Code`. View Code opens `PrototypeDialog` and displays a credential-free `POST /api/conversations/{id}/messages` example containing only prompt, providerId, modelId, size, quality, count, and responseFormat.

- [ ] **Step 6: Replace ParameterPanel with the connected/prototype design**

Update `ParameterPanel` props to:

```ts
type ParameterPanelProps = {
  formId: string;
  submitDisabled?: boolean;
  connected: ConnectedGenerationParameters;
  prototype: PrototypeGenerationParameters;
  onConnectedChange: (value: ConnectedGenerationParameters) => void;
  onPrototypeChange: (value: PrototypeGenerationParameters) => void;
  onReset: () => void;
};
```

Implement:

- Standard/High buttons clear `previewQuality` and update real `quality`;
- Ultra sets only `previewQuality: "ultra"`;
- Style, Seed, Guidance, Output Format, and Safety Filter update only prototype state;
- a collapsed-by-default `<details>` named Advanced delivery contains Count and Delivery;
- the request summary always reads from connected state;
- the persistent Interface preview explanation is visible above Generate;
- Reset changes local state only.

- [ ] **Step 7: Rework GenerateWorkspace selection and submission**

In `GenerateWorkspace`:

- import the shared types;
- maintain `connectedParameters` and `prototypeParameters` in separate `useState` calls;
- render `CreateToolbar` above `.generation-workspace`;
- when Model changes, derive `providerId` from the chosen model and update both IDs atomically;
- remove the old visible provider-change path;
- update all disabled guidance links from Provider Admin to Models;
- publish the selected `Provider / Model` label through `useShellState().setCurrentModelName`;
- keep the request body built only from `connectedParameters`.

Reset to the first enabled real model, `1024x1024`, count 1, Standard, Base64 JSON, and `defaultPrototypeParameters`.

- [ ] **Step 8: Run parameter, request, and type checks**

Run:

```powershell
npm.cmd test -- tests/ui/ParameterPanel.test.tsx tests/ui/GenerateWorkspace.test.tsx tests/ui/GeneratePage.test.tsx
npm.cmd run typecheck
```

Expected: PASS; prototype choices remain visible but absent from every fetch body.

## Task 6: Add Prompt Templates, Enhance Preview, and Negative Prompt

**Files:**
- Create: `src/components/generate/PromptComposer.tsx`
- Modify: `src/components/chat/GenerationChat.tsx`
- Modify: `tests/ui/GenerationChat.test.tsx`

- [ ] **Step 1: Add failing prompt interaction tests**

Extend `tests/ui/GenerationChat.test.tsx` to assert:

- Templates opens a dialog with at least three authored prompts;
- selecting `Cinematic city` fills the Prompt textarea;
- Enhance Prompt opens an Interface preview dialog and makes no fetch call;
- Negative Prompt accepts local text;
- submitting still calls `onSubmit` with only the trimmed positive prompt;
- the prompt counter uses the approved `/ 1000` format.

Representative assertion:

```ts
fireEvent.click(screen.getByRole("button", { name: "Templates" }));
fireEvent.click(screen.getByRole("button", { name: "Cinematic city" }));
expect(screen.getByLabelText("Prompt")).toHaveValue(
  "A futuristic city at sunset, cinematic lighting, ultra detailed."
);
fireEvent.change(screen.getByLabelText("Negative Prompt (optional)"), {
  target: { value: "blurry, watermark" }
});
fireEvent.submit(screen.getByRole("form", { name: "Generation prompt" }));
expect(onSubmit).toHaveBeenCalledWith(
  "A futuristic city at sunset, cinematic lighting, ultra detailed."
);
```

- [ ] **Step 2: Run GenerationChat tests and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/GenerationChat.test.tsx
```

Expected: FAIL because the prompt panel currently contains only one textarea.

- [ ] **Step 3: Implement PromptComposer**

Create `src/components/generate/PromptComposer.tsx` with a stable template list:

```ts
const promptTemplates = [
  {
    name: "Cinematic city",
    prompt: "A futuristic city at sunset, cinematic lighting, ultra detailed."
  },
  {
    name: "Mountain landscape",
    prompt: "A serene alpine valley, dramatic clouds, photorealistic landscape."
  },
  {
    name: "Editorial portrait",
    prompt: "An editorial studio portrait, soft key light, natural skin texture."
  }
] as const;
```

The component owns positive prompt, negative prompt, template dialog, and enhance dialog state. `handleSubmit` trims and sends only the positive prompt. Enhance Prompt closes with `Interface preview · Prompt was not enhanced`; it must not call `fetch` or alter the prompt.

- [ ] **Step 4: Make GenerationChat a focused coordinator**

Replace the current inline prompt section with `PromptComposer`. Keep `messages`, active job selection, and preview data in `GenerationChat`; do not move network behavior out of `GenerateWorkspace`.

- [ ] **Step 5: Run prompt tests and checkpoint**

Run:

```powershell
npm.cmd test -- tests/ui/GenerationChat.test.tsx tests/ui/GenerateWorkspace.test.tsx
npm.cmd run typecheck
git diff -- src/components/generate/PromptComposer.tsx src/components/chat/GenerationChat.tsx tests/ui/GenerationChat.test.tsx
```

Expected: prompt interactions pass and generation payload tests remain unchanged.

## Task 7: Add Real Default Preview and Prototype Image Actions

**Files:**
- Create: `src/components/generate/ImagePreview.tsx`
- Modify: `src/components/chat/GenerationChat.tsx`
- Modify: `src/components/generate/GenerateWorkspace.tsx`
- Modify: `src/app/generate/page.tsx`
- Modify: `tests/ui/GenerationChat.test.tsx`
- Modify: `tests/ui/GeneratePage.test.tsx`

- [ ] **Step 1: Write failing default-preview and action tests**

Add tests for this priority order:

1. latest real job message;
2. most recent real archived asset;
3. truthful empty canvas.

Render an initial asset:

```ts
const initialPreviewAsset = {
  id: "asset_recent",
  src: "/api/image-assets/asset_recent",
  prompt: "Recent real image",
  model: "gpt-image-2",
  createdAt: "2026-07-12T01:02:03.000Z"
};
```

Assert Download uses the real asset URL. Click Upscale and Variations, confirm their dialogs, and assert `fetch` was never called. Mock `navigator.clipboard.writeText`, click Copy prompt, and assert the real prompt is copied.

- [ ] **Step 2: Run preview tests and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/GenerationChat.test.tsx tests/ui/GeneratePage.test.tsx
```

Expected: FAIL because default assets and prototype image actions are not supported.

- [ ] **Step 3: Implement ImagePreview**

Create `src/components/generate/ImagePreview.tsx` with props:

```ts
export type PreviewAsset = {
  id: string;
  src: string;
  prompt: string;
  model?: string;
  createdAt?: string;
};

type ImagePreviewProps = {
  latestMessage?: ChatMessage;
  initialAsset?: PreviewAsset;
};
```

Implement:

- real status and `aria-busy` behavior from the current preview;
- real Download and History actions for archived images;
- Upscale dialog with 2×/4× choices and no job creation;
- Variations dialog with a local count 1–4 and no job creation;
- derive the copyable prompt as `latestMessage?.images?.[0]?.alt ?? initialAsset?.prompt`;
- an overflow menu with View details and Copy prompt only when that real prompt or asset metadata exists;
- accessible prototype status feedback after confirm actions.

- [ ] **Step 4: Wire the initial real asset through the page**

Add `initialPreviewAsset?: PreviewAsset` to `GenerationChat` and `GenerateWorkspace`. In `src/app/generate/page.tsx`, pass `recentAssets[0]` to `GenerateWorkspace` while continuing to pass all assets to `RecentGenerations`.

- [ ] **Step 5: Run preview and request regression tests**

Run:

```powershell
npm.cmd test -- tests/ui/GenerationChat.test.tsx tests/ui/GenerateWorkspace.test.tsx tests/ui/GeneratePage.test.tsx
npm.cmd run typecheck
```

Expected: PASS; a new real job replaces the default preview, prototype actions do not fetch, and real generation requests remain unchanged.

## Task 8: Complete the Create Page Lower Layout

**Files:**
- Create: `src/components/generate/TodaysUsage.tsx`
- Modify: `src/app/generate/page.tsx`
- Modify: `src/components/generate/RecentGenerations.tsx`
- Modify: `tests/ui/GeneratePage.test.tsx`
- Modify: `tests/ui/RecentGenerations.test.tsx`

- [ ] **Step 1: Add failing lower-layout assertions**

Update `tests/ui/GeneratePage.test.tsx` to expect one `.create-lower-grid` containing Recent Generations and Today's Usage. Assert:

```ts
expect(screen.getByRole("heading", { name: "Today's Usage" })).toBeInTheDocument();
expect(screen.getByText("Images Generated").nextSibling).toHaveTextContent("—");
expect(screen.getByText("Compute Time").nextSibling).toHaveTextContent("—");
expect(screen.queryByText(/128 \/ 500|42m \/ 200m/)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run Generate page tests and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/GeneratePage.test.tsx tests/ui/RecentGenerations.test.tsx
```

Expected: FAIL because Today's Usage does not exist.

- [ ] **Step 3: Implement truthful Today's Usage**

Create `src/components/generate/TodaysUsage.tsx`:

```tsx
import React from "react";

export function TodaysUsage() {
  return (
    <section className="todays-usage" aria-labelledby="todays-usage-title">
      <div className="panel-header compact">
        <h2 id="todays-usage-title">Today's Usage</h2>
        <span className="muted">Not connected</span>
      </div>
      <dl>
        <div><dt>Images Generated</dt><dd>—</dd></div>
        <div><dt>Compute Time</dt><dd>—</dd></div>
      </dl>
      <a href="/usage">View Usage Details</a>
    </section>
  );
}
```

Do not render reset timers or progress widths.

- [ ] **Step 4: Compose lower content and retain real recent images**

Wrap `RecentGenerations` and `TodaysUsage` in `.create-lower-grid`. Keep the recent list capped at six real assets, retain the empty state, and change the link label to `View All` while preserving `/history`.

- [ ] **Step 5: Run the complete Create UI test set**

Run:

```powershell
npm.cmd test -- tests/ui/GeneratePage.test.tsx tests/ui/GenerateWorkspace.test.tsx tests/ui/GenerationChat.test.tsx tests/ui/ParameterPanel.test.tsx tests/ui/RecentGenerations.test.tsx
npm.cmd run typecheck
```

Expected: all Create tests pass before adding secondary routes.

## Task 9: Move Provider Administration into the Role-Aware Models Route

**Files:**
- Create: `src/components/models/ModelCatalog.tsx`
- Create: `src/app/models/page.tsx`
- Create: `tests/ui/ModelsPage.test.tsx`
- Modify: `src/app/admin/providers/page.tsx`
- Modify: `tests/ui/AdminProvidersPage.test.tsx`

- [ ] **Step 1: Write failing Models page tests**

Create `tests/ui/ModelsPage.test.tsx` with ADMIN and MEMBER cases.

For ADMIN, mock real providers/options and assert:

```ts
expect(screen.getByRole("heading", { name: "Models" })).toBeInTheDocument();
expect(screen.getByText("OpenAI Proxy")).toBeInTheDocument();
expect(screen.getByText("https://images.example.com/v1")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Save provider" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Update provider" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Add model" })).toBeInTheDocument();
```

For MEMBER, assert the safe catalog shows `OpenAI Proxy / gpt-image-2`, does not render Base URL, provider forms, API key labels, or encrypted credential fields, and keeps the Models navigation item active.

- [ ] **Step 2: Rewrite the old admin-page test as a compatibility test**

Update `tests/ui/AdminProvidersPage.test.tsx` to assert:

```ts
await expect(AdminProvidersPage()).rejects.toThrow("NEXT_REDIRECT");
expect(mocks.redirect).toHaveBeenCalledWith("/models");
```

Keep separate member/missing-session assertions that still redirect to `/login` before the compatibility redirect.

- [ ] **Step 3: Run both route tests and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/ModelsPage.test.tsx tests/ui/AdminProvidersPage.test.tsx
```

Expected: FAIL because `/models` does not exist and `/admin/providers` still renders the full page.

- [ ] **Step 4: Implement the safe catalog component**

Create `src/components/models/ModelCatalog.tsx`:

```tsx
import React from "react";

type CatalogModel = {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
};

export function ModelCatalog({
  models,
  currentModelId
}: {
  models: CatalogModel[];
  currentModelId?: string;
}) {
  return (
    <section className="page-card model-catalog" aria-labelledby="model-catalog-title">
      <div className="panel-header compact">
        <h2 id="model-catalog-title">Available models</h2>
        <span>{models.length || "—"}</span>
      </div>
      {models.length ? (
        <ul className="model-catalog__list">
          {models.map((model) => (
            <li key={model.id}>
              <strong>{model.providerName} / {model.name}</strong>
              {model.id === currentModelId ? <span>Current</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No enabled models are connected.</p>
      )}
    </section>
  );
}
```

Do not accept Base URL, API key, defaultParams, capabilities, or encrypted data as props.

- [ ] **Step 5: Implement the role-aware Models page**

Create `src/app/models/page.tsx`:

- obtain `session` with `requireMemberPageSession`;
- load `listGenerationOptions()` for both roles;
- derive safe catalog entries by joining provider names to models;
- load `listProviders()` only when `session.role === "ADMIN"`;
- call `getAuthenticatedShellContext({ session, generationOptions: options })` and render `AuthenticatedAppShell` with that context;
- render `ModelCatalog` for both roles;
- render the existing configured-provider table, `ProviderForm`, `ProviderEditForm`, and `ProviderModelForm` only for ADMIN;
- preserve current database-error fallbacks and form behavior.

The page title is Models, not Provider Admin.

- [ ] **Step 6: Convert the old route to a guarded redirect**

Replace `src/app/admin/providers/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

import { requireAdminPageSession } from "../../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  await requireAdminPageSession();
  redirect("/models");
}
```

- [ ] **Step 7: Run model/admin/provider regressions**

Run:

```powershell
npm.cmd test -- tests/ui/ModelsPage.test.tsx tests/ui/AdminProvidersPage.test.tsx tests/ui/ProviderForm.test.tsx tests/ui/ProviderEditForm.test.tsx tests/ui/ProviderModelForm.test.tsx
npm.cmd run typecheck
```

Expected: ADMIN management works at `/models`; MEMBER output contains safe catalog data only; old URL redirects.

## Task 10: Add Batch Jobs and Dataset Preview Routes

**Files:**
- Create: `src/components/prototype/BatchJobsPreview.tsx`
- Create: `src/components/prototype/DatasetPreview.tsx`
- Create: `src/app/batch-jobs/page.tsx`
- Create: `src/app/dataset/page.tsx`
- Create: `tests/ui/PrototypePages.test.tsx`

- [ ] **Step 1: Write failing Batch Jobs and Dataset tests**

Create `tests/ui/PrototypePages.test.tsx`. For Batch Jobs assert:

- the banner is visible;
- All, Queued, Running, Completed, and Failed tabs change local `aria-selected` state;
- the empty table contains Job ID, Input, Model, Progress, Status, Created, and Actions headers;
- New Batch Job opens a dialog with File, Model, and Output settings;
- submitting displays `Interface preview · Batch job was not saved`;
- `fetch` is never called.

For Dataset assert:

- Dataset and Files tabs switch locally;
- summary values are `—`;
- Import Dataset opens a drawer/dialog with Dataset name and file input;
- selecting a file does not fetch;
- submitting displays `Interface preview · Dataset was not saved` and no row appears.

- [ ] **Step 2: Run preview tests and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/PrototypePages.test.tsx
```

Expected: FAIL because neither preview component exists.

- [ ] **Step 3: Implement BatchJobsPreview**

Create `src/components/prototype/BatchJobsPreview.tsx` as a client component. Use local state for active status, search, dialog open, selected file name, model, and output. The table body always renders one empty row:

```tsx
<tr>
  <td colSpan={7}>No batch jobs · Data not connected</td>
</tr>
```

The form submit calls `event.preventDefault()`, closes the dialog, clears file state, and calls `showPreviewFeedback("Batch job")`. It must not call fetch, a server action, or `URL.createObjectURL`.

- [ ] **Step 4: Implement DatasetPreview**

Create `src/components/prototype/DatasetPreview.tsx` with local tab and import-dialog state. Render three summary cards: Datasets `—`, Files `—`, Storage `—`. The selected file name may be shown inside the open dialog only. Submit clears it and shows preview feedback; it must not upload or append a fake dataset.

Both components read `language` from `useShellState` and define complete English/Chinese copy objects for their headings, tabs, empty states, field labels, and feedback actions.

- [ ] **Step 5: Add authenticated route wrappers**

Create `src/app/batch-jobs/page.tsx`:

```tsx
import { AuthenticatedAppShell, getAuthenticatedShellContext } from "../../components/layout/AuthenticatedAppShell";
import { BatchJobsPreview } from "../../components/prototype/BatchJobsPreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function BatchJobsPage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });
  return (
    <AuthenticatedAppShell context={shellContext}>
      <BatchJobsPreview />
    </AuthenticatedAppShell>
  );
}
```

Create `src/app/dataset/page.tsx`:

```tsx
import { AuthenticatedAppShell, getAuthenticatedShellContext } from "../../components/layout/AuthenticatedAppShell";
import { DatasetPreview } from "../../components/prototype/DatasetPreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function DatasetPage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });
  return (
    <AuthenticatedAppShell context={shellContext}>
      <DatasetPreview />
    </AuthenticatedAppShell>
  );
}
```

- [ ] **Step 6: Run route/component tests and typecheck**

Run:

```powershell
npm.cmd test -- tests/ui/PrototypePages.test.tsx tests/ui/AppShell.test.tsx
npm.cmd run typecheck
```

Expected: both routes are interactive, truthful, authenticated, and network-free.

## Task 11: Add API Keys, Usage & Billing, and Settings Preview Routes

**Files:**
- Create: `src/components/prototype/ApiKeysPreview.tsx`
- Create: `src/components/prototype/UsagePreview.tsx`
- Create: `src/components/prototype/SettingsPreview.tsx`
- Create: `src/app/api-keys/page.tsx`
- Create: `src/app/usage/page.tsx`
- Create: `src/app/settings/page.tsx`
- Modify: `tests/ui/PrototypePages.test.tsx`

- [ ] **Step 1: Add failing API Keys tests**

Assert the empty key table is present, Create API Key opens fields for Name, Scope, and Expiration, and submit displays preview feedback. Explicitly assert the document does not contain:

```ts
expect(document.body).not.toHaveTextContent(/sk-[a-z0-9]+/i);
expect(document.body).not.toHaveTextContent(/••••|\*\*\*\*/);
```

No fake or masked key may appear before or after submit.

- [ ] **Step 2: Add failing Usage & Billing tests**

Assert period controls switch locally and the page contains Images Generated, Compute Time, Estimated Cost, and Billing Status with only `—`/`Not connected`. Assert no price, plan, quota fraction, or percentage appears.

- [ ] **Step 3: Add failing Settings tests**

Render with real props `{ account: "member", email: "member@example.com", role: "MEMBER" }`. Assert Profile uses them, Region is Local, and Appearance, Language, Generation, and Notifications controls change selected state locally. After a simulated Save click, assert feedback appears and fetch remains untouched.

- [ ] **Step 4: Run the expanded preview suite and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/PrototypePages.test.tsx
```

Expected: FAIL for the three missing previews.

- [ ] **Step 5: Implement ApiKeysPreview**

Use `PrototypePageFrame`, an always-empty table, and `PrototypeDialog`. Scope options are `Generate`, `History`, and `Models`; expiration options are `30 days`, `90 days`, and `No expiration`. These are visual selections only. Submit clears form state and shows `Interface preview · API key was not saved`; it never produces a secret.

- [ ] **Step 6: Implement UsagePreview**

Render period buttons, four summary cards, an empty chart surface with `Usage data is not connected`, a details table with an empty state, and Billing Status `Not connected`. Every numerical output is `—`; do not render fabricated bars with non-zero widths.

- [ ] **Step 7: Implement SettingsPreview and its route data**

`SettingsPreview` receives:

```ts
type SettingsPreviewProps = {
  account: string;
  email?: string;
  role: "ADMIN" | "MEMBER";
};
```

Profile fields are read-only real values. Appearance, default generation preferences, and notifications use local state. Language calls `setLanguage` from `useShellState`. Region is a read-only Local value.

In `src/app/settings/page.tsx`, use the account data already returned by `getAuthenticatedShellContext`. Pass `shellContext.accountLabel`, `shellContext.accountEmail`, and `shellContext.role` to SettingsPreview; do not add an identity API or make a duplicate user query.

- [ ] **Step 8: Add the three authenticated page wrappers**

Create `src/app/api-keys/page.tsx`:

```tsx
import { AuthenticatedAppShell, getAuthenticatedShellContext } from "../../components/layout/AuthenticatedAppShell";
import { ApiKeysPreview } from "../../components/prototype/ApiKeysPreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });
  return (
    <AuthenticatedAppShell context={shellContext}>
      <ApiKeysPreview />
    </AuthenticatedAppShell>
  );
}
```

Create `src/app/usage/page.tsx`:

```tsx
import { AuthenticatedAppShell, getAuthenticatedShellContext } from "../../components/layout/AuthenticatedAppShell";
import { UsagePreview } from "../../components/prototype/UsagePreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });
  return (
    <AuthenticatedAppShell context={shellContext}>
      <UsagePreview />
    </AuthenticatedAppShell>
  );
}
```

Neither route accepts search params or invokes a mutation.

Create `src/app/settings/page.tsx`:

```tsx
import { AuthenticatedAppShell, getAuthenticatedShellContext } from "../../components/layout/AuthenticatedAppShell";
import { SettingsPreview } from "../../components/prototype/SettingsPreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });

  return (
    <AuthenticatedAppShell context={shellContext}>
      <SettingsPreview
        account={shellContext.accountLabel}
        email={shellContext.accountEmail}
        role={shellContext.role}
      />
    </AuthenticatedAppShell>
  );
}
```

- [ ] **Step 9: Run all prototype tests and typecheck**

Run:

```powershell
npm.cmd test -- tests/ui/PrototypeScaffold.test.tsx tests/ui/PrototypePages.test.tsx
npm.cmd run typecheck
```

Expected: all five preview routes pass their network-free and no-fake-data assertions.

## Task 12: Implement the Reference Layout and Responsive CSS Contract

**Files:**
- Modify: `tests/ui/GlobalStyles.test.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update the CSS contract tests first**

Extend the required-selector list with:

```ts
[
  "app-header__actions",
  "shell-popover",
  "sidebar-footer",
  "mobile-menu-button",
  "mobile-nav-backdrop",
  "mobile-nav-drawer",
  "create-toolbar",
  "prototype-notice",
  "prototype-dialog",
  "create-lower-grid",
  "todays-usage",
  "prototype-table",
  "model-catalog"
]
```

Replace the old 767px scrolling-navigation expectations with:

```ts
expect(normalizeValue(sidebar.get("display"))).toBe("none");
expect(normalizeValue(menuButton.get("display"))).not.toBe("none");
expect(isSingleColumn(editor.get("grid-template-columns"))).toBe(true);
expect(isSingleColumn(settings.get("grid-template-columns"))).toBe(true);
expect(normalizeValue(preview.get("aspect-ratio"))).toBe("1");
```

Add assertions that:

- 1279px uses an 80px icon rail and a two-region Create workspace;
- 1023px stacks the workspace and releases sticky Parameters;
- mobile tables use card/grid rows instead of page-level overflow;
- menu, drawer-close, dialog-close, and primary action controls have at least 44px minimum height/width;
- focus-visible and reduced-motion rules remain present.

- [ ] **Step 2: Run the CSS contract and verify failure**

Run:

```powershell
npm.cmd test -- tests/ui/GlobalStyles.test.ts
```

Expected: FAIL because current mobile CSS uses a horizontally scrolling sidebar and lacks new selectors.

- [ ] **Step 3: Add shell, header, footer, popover, and drawer styles incrementally**

Append focused class rules without changing the approved color variables or adding broad `section`, `aside`, `form`, `article`, `main`, or primary `button` pollution. Required behavior:

```css
.mobile-menu-button,
.mobile-nav-backdrop {
  display: none;
}

.mobile-nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 23, 42, 0.36);
}

.mobile-nav-drawer {
  width: min(88vw, 340px);
  height: 100%;
  overflow-y: auto;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 16px;
}

.shell-popover,
.prototype-dialog {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.14);
}
```

All popovers are positioned against their action buttons on desktop and rendered as full-width sections inside the mobile drawer.

- [ ] **Step 4: Add Create and prototype surface styles**

Keep the desktop shell at approximately 68px header and 248px sidebar. Use:

```css
.generation-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 332px;
  gap: 18px;
  align-items: start;
}

.generation-editor {
  display: grid;
  grid-template-columns: 312px minmax(0, 1fr);
  gap: 18px;
}

.create-lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 332px;
  gap: 18px;
}
```

Add scoped rules for CreateToolbar, prompt tools, negative prompt, preview actions, Advanced delivery, prototype controls/notices/status, page filters, empty charts, model catalog, dialogs, and tables. Preserve the existing light canvas, white surfaces, gray borders, indigo accent, 8px rhythm, 10–12px card radii, and visible focus rings.

- [ ] **Step 5: Replace responsive rules at exact breakpoints**

At `max-width: 1279px`:

```css
.app-shell-body { grid-template-columns: 80px minmax(0, 1fr); }
.generation-editor { grid-template-columns: minmax(0, 1fr); }
.generation-workspace { grid-template-columns: minmax(0, 1fr) 300px; }
```

Keep nav labels visually hidden but expose a visible hover/focus tooltip using `data-label` or a pseudo-element.

At `max-width: 1023px`:

```css
.generation-workspace,
.create-lower-grid { grid-template-columns: minmax(0, 1fr); }
.generation-parameters { position: static; }
```

At `max-width: 767px`:

```css
.app-shell-body { grid-template-columns: minmax(0, 1fr); }
.app-sidebar { display: none; }
.mobile-menu-button { display: inline-flex; }
.mobile-nav-backdrop { display: block; }
.app-content { padding: 20px 16px 36px; }
.create-toolbar,
.generation-editor,
.generation-parameters .setting-stack { grid-template-columns: minmax(0, 1fr); }
.preview-stage { aspect-ratio: 1; }
.generation-submit { width: 100%; }
```

For `.prototype-table` below 767px, visually hide `<thead>`, render each `<tr>` as a card, and display each `<td data-label>` as a two-column row. Do not set page-level `overflow-x`.

- [ ] **Step 6: Run style and full UI tests**

Run:

```powershell
npm.cmd test -- tests/ui/GlobalStyles.test.ts
npm.cmd test -- tests/ui
npm.cmd run typecheck
```

Expected: all UI tests pass, mobile navigation contract is drawer-based, and previous light-theme/accessibility rules remain green.

## Task 13: Full Regression, Build, Compose, and Browser Verification

**Files:**
- Modify only if verification exposes a tested defect in the files already listed above.
- Do not modify API contracts, Prisma schema, worker, or storage to make a visual test pass.

- [ ] **Step 1: Run focused route and generation tests**

Run:

```powershell
npm.cmd test -- tests/ui/AppShell.test.tsx tests/ui/GeneratePage.test.tsx tests/ui/GenerateWorkspace.test.tsx tests/ui/GenerationChat.test.tsx tests/ui/ParameterPanel.test.tsx tests/ui/ModelsPage.test.tsx tests/ui/PrototypePages.test.tsx tests/ui/GlobalStyles.test.ts
```

Expected: PASS. Inspect failures before changing code; never weaken real request-payload assertions.

- [ ] **Step 2: Run the full automated gates**

Run in this order:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
docker compose config
```

Expected: complete Vitest suite, strict TypeScript, production Next build, and Compose validation all exit 0.

- [ ] **Step 3: Start the complete stack after build**

Run:

```powershell
docker compose up --build -d
docker compose ps
```

Expected: app and worker running; postgres healthy; app mapped to `http://localhost:3000`.

- [ ] **Step 4: Verify authenticated routes and truthful data**

Log in with the configured local admin. Check:

```text
/
/generate
/history
/batch-jobs
/dataset
/models
/api-keys
/usage
/settings
/admin/providers
/login
```

Expected:

- `/admin/providers` redirects ADMIN to `/models`;
- all nine sidebar destinations open;
- Models admin forms retain real CRUD behavior;
- real generation still queues, polls, archives, downloads, and reuses;
- prototype actions show feedback and create no network requests or rows;
- Quota/Usage show Not connected or `—`, never invented values;
- browser console contains no new errors.

- [ ] **Step 5: Verify accessibility and responsive widths**

At 1536, 1279, 1023, 767, and 375px verify:

- no page-level horizontal scrolling;
- full sidebar, icon rail, stacked workspace, and mobile drawer appear at the intended breakpoints;
- drawer closes on link, backdrop, close button, and Escape and returns focus;
- dialogs trap/restore focus;
- Tab order and focus rings remain visible;
- icon buttons have accessible names;
- touch targets are at least 44px;
- tables become mobile cards;
- reduced motion is honored.

Capture screenshots of Create, one empty prototype page, Models ADMIN, and the mobile drawer at representative widths.

- [ ] **Step 6: Inspect final state without staging or committing**

Run:

```powershell
git status --short --branch
git diff --stat
git diff --check
```

Expected: only intended incremental source, test, CSS, and new documentation changes; no `.env`, database files, generated images, secrets, bulk line-ending rewrites, commits, or staged files.

- [ ] **Step 7: Stop safely when requested**

Run only:

```powershell
docker compose down
```

Never use `docker compose down -v` unless the user explicitly asks to delete local database and image volumes.
