"use client";

import React from "react";
import { useState } from "react";

export function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {isSubmitting ? "Logging out..." : "Logout"}
    </button>
  );
}
