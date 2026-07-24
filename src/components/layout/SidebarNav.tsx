"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { useLocalizedCopy } from "../i18n/localization";
import { useShellState } from "./ShellState";

export type AppRole = "ADMIN" | "MEMBER";

type NavigationItem = {
  href: string;
  label: { en: string; zh: string };
  icon:
    | "overview"
    | "create"
    | "history"
    | "batch"
    | "dataset"
    | "models"
    | "keys"
    | "usage"
    | "settings";
};

const navigationItems: NavigationItem[] = [
  { href: "/", label: { en: "Overview", zh: "概览" }, icon: "overview" },
  {
    href: "/generate",
    label: { en: "Create", zh: "创建" },
    icon: "create"
  },
  {
    href: "/history",
    label: { en: "History", zh: "历史记录" },
    icon: "history"
  },
  {
    href: "/batch-jobs",
    label: { en: "Batch Jobs", zh: "批量任务" },
    icon: "batch"
  },
  {
    href: "/dataset",
    label: { en: "Dataset", zh: "数据集" },
    icon: "dataset"
  },
  {
    href: "/models",
    label: { en: "Models", zh: "模型" },
    icon: "models"
  },
  {
    href: "/api-keys",
    label: { en: "API Keys", zh: "API 密钥" },
    icon: "keys"
  },
  {
    href: "/usage",
    label: { en: "Usage & Billing", zh: "用量与账单" },
    icon: "usage"
  },
  {
    href: "/settings",
    label: { en: "Settings", zh: "设置" },
    icon: "settings"
  }
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ icon }: { icon: NavigationItem["icon"] }) {
  const paths = {
    overview: <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />,
    create: <path d="M12 3v18M3 12h18" />,
    history: <path d="M4 12a8 8 0 1 0 2.34-5.66L4 8.68M4 4v4.68h4.68M12 7v5l3 2" />,
    batch: <path d="M4 7h16M4 12h16M4 17h10M7 4v6M17 4v6" />,
    dataset: <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm-8 4 8 4 8-4M12 11v10" />,
    models: <path d="M5 5h14v14H5V5Zm3 3h8v8H8V8Zm4-6v3m0 14v3M2 12h3m14 0h3" />,
    keys: <path d="M14 7a5 5 0 1 0-3.9 4.88L13 15h3v3h3v-3.17l-5.1-5.1A5 5 0 0 0 14 7Z" />,
    usage: <path d="M4 19V9m6 10V5m6 14v-7m4 7V3" />,
    settings: <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8.2 3a6.8 6.8 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.8-1L15.6 3h-4l-.4 3.1a8 8 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a6.8 6.8 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.8 1l.4 3.1h4l.4-3.1a8 8 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5a6.8 6.8 0 0 0 .1-1Z" />
  };

  return (
    <svg
      aria-hidden="true"
      className="sidebar-nav__icon"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      {paths[icon]}
    </svg>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { language } = useShellState();
  const text = useLocalizedCopy({
    en: { navigation: "Primary navigation" },
    zh: { navigation: "主导航" }
  });

  return (
    <nav className="sidebar-nav" aria-label={text.navigation}>
      <ul className="sidebar-nav__list">
        {navigationItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          const label = item.label[language];

          return (
            <li className="sidebar-nav__item" key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`sidebar-nav__link${
                  isActive ? " sidebar-nav__link--active" : ""
                }`}
                data-label={label}
                href={item.href}
                onClick={onNavigate}
              >
                <NavIcon icon={item.icon} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
