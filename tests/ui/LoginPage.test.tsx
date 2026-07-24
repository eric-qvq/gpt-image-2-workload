// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "../../src/app/login/page";

vi.stubGlobal("React", React);

describe("LoginPage", () => {
  it("renders a standalone labelled login card with the seeded account hint", () => {
    const { container } = render(<LoginPage />);
    const heading = screen.getByRole("heading", { name: "Login" });
    const main = heading.closest("main");
    const card = heading.closest("section");
    const form = screen.getByRole("button", { name: "Sign in" }).closest("form");

    expect(
      screen.queryByRole("navigation", { name: "Primary navigation" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(main).toHaveClass("login-page");
    expect(card).toHaveClass("login-card");
    expect(card).not.toHaveClass("hero");
    expect(card).toHaveAttribute("aria-labelledby", "login-title");
    expect(heading).toHaveAttribute("id", "login-title");

    const hint = screen.getByText("Default local account").closest("div");

    expect(hint).toHaveClass("login-hint");
    expect(within(hint as HTMLElement).getByText("admin / admin123456")).toBeInTheDocument();
    expect(form).toHaveClass("login-form");
    expect(screen.getByLabelText("Account")).toHaveAttribute("name", "account");
    expect(screen.getByLabelText("Password")).toHaveAttribute("name", "password");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });
});
