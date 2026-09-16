import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BUSY_GLOW_CHANGE_EVENT,
  BUSY_GLOW_DEFAULT,
  loadBusyGlowColor,
  saveBusyGlowColor,
} from "./busyGlowSettings";

describe("busy glow color setting", () => {
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

  it("follows the theme by default", () => {
    expect(loadBusyGlowColor()).toBe(BUSY_GLOW_DEFAULT);
  });

  it("persists a hex pick across a reload", () => {
    saveBusyGlowColor("#38bdf8");
    expect(loadBusyGlowColor()).toBe("#38bdf8");
  });

  it("rejects arbitrary strings back to the default", () => {
    storage.set("monocode.busyGlowColor", "url(javascript:1)");
    expect(loadBusyGlowColor()).toBe(BUSY_GLOW_DEFAULT);
  });

  it("announces every save so mounted rails follow along", () => {
    const listener = vi.fn();
    window.addEventListener(BUSY_GLOW_CHANGE_EVENT, listener);

    saveBusyGlowColor("#34d399");

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
