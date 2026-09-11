import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UpdateRailCard } from "./UpdateRailCard";

describe("UpdateRailCard", () => {
  it("announces the version and names both actions", () => {
    const markup = renderToStaticMarkup(
      createElement(UpdateRailCard, {
        update: { version: "0.1.25" },
        onOpen: vi.fn(),
        onDismiss: vi.fn(),
      }),
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Mise à jour installée · 0.1.25");
    expect(markup).toContain('aria-label="Dismiss update notification"');
  });

  it("renders nothing without an update", () => {
    const markup = renderToStaticMarkup(
      createElement(UpdateRailCard, {
        update: null,
        onOpen: vi.fn(),
        onDismiss: vi.fn(),
      }),
    );
    expect(markup).toBe("");
  });
});
