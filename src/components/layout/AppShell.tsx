"use client";

import React, { type ReactNode, useCallback, useRef } from "react";

import { useLocalizedCopy } from "../i18n/localization";
import { HeaderActions } from "./HeaderActions";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";
import { ShellFooterControls } from "./ShellFooterControls";
import { ShellStateProvider, useShellState } from "./ShellState";
import { type AppRole, SidebarNav } from "./SidebarNav";

type AppShellProps = {
  children: ReactNode;
  role: AppRole;
  accountLabel?: string;
  accountEmail?: string;
  initialModelName?: string;
};

type AppShellChromeProps = Required<Pick<AppShellProps, "children" | "role">> &
  Pick<AppShellProps, "accountEmail"> & {
    accountLabel: string;
  };

function AppShellChrome({
  children,
  role,
  accountLabel,
  accountEmail
}: AppShellChromeProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { mobileNavigationOpen, setMobileNavigationOpen } = useShellState();
  const text = useLocalizedCopy({
    en: {
      openNavigation: "Open navigation",
      applicationSidebar: "Application sidebar"
    },
    zh: {
      openNavigation: "打开导航",
      applicationSidebar: "应用侧边栏"
    }
  });
  const closeNavigation = useCallback(
    () => setMobileNavigationOpen(false),
    [setMobileNavigationOpen]
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          ref={menuButtonRef}
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={mobileNavigationOpen}
          aria-label={text.openNavigation}
          className="mobile-menu-button"
          onClick={() => setMobileNavigationOpen(true)}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <div className="app-brand">
          <svg
            aria-label="GPT Image Workbench logo"
            className="app-brand__logo"
            fill="none"
            role="img"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
            <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
          </svg>
          <span className="app-brand__name">GPT Image Workbench</span>
        </div>

        <div className="app-header__meta">
          <HeaderActions
            role={role}
            accountLabel={accountLabel}
            accountEmail={accountEmail}
          />
        </div>
      </header>

      <div className="app-shell-body">
        <aside className="app-sidebar" aria-label={text.applicationSidebar}>
          <SidebarNav />
          <ShellFooterControls />
        </aside>
        <main className="app-content">{children}</main>
      </div>
      <MobileNavigationDrawer
        open={mobileNavigationOpen}
        onClose={closeNavigation}
        returnFocusRef={menuButtonRef}
        role={role}
        accountLabel={accountLabel}
        accountEmail={accountEmail}
      />
    </div>
  );
}

export function AppShell({
  children,
  role,
  accountLabel = role,
  accountEmail,
  initialModelName = "Not connected"
}: AppShellProps) {
  return (
    <ShellStateProvider initialModelName={initialModelName}>
      <AppShellChrome
        role={role}
        accountLabel={accountLabel}
        accountEmail={accountEmail}
      >
        {children}
      </AppShellChrome>
    </ShellStateProvider>
  );
}
