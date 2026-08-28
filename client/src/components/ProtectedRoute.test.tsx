import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { me } from "../services/api/auth";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../services/api/auth", () => ({ me: vi.fn() }));
vi.mock("./app/AppHeader", () => ({ default: () => <header /> }));
vi.mock("./dice/DiceRoller", () => ({ default: () => null }));
vi.mock("./app/LiveSessionSocketBridge", () => ({
  LiveSessionSocketBridge: () => null,
}));

const asked = vi.mocked(me);

const renderAt = (path = "/campaigns") => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/campaigns" element={<p>The campaign list</p>} />
          </Route>
          <Route path="/auth" element={<p>Sign in</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  asked.mockReset();
});

describe("what a visitor sees before the server has answered", () => {
  it("waits rather than flashing the sign-in screen", () => {
    asked.mockReturnValue(new Promise(() => {}));

    renderAt();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    expect(screen.queryByText("The campaign list")).not.toBeInTheDocument();
  });
});

describe("what a visitor sees once the server has answered", () => {
  it("sends the guest to the sign-in screen", async () => {
    asked.mockRejectedValue(new Error("Unauthorized"));

    renderAt();

    expect(await screen.findByText("Sign in")).toBeInTheDocument();
    expect(screen.queryByText("The campaign list")).not.toBeInTheDocument();
  });

  it("lets a signed-in user through to what they asked for", async () => {
    asked.mockResolvedValue({
      status: "ok",
      message: "User information",
      user: { id: "user-1", email: "mira@demo.local", displayName: "Mira" },
    });

    renderAt();

    expect(await screen.findByText("The campaign list")).toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });
});
