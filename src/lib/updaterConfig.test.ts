import { afterEach, describe, expect, it, vi } from "vitest";

const { getVersion, check, message, ask, relaunch, invoke } = vi.hoisted(() => ({
  getVersion: vi.fn(),
  check: vi.fn(),
  message: vi.fn(),
  ask: vi.fn(),
  relaunch: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/app", () => ({ getVersion }));
vi.mock("@tauri-apps/api/core", () => ({ invoke }));
vi.mock("@tauri-apps/plugin-updater", () => ({ check }));
vi.mock("@tauri-apps/plugin-dialog", () => ({ ask, message }));
vi.mock("@tauri-apps/plugin-process", () => ({ relaunch }));
vi.mock("./sounds", () => ({ announceUpdateAvailable: vi.fn() }));

import { runUpdateFlow } from "./updater";

describe("updater", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("keeps automatic checks quiet when updater endpoints are missing", async () => {
    getVersion.mockResolvedValue("0.1.23");
    check.mockRejectedValue(new Error("Updater does not have any endpoints set"));

    await expect(runUpdateFlow(false)).resolves.toEqual({
      phase: "idle",
      currentVersion: "0.1.23",
    });
    expect(message).not.toHaveBeenCalled();
  });

  it("points manual checks without updater endpoints to the PKmod sync flow", async () => {
    getVersion.mockResolvedValue("0.1.23");
    check.mockRejectedValue(new Error("Updater does not have any endpoints set"));
    invoke.mockResolvedValue(
      "tag=v0.1.24 behind=2\n---commits---\nabc1234 Fix thing\ndef5678 Add other thing",
    );
    ask.mockResolvedValue(true);

    await expect(runUpdateFlow(true)).resolves.toEqual({
      phase: "idle",
      currentVersion: "0.1.23",
    });
    expect(ask).toHaveBeenCalledWith(
      expect.stringContaining("• abc1234 Fix thing"),
      expect.objectContaining({
        okLabel: "Mettre à jour",
        cancelLabel: "Plus tard",
      }),
    );
    expect(invoke).toHaveBeenCalledWith("sync_pk_upstream");
  });

  it("lets the user postpone the PKmod update", async () => {
    getVersion.mockResolvedValue("0.1.23");
    check.mockRejectedValue(new Error("Updater does not have any endpoints set"));
    invoke.mockResolvedValue("tag=v0.1.24 behind=1\n---commits---\nabc1234 Fix thing");
    ask.mockResolvedValue(false);

    await expect(runUpdateFlow(true)).resolves.toEqual({
      phase: "idle",
      currentVersion: "0.1.23",
    });
    expect(invoke).not.toHaveBeenCalledWith("sync_pk_upstream");
  });

  it("reports both versions current when nothing new is available", async () => {
    getVersion.mockResolvedValue("0.1.24");
    check.mockRejectedValue(new Error("Updater does not have any endpoints set"));
    invoke.mockResolvedValue("tag=v0.1.24 behind=0 pkbehind=0 pkahead=0");

    await expect(runUpdateFlow(true)).resolves.toEqual({
      phase: "idle",
      currentVersion: "0.1.24",
    });
    expect(message).toHaveBeenCalledWith(
      expect.stringContaining("MonoCode officiel : 0.1.24 — à jour"),
      { title: "Mise à jour PKmod" },
    );
    expect(message).toHaveBeenCalledWith(
      expect.stringContaining("MonoCodePK : "),
      { title: "Mise à jour PKmod" },
    );
    expect(invoke).not.toHaveBeenCalledWith("sync_pk_upstream");
  });

  it("offers a PK-only update when the fork branch moved on GitHub", async () => {
    getVersion.mockResolvedValue("0.1.24");
    check.mockRejectedValue(new Error("Updater does not have any endpoints set"));
    invoke.mockResolvedValue(
      "tag=v0.1.24 behind=0 pkbehind=2 pkahead=1\n---commits---\n\n---pk-commits---\npk1234 ADD: autre machine\npk5678 FIX: distant",
    );
    ask.mockResolvedValue(true);

    await expect(runUpdateFlow(true)).resolves.toEqual({
      phase: "idle",
      currentVersion: "0.1.24",
    });
    expect(ask).toHaveBeenCalledWith(
      expect.stringContaining("2 commits disponibles sur GitHub"),
      expect.objectContaining({ okLabel: "Mettre à jour" }),
    );
    expect(ask).toHaveBeenCalledWith(
      expect.stringContaining("• pk1234 ADD: autre machine"),
      expect.anything(),
    );
    expect(invoke).toHaveBeenCalledWith("sync_pk_upstream");
  });

  it("still reports real updater failures", async () => {
    getVersion.mockResolvedValue("0.1.23");
    check.mockRejectedValue(new Error("network failed"));

    await expect(runUpdateFlow(true)).resolves.toMatchObject({
      phase: "error",
      error: "network failed",
    });
    expect(message).toHaveBeenCalledOnce();
  });
});
