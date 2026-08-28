import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

const Exploding = () => {
  throw new Error("the goblin ate the render");
};

const Working = () => <p>The party gathers</p>;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("when nothing has gone wrong", () => {
  it("shows what it was given and nothing of its own", () => {
    render(
      <ErrorBoundary>
        <Working />
      </ErrorBoundary>,
    );

    expect(screen.getByText("The party gathers")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("when a child throws while rendering", () => {
  it("replaces the blank screen with something a person can read", () => {
    render(
      <ErrorBoundary>
        <Exploding />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("The spell fizzled")).toBeInTheDocument();
  });

  it("offers the one action that can help", () => {
    render(
      <ErrorBoundary>
        <Exploding />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("button", { name: "Reload the page" }),
    ).toBeInTheDocument();
  });

  it("reloads when that action is taken", async () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });

    render(
      <ErrorBoundary>
        <Exploding />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Reload the page" }));

    expect(reload).toHaveBeenCalledOnce();
  });

  it("still reports the error, so a blank screen is never silent", () => {
    render(
      <ErrorBoundary>
        <Exploding />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalledWith(
      "Unhandled render error",
      expect.objectContaining({ message: "the goblin ate the render" }),
      expect.anything(),
    );
  });
});
