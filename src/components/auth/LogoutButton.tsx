"use client";

import React from "react";
import { useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";

export function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const text = useLocalizedCopy({
    en: { idle: "Logout", submitting: "Logging out..." },
    zh: { idle: "退出登录", submitting: "正在退出..." }
  });

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <button type="button" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? text.submitting : text.idle}
    </button>
  );
}
