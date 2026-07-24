// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LogoutButton } from "../../src/components/auth/LogoutButton";

describe("LogoutButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to logout and redirects to login", async () => {
    const location = window.location;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "/" }
    });

    try {
      render(<LogoutButton />);
      fireEvent.click(screen.getByRole("button", { name: "Logout" }));

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/logout",
          expect.objectContaining({ method: "POST" })
        )
      );
      expect(window.location.href).toBe("/login");
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: location
      });
    }
  });
});
