import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACTIVITY_DECAY_MS,
  activeTerminalIds,
  anyTerminalActive,
  forgetAllTerminals,
  forgetTerminal,
  markTerminalOutput,
  terminalActive,
} from "./terminalActivity";

describe("terminalActivity", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
  });
  afterEach(() => {
    forgetAllTerminals();
    vi.useRealTimers();
  });

  it("marks a terminal active on output", () => {
    expect(terminalActive("t1")).toBe(false);
    markTerminalOutput("t1");
    expect(terminalActive("t1")).toBe(true);
  });

  it("decays after the silence window", () => {
    markTerminalOutput("t1");
    vi.setSystemTime(10_000 + ACTIVITY_DECAY_MS - 1);
    expect(terminalActive("t1")).toBe(true);
    vi.setSystemTime(10_000 + ACTIVITY_DECAY_MS + 1);
    expect(terminalActive("t1")).toBe(false);
  });

  it("reports active ids across a dock", () => {
    markTerminalOutput("t1");
    expect(anyTerminalActive(["t2", "t3"])).toBe(false);
    expect(anyTerminalActive(["t2", "t1"])).toBe(true);
    expect(activeTerminalIds(["t2", "t1", "t3"])).toEqual(["t1"]);
  });

  it("forgets individual terminals", () => {
    markTerminalOutput("t1");
    forgetTerminal("t1");
    expect(terminalActive("t1")).toBe(false);
    forgetTerminal("unknown");
  });
});
