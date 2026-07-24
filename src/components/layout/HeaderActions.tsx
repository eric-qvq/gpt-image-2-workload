"use client";

import React, { useCallback, useRef, useState } from "react";

import { LogoutButton } from "../auth/LogoutButton";
import { useLocalizedCopy } from "../i18n/localization";
import { useOverlayFocus } from "../ui/useOverlayFocus";

type HeaderPanelName = "quota" | "docs" | "notifications" | "account";

type HeaderActionsProps = {
  role: "ADMIN" | "MEMBER";
  accountLabel: string;
  accountEmail?: string;
  mobile?: boolean;
};

function HeaderPanel({
  label,
  onClose,
  returnFocusRef,
  closeLabel,
  children
}: {
  label: string;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useOverlayFocus(true, panelRef, onClose, returnFocusRef);

  return (
    <div
      ref={panelRef}
      aria-label={label}
      aria-modal="false"
      className="shell-popover"
      role="dialog"
    >
      <div className="shell-popover__header">
        <strong>{label}</strong>
        <button type="button" aria-label={closeLabel} onClick={onClose}>
          ×
        </button>
      </div>
      <div className="shell-popover__body">{children}</div>
    </div>
  );
}

export function HeaderActions({
  role,
  accountLabel,
  accountEmail,
  mobile = false
}: HeaderActionsProps) {
  const [openPanel, setOpenPanel] = useState<HeaderPanelName | null>(null);
  const quotaRef = useRef<HTMLButtonElement>(null);
  const docsRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLButtonElement>(null);
  const closePanel = useCallback(() => setOpenPanel(null), []);
  const copy = useLocalizedCopy({
    en: {
      quota: "Quota",
      docs: "Docs",
      notifications: "Notifications",
      account: "Account",
      noNotifications: "No notifications.",
      quotaUnavailable: "Quota data is not connected.",
      docsText: "Real workflow: Models → Create → History",
      notConnected: "Not connected",
      closeQuota: "Close quota",
      closeDocs: "Close docs",
      closeNotifications: "Close notifications",
      closeAccount: "Close account"
    },
    zh: {
          quota: "配额",
          docs: "文档",
          notifications: "通知",
          account: "账户",
          noNotifications: "暂无通知。",
          quotaUnavailable: "配额数据尚未连接。",
      docsText: "真实使用流程：模型 → 创建 → 历史记录",
      notConnected: "未连接",
      closeQuota: "关闭配额面板",
      closeDocs: "关闭文档面板",
      closeNotifications: "关闭通知面板",
      closeAccount: "关闭账户面板"
    }
  });

  function togglePanel(panel: HeaderPanelName) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  return (
    <div
      className={`app-header__actions${mobile ? " app-header__actions--mobile" : ""}`}
    >
      <div className="header-action">
        <button
          ref={quotaRef}
          type="button"
          aria-expanded={openPanel === "quota"}
          aria-label={copy.quota}
          onClick={() => togglePanel("quota")}
        >
          <span>{copy.quota}</span>
          <span>{copy.notConnected}</span>
        </button>
        {openPanel === "quota" ? (
          <HeaderPanel
            label={copy.quota}
            onClose={closePanel}
            returnFocusRef={quotaRef}
            closeLabel={copy.closeQuota}
          >
            <p>{copy.quotaUnavailable}</p>
          </HeaderPanel>
        ) : null}
      </div>

      <div className="header-action">
        <button
          ref={docsRef}
          type="button"
          aria-expanded={openPanel === "docs"}
          aria-label={copy.docs}
          onClick={() => togglePanel("docs")}
        >
          {copy.docs}
        </button>
        {openPanel === "docs" ? (
          <HeaderPanel
            label={copy.docs}
            onClose={closePanel}
            returnFocusRef={docsRef}
            closeLabel={copy.closeDocs}
          >
            <p>{copy.docsText}</p>
          </HeaderPanel>
        ) : null}
      </div>

      <div className="header-action">
        <button
          ref={notificationsRef}
          type="button"
          aria-expanded={openPanel === "notifications"}
          aria-label={copy.notifications}
          onClick={() => togglePanel("notifications")}
        >
          {copy.notifications}
        </button>
        {openPanel === "notifications" ? (
          <HeaderPanel
            label={copy.notifications}
            onClose={closePanel}
            returnFocusRef={notificationsRef}
            closeLabel={copy.closeNotifications}
          >
            <p>{copy.noNotifications}</p>
          </HeaderPanel>
        ) : null}
      </div>

      <div className="header-action">
        <button
          ref={accountRef}
          type="button"
          aria-expanded={openPanel === "account"}
          aria-label={`${copy.account}: ${accountLabel}`}
          onClick={() => togglePanel("account")}
        >
          <span aria-hidden="true">{accountLabel.slice(0, 1).toUpperCase()}</span>
          <span>{accountLabel}</span>
        </button>
        {openPanel === "account" ? (
          <HeaderPanel
            label={copy.account}
            onClose={closePanel}
            returnFocusRef={accountRef}
            closeLabel={copy.closeAccount}
          >
            <p><strong>{accountLabel}</strong></p>
            {accountEmail ? <p>{accountEmail}</p> : null}
            <p>{role}</p>
            <LogoutButton />
          </HeaderPanel>
        ) : null}
      </div>
    </div>
  );
}
