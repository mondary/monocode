import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  customProviderTestLabel,
  deleteCustomProvider,
  loadCustomProviders,
  slugCustomProviderId,
  upsertCustomProvider,
} from "./customProviders";

describe("custom providers", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    vi.stubGlobal("window", new EventTarget());
    // Sync pushes the set into OpenCode's config via the backend; the invoke
    // call itself is covered by the Rust tests, not here.
    vi.stubGlobal("invoke", vi.fn().mockResolvedValue(undefined));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("derives the opencode config id from the name", () => {
    expect(slugCustomProviderId("Acme AI!")).toBe("pk-custom-acme-ai-");
  });

  it("starts empty and round-trips a provider", () => {
    expect(loadCustomProviders()).toEqual([]);

    upsertCustomProvider({
      id: "pk-custom-acme",
      name: "Acme",
      baseUrl: "https://api.acme.com/v1",
      apiKey: "secret",
      models: ["gpt-x"],
    });

    expect(loadCustomProviders()).toEqual([
      {
        id: "pk-custom-acme",
        name: "Acme",
        baseUrl: "https://api.acme.com/v1",
        apiKey: "secret",
        models: ["gpt-x"],
      },
    ]);
  });

  it("replaces on upsert and removes by id", () => {
    upsertCustomProvider({
      id: "pk-custom-acme",
      name: "Acme",
      baseUrl: "https://api.acme.com/v1",
      apiKey: "secret",
      models: [],
    });
    upsertCustomProvider({
      id: "pk-custom-acme",
      name: "Acme",
      baseUrl: "https://api.acme.com/v1",
      apiKey: "rotated",
      models: ["gpt-x", "gpt-y"],
    });

    expect(loadCustomProviders()).toHaveLength(1);
    expect(loadCustomProviders()[0]?.apiKey).toBe("rotated");

    deleteCustomProvider("pk-custom-acme");
    expect(loadCustomProviders()).toEqual([]);
  });

  it("labels probes for the Test buttons", () => {
    expect(customProviderTestLabel(null)).toBeNull();
    expect(
      customProviderTestLabel({ ok: true, status: 200, models: ["a", "b"], error: null }),
    ).toBe("OK — 2 models found");
    expect(
      customProviderTestLabel({
        ok: false,
        status: 401,
        models: [],
        error: "Unauthorized — check the API key. (HTTP 401)",
      }),
    ).toBe("Unauthorized — check the API key. (HTTP 401)");
  });
});
