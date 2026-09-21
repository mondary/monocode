// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WhatsNewBody, WhatsNewDialog } from "./WhatsNewDialog";

describe("WhatsNewBody", () => {
  it("renders the version notes without the changelog heading", () => {
    const markup = renderToStaticMarkup(
      createElement(WhatsNewBody, { version: "0.1.25" }),
    );

    expect(markup).toContain("whats-new-md");
    expect(markup).toContain('aria-label="What&#x27;s new in 0.1.25"');
    expect(markup).not.toContain("## [0.1.25]");
  });
});

describe("WhatsNewDialog", () => {
  it("renders side-by-side official and PK panes", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    act(() => {
      root.render(
        createElement(WhatsNewDialog, {
          officialVersion: "0.1.25",
          pkVersion: "2026.09.4",
          onClose: () => {},
        }),
      );
    });
    const markup = document.body.innerHTML;

    expect(markup).toContain("MonoCode officiel");
    expect(markup).toContain("MonoCodePK");
    expect(markup).toContain("0.1.25");
    expect(markup).toContain("2026.09.4");
    expect(markup).toContain("md:grid-cols-2");

    root.unmount();
    container.remove();
  });
});
