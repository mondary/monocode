import { describe, expect, it } from "vitest";
import {
  KEYBINDING_DEFAULTS,
  captureAccelerator,
  findBindingOwner,
  formatAccelerator,
  matchesAction,
  parseBinding,
  setKeybindingOverride,
} from "./keybindings";

type PartialKey = Partial<
  Pick<
    KeyboardEvent,
    "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey"
  >
>;

function key(partial: PartialKey): KeyboardEvent {
  return {
    key: "",
    code: "",
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    ...partial,
  } as KeyboardEvent;
}

describe("defaults catalog", () => {
  it("has unique default bindings", () => {
    const bindings = Object.values(KEYBINDING_DEFAULTS).map((d) => d.binding);
    expect(new Set(bindings).size).toBe(bindings.length);
  });

  it("labels every entry with a group and a when clause", () => {
    for (const def of Object.values(KEYBINDING_DEFAULTS)) {
      expect(def.label).toBeTruthy();
      expect(def.group).toBeTruthy();
      expect(def.when).toBeTruthy();
    }
  });
});

describe("parseBinding", () => {
  it("parses modifiers and key", () => {
    expect(parseBinding("CmdOrCtrl+Shift+K")).toEqual({
      mod: true,
      ctrlOnly: false,
      shift: true,
      alt: false,
      key: "k",
    });
    expect(parseBinding("Ctrl+Tab")).toEqual({
      mod: false,
      ctrlOnly: true,
      shift: false,
      alt: false,
      key: "Tab",
    });
    expect(parseBinding("CmdOrCtrl+Alt+Left")).toEqual({
      mod: true,
      ctrlOnly: false,
      shift: false,
      alt: true,
      key: "Left",
    });
  });

  it("rejects modifier-only strings", () => {
    expect(parseBinding("CmdOrCtrl")).toBeNull();
  });
});

describe("matchesAction", () => {
  it("matches meta or ctrl as mod", () => {
    expect(matchesAction(key({ key: "t", metaKey: true }), "new_tab")).toBe(
      true,
    );
    expect(matchesAction(key({ key: "t", ctrlKey: true }), "new_tab")).toBe(
      true,
    );
  });

  it("does not match missing or extra modifiers", () => {
    expect(matchesAction(key({ key: "t" }), "new_tab")).toBe(false);
    expect(
      matchesAction(key({ key: "t", metaKey: true, shiftKey: true }), "new_tab"),
    ).toBe(false);
    expect(
      matchesAction(key({ key: "t", metaKey: true, altKey: true }), "new_tab"),
    ).toBe(false);
  });

  it("normalizes physical keys across layouts", () => {
    expect(
      matchesAction(
        key({ key: "~", code: "Backquote", metaKey: true, shiftKey: true }),
        "new_terminal_tab",
      ),
    ).toBe(true);
    expect(
      matchesAction(key({ key: "{", code: "BracketLeft", metaKey: true }), "prev_tab"),
    ).toBe(false);
    expect(
      matchesAction(
        key({ key: "{", code: "BracketLeft", metaKey: true, shiftKey: true }),
        "prev_tab",
      ),
    ).toBe(true);
  });

  it("maps arrow keys onto binding names", () => {
    expect(
      matchesAction(
        key({ key: "ArrowLeft", metaKey: true, altKey: true }),
        "prev_session",
      ),
    ).toBe(true);
  });

  it("keeps Ctrl+Tab distinct from Cmd+Tab", () => {
    expect(matchesAction(key({ key: "Tab", ctrlKey: true }), "cycle_next_tab")).toBe(
      true,
    );
    expect(matchesAction(key({ key: "Tab", metaKey: true }), "cycle_next_tab")).toBe(
      false,
    );
  });

  it("honours overrides at match time", () => {
    expect(matchesAction(key({ key: "k", metaKey: true }), "open_search")).toBe(
      true,
    );
    setKeybindingOverride("open_search", "CmdOrCtrl+Shift+K");
    expect(matchesAction(key({ key: "k", metaKey: true }), "open_search")).toBe(
      false,
    );
    expect(
      matchesAction(
        key({ key: "k", metaKey: true, shiftKey: true }),
        "open_search",
      ),
    ).toBe(true);
    setKeybindingOverride("open_search", null);
    expect(matchesAction(key({ key: "k", metaKey: true }), "open_search")).toBe(
      true,
    );
  });
});

describe("captureAccelerator", () => {
  it("ignores bare modifier presses", () => {
    expect(captureAccelerator(key({ key: "Shift", shiftKey: true }))).toBeNull();
  });

  it("captures mod plus key", () => {
    expect(
      captureAccelerator(key({ key: "K", code: "KeyK", metaKey: true })),
    ).toBe("CmdOrCtrl+K");
    expect(
      captureAccelerator(key({ key: "~", code: "Backquote", metaKey: true, shiftKey: true })),
    ).toBe("CmdOrCtrl+Shift+`");
  });

  it("captures ctrl-only tab cycling", () => {
    expect(captureAccelerator(key({ key: "Tab", code: "Tab", ctrlKey: true }))).toBe(
      "Ctrl+Tab",
    );
    expect(
      captureAccelerator(
        key({ key: "Tab", code: "Tab", ctrlKey: true, shiftKey: true }),
      ),
    ).toBe("Ctrl+Shift+Tab");
  });

  it("rejects combos without modifiers", () => {
    expect(captureAccelerator(key({ key: "k", code: "KeyK" }))).toBeNull();
  });
});

describe("findBindingOwner", () => {
  it("finds the other action holding a binding", () => {
    setKeybindingOverride("open_search", "CmdOrCtrl+P");
    expect(findBindingOwner("go_to_file", "CmdOrCtrl+P")).toBe("App: Search");
    setKeybindingOverride("open_search", null);
    expect(findBindingOwner("go_to_file", "CmdOrCtrl+P")).toBeNull();
  });
});

describe("formatAccelerator", () => {
  it("renders without crashing for every default", () => {
    for (const def of Object.values(KEYBINDING_DEFAULTS)) {
      expect(formatAccelerator(def.binding).length).toBeGreaterThan(0);
    }
  });
});
