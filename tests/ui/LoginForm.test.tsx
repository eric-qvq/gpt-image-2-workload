import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "../../src/components/auth/LoginForm";

describe("LoginForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requires both credentials and exposes the submit styling hook", () => {
    render(<LoginForm onSuccess={vi.fn()} />);

    expect(screen.getByLabelText("Account")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveClass(
      "login-submit",
      "primary-button"
    );
  });

  it("submits credentials and calls onSuccess when login succeeds", async () => {
    const onSuccess = vi.fn();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ user: { id: "user_admin" } }), {
        status: 200
      })
    );

    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText("Account"), {
      target: { value: "admin@example.com" }
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "admin123456" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          account: "admin@example.com",
          password: "admin123456"
        })
      })
    );
  });

  it("shows an error when login fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401
      })
    );

    render(<LoginForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Account"), {
      target: { value: "admin@example.com" }
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "bad-password" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials"
    );
  });
});
