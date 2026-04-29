"use client";

import React from "react";
import { FormEvent, useState } from "react";

type LoginFormProps = {
  onSuccess?: () => void;
};

function defaultSuccess() {
  window.location.href = "/admin/providers";
}

export function LoginForm({ onSuccess = defaultSuccess }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: String(formData.get("account") ?? ""),
          password: String(formData.get("password") ?? "")
        })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };

        throw new Error(body.error ?? "Unable to sign in.");
      }

      onSuccess();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Account
        <input name="account" autoComplete="username" />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" />
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
