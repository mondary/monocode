import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PROJECT_INIT_SETTINGS,
  loadProjectInitSettings,
  projectInitResultMessage,
  saveProjectInitSettings,
} from "./projectInit";

const KEY = "monocode.projectInitialization";

describe("project initialization settings", () => {
  beforeEach(mockLocalStorage);
  afterEach(() => localStorage.removeItem(KEY));

  it("defaults to the shared agent and inspiration links", () => {
    expect(loadProjectInitSettings()).toEqual(DEFAULT_PROJECT_INIT_SETTINGS);
  });

  it("persists custom links and removes incomplete rows", () => {
    saveProjectInitSettings({
      links: [
        { source: "~/templates", target: ".templates" },
        { source: "", target: ".empty" },
      ],
      linkAgentInstructions: false,
      ensureGitignore: false,
      createMetadataFiles: false,
    });

    expect(loadProjectInitSettings()).toEqual({
      links: [{ source: "~/templates", target: ".templates" }],
      linkAgentInstructions: false,
      ensureGitignore: false,
      createMetadataFiles: false,
    });
  });

  it("summarizes created, preserved, missing, and metadata actions", () => {
    expect(
      projectInitResultMessage({
        created: [".agent"],
        updated: [],
        existing: [".inspi"],
        skipped: [".local"],
        missing: ["CLAUDE.md"],
        metadataCreated: ["VERSION", "CHANGELOG.md"],
        gitignoreUpdated: true,
      }),
    ).toBe(
      "1 link ready, 1 already present, 1 local item kept, 1 source missing, 2 metadata files created, .gitignore updated.",
    );
  });
});

function mockLocalStorage() {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });
}
