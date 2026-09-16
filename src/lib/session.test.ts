import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  harnessLabel,
  harnessTitle,
  isCustomHarness,
} from "./session";
import { isHarnessAvailable } from "./harness/availability";

describe("custom harness ids", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects the pk-custom prefix", () => {
    expect(isCustomHarness("pk-custom-acme")).toBe(true);
    expect(isCustomHarness("claude")).toBe(false);
  });

  it("titles custom harnesses from their saved provider name", () => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) =>
        JSON.stringify([
          {
            id: "pk-custom-acme",
            name: "Acme AI",
            baseUrl: "https://api.acme.com/v1",
            apiKey: "k",
            models: ["gpt-x"],
          },
        ]),
      setItem: () => undefined,
    });

    expect(harnessTitle("pk-custom-acme")).toBe("Acme AI");
    expect(harnessLabel("pk-custom-acme")).toBe("Acme AI");
    expect(harnessTitle("claude")).toBe("Claude Code");
  });

  it("treats custom providers as available once saved", () => {
    expect(isHarnessAvailable("pk-custom-acme")).toBe(true);
  });
});
