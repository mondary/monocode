import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EXPLORER_SETTINGS_CHANGE_EVENT,
  loadExplorerHighlightActions,
  loadExplorerShowChanges,
  saveExplorerHighlightActions,
  saveExplorerShowChanges,
} from "./explorerSettings";

describe("explorer header settings", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    vi.stubGlobal("window", new EventTarget());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the Changes button and skips the accent tint by default", () => {
    expect(loadExplorerShowChanges()).toBe(true);
    expect(loadExplorerHighlightActions()).toBe(false);
  });

  it("persists both options across a reload", () => {
    saveExplorerShowChanges(false);
    saveExplorerHighlightActions(true);

    expect(loadExplorerShowChanges()).toBe(false);
    expect(loadExplorerHighlightActions()).toBe(true);
  });

  it("announces every save so mounted Explorer headers follow along", () => {
    const listener = vi.fn();
    window.addEventListener(EXPLORER_SETTINGS_CHANGE_EVENT, listener);

    saveExplorerShowChanges(false);
    saveExplorerHighlightActions(true);

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
