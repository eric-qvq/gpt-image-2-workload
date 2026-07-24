"use client";

import React, { useRef } from "react";

import { useLocalizedCopy } from "../i18n/localization";
import { useOverlayFocus } from "../ui/useOverlayFocus";
import { HeaderActions } from "./HeaderActions";
import { ShellFooterControls } from "./ShellFooterControls";
import { SidebarNav, type AppRole } from "./SidebarNav";

type MobileNavigationDrawerProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  role: AppRole;
  accountLabel: string;
  accountEmail?: string;
};

export function MobileNavigationDrawer({
  open,
  onClose,
  returnFocusRef,
  role,
  accountLabel,
  accountEmail
}: MobileNavigationDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const text = useLocalizedCopy({
    en: { navigation: "Mobile navigation", close: "Close navigation" },
    zh: { navigation: "移动导航", close: "关闭导航" }
  });

  useOverlayFocus(open, drawerRef, onClose, returnFocusRef);

  if (!open) return null;

  return (
    <div className="mobile-nav-backdrop" onMouseDown={onClose}>
      <aside
        ref={drawerRef}
        id="mobile-navigation"
        aria-label={text.navigation}
        aria-modal="true"
        className="mobile-nav-drawer"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" aria-label={text.close} onClick={onClose}>
          ×
        </button>
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
  );
}
