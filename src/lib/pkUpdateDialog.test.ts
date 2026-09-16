import { afterEach, describe, expect, it, vi } from "vitest";
import {
  registerPkUpdateDialog,
  requestPkUpdateDecision,
  type PkUpdateDialogRequest,
} from "./pkUpdateDialog";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  ask: vi.fn().mockResolvedValue(false),
  message: vi.fn().mockResolvedValue(undefined),
}));

import { ask, message } from "@tauri-apps/plugin-dialog";

function upToDateRequest(): PkUpdateDialogRequest {
  return {
    upToDate: true,
    axes: [
      {
        label: "MonoCode officiel",
        currentVersion: "0.1.42",
        availableVersion: null,
        behind: 0,
        ahead: 0,
        commits: [],
      },
    ],
  };
}

describe("pk update dialog bridge", () => {
  afterEach(() => {
    registerPkUpdateDialog(null);
    vi.clearAllMocks();
  });

  it("falls back to the native prompt when no in-app dialog is mounted", async () => {
    await requestPkUpdateDecision(upToDateRequest());

    expect(message).toHaveBeenCalledWith(
      "MonoCode officiel : 0.1.42 — à jour",
      { title: "Mise à jour PKmod" },
    );
  });

  it("routes through a registered in-app handler when mounted", async () => {
    const handler = vi.fn().mockResolvedValue(true);
    registerPkUpdateDialog(handler);

    const decision = await requestPkUpdateDecision(upToDateRequest());

    expect(decision).toBe(true);
    expect(handler).toHaveBeenCalledWith(upToDateRequest());
    expect(message).not.toHaveBeenCalled();
  });

  it("presents the native update prompt with both axes and commit lists", async () => {
    const decision = await requestPkUpdateDecision({
      upToDate: false,
      axes: [
        {
          label: "MonoCode officiel",
          currentVersion: "0.1.42",
          availableVersion: "v0.2.0",
          behind: 2,
          ahead: 0,
          commits: ["abc123 Tighten line heights"],
        },
        {
          label: "MonoCodePK",
          currentVersion: "2026.09.12",
          availableVersion: null,
          behind: 1,
          ahead: 1,
          commits: ["def456 ADD: glow parametrable"],
        },
      ],
    });

    expect(decision).toBe(false);
    const [text, options] = (ask as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(text).toContain("0.1.42 → v0.2.0");
    expect(text).toContain("• abc123 Tighten line heights");
    expect(text).toContain("1 commit local non poussé");
    expect(options).toMatchObject({
      okLabel: "Mettre à jour",
      cancelLabel: "Plus tard",
    });
  });
});
