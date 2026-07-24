"use client";

import React, {
  type ReactNode,
  useCallback,
  useId,
  useRef,
  useState
} from "react";

import {
  type LocalizedText,
  useLocalizedCopy
} from "../i18n/localization";
import { useShellLanguage } from "../layout/ShellState";
import { useOverlayFocus } from "../ui/useOverlayFocus";

export const prototypeBoundaryMessage =
  "Interface preview · Data not connected";

export function PrototypeNotice() {
  const text = useLocalizedCopy({
    en: prototypeBoundaryMessage,
    zh: "界面预览 · 数据未连接"
  });

  return <p className="prototype-notice">{text}</p>;
}

export function PrototypeStatus({ message }: { message: string }) {
  return message ? (
    <p className="prototype-status" role="status" aria-live="polite">
      {message}
    </p>
  ) : null;
}

export function usePrototypeFeedback() {
  const language = useShellLanguage();
  const [action, setAction] = useState<LocalizedText | null>(null);
  const showPreviewFeedback = useCallback((nextAction: LocalizedText) => {
    setAction(nextAction);
  }, []);
  const clearPreviewFeedback = useCallback(() => setAction(null), []);
  const message = action
    ? language === "zh"
      ? `界面预览 · ${action.zh}未保存`
      : `Interface preview · ${action.en} was not saved`
    : "";

  return { message, showPreviewFeedback, clearPreviewFeedback };
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
  const text = useLocalizedCopy({
    en: { eyebrow: "Interface preview" },
    zh: { eyebrow: "界面预览" }
  });

  return (
    <>
      <section className="page-heading prototype-page-heading">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
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
  const text = useLocalizedCopy({
    en: { close: "Close dialog" },
    zh: { close: "关闭对话框" }
  });
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
          <button type="button" aria-label={text.close} onClick={onClose}>
            ×
          </button>
        </header>
        <div className="prototype-dialog__body">{children}</div>
        {actions ? <footer>{actions}</footer> : null}
      </div>
    </div>
  );
}
