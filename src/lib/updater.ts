import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type DownloadEvent, type Update } from "@tauri-apps/plugin-updater";
import { PK_VERSION } from "./pkVersion";
import { announceUpdateAvailable } from "./sounds";
import { rememberInstalledUpdate } from "./updateNotice";
import { requestPkUpdateDecision } from "./pkUpdateDialog";

export type UpdaterPhase =
  | "idle"
  | "checking"
  | "current"
  | "available"
  | "downloading"
  | "error";

export type UpdaterSnapshot = {
  phase: UpdaterPhase;
  currentVersion: string;
  availableVersion?: string;
  progress?: number;
  error?: string;
};

let pendingUpdate: Update | null = null;

function isUpdaterNotConfiguredError(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error);
  return /updater does not have any endpoints set/i.test(text);
}

export async function readAppVersion(): Promise<string> {
  try {
    return await getVersion();
  } catch {
    return "0.0.0";
  }
}
async function pkUpstreamInfo(): Promise<{
  tag: string;
  behind: number;
  commits: string[];
  pkBehind: number;
  pkAhead: number;
  pkCommits: string[];
} | null> {
  try {
    const raw = await invoke<string>("pk_upstream_info");
    const [header = "", rest = ""] = raw.split("---commits---");
    const [upstreamLog = "", pkLog = ""] = rest.split("---pk-commits---");
    const tag = /tag=(\S*)/.exec(header)?.[1] ?? "";
    const behind = Number(/behind=(\d+)/.exec(header)?.[1] ?? "0");
    const pkBehind = Number(/pkbehind=(\d+)/.exec(header)?.[1] ?? "0");
    const pkAhead = Number(/pkahead=(\d+)/.exec(header)?.[1] ?? "0");
    if (!tag || !Number.isFinite(behind)) return null;
    return {
      tag,
      behind,
      commits: upstreamLog.split("\n").map((l) => l.trim()).filter(Boolean),
      pkBehind: Number.isFinite(pkBehind) ? pkBehind : 0,
      pkAhead: Number.isFinite(pkAhead) ? pkAhead : 0,
      pkCommits: pkLog.split("\n").map((l) => l.trim()).filter(Boolean),
    };
  } catch {
    return null;
  }
}

export async function probeForUpdate(): Promise<Update | null> {
  const update = await check();
  pendingUpdate = update;
  if (update) announceUpdateAvailable(update.version);
  return update;
}

export async function runUpdateFlow(
  manual: boolean,
  onProgress?: (snapshot: UpdaterSnapshot) => void,
): Promise<UpdaterSnapshot> {
  const currentVersion = await readAppVersion();
  const base: UpdaterSnapshot = { phase: "checking", currentVersion };
  onProgress?.(base);

  try {
    const update = await check();
    const info = manual ? await pkUpstreamInfo() : null;
    if (manual && info) {
      const proceed = await requestPkUpdateDecision({
        upToDate: info.behind === 0 && info.pkBehind === 0 && !update,
        axes: [
          {
            label: "MonoCode officiel",
            currentVersion,
            availableVersion: update?.version || info.tag || null,
            behind: info.behind,
            ahead: 0,
            commits: info.commits,
          },
          {
            label: "MonoCodePK",
            currentVersion: PK_VERSION,
            availableVersion: null,
            behind: info.pkBehind,
            ahead: info.pkAhead,
            commits: info.pkCommits,
          },
        ],
      });
      if (!proceed) return { phase: "idle", currentVersion };
      await invoke("sync_pk_upstream");
      return { phase: "idle", currentVersion };
    }
    if (!update) {
      pendingUpdate = null;
      const current: UpdaterSnapshot = { phase: "current", currentVersion };
      onProgress?.(current);
      if (manual) {
        await message("You're on the latest version.", { title: "MonoCode" });
      }
      return current;
    }

    pendingUpdate = update;
    announceUpdateAvailable(update.version);
    const available: UpdaterSnapshot = {
      phase: "available",
      currentVersion,
      availableVersion: update.version,
    };
    onProgress?.(available);

    if (!manual) return available;

    const notes = update.body?.trim();
    const detail = notes ? `\n\n${notes}` : "";
    const yes = await ask(
      `MonoCode ${update.version} is available (you have ${currentVersion}).${detail}\n\nInstall now?`,
      { title: "Update available", kind: "info" },
    );
    if (!yes) return available;

    return installPendingUpdate(onProgress);
  } catch (err) {
    if (isUpdaterNotConfiguredError(err)) {
      pendingUpdate = null;
      const idle: UpdaterSnapshot = { phase: "idle", currentVersion };
      onProgress?.(idle);
      if (manual) {
        const info = await pkUpstreamInfo();
        const upToDate = !info || (info.behind === 0 && info.pkBehind === 0);
        const proceed = await requestPkUpdateDecision({
          upToDate,
          axes: [
            {
              label: "MonoCode officiel",
              currentVersion,
              availableVersion: info?.tag || null,
              behind: info?.behind ?? 0,
              ahead: 0,
              commits: info?.commits ?? [],
            },
            {
              label: "MonoCodePK",
              currentVersion: PK_VERSION,
              availableVersion: null,
              behind: info?.pkBehind ?? 0,
              ahead: info?.pkAhead ?? 0,
              commits: info?.pkCommits ?? [],
            },
          ],
        });
        if (!proceed) return idle;
        await invoke("sync_pk_upstream");
      }
      return idle;
    }

    const error = err instanceof Error ? err.message : String(err);
    const failed: UpdaterSnapshot = { phase: "error", currentVersion, error };
    onProgress?.(failed);
    if (manual) {
      await message(`Couldn't check for updates.\n\n${error}`, {
        title: "MonoCode",
      });
    }
    return failed;
  }
}

export async function installPendingUpdate(
  onProgress?: (snapshot: UpdaterSnapshot) => void,
): Promise<UpdaterSnapshot> {
  const currentVersion = await readAppVersion();
  const update = pendingUpdate;
  if (!update) {
    const idle: UpdaterSnapshot = { phase: "idle", currentVersion };
    onProgress?.(idle);
    return idle;
  }

  let downloaded = 0;
  let contentLength = 0;

  const downloading: UpdaterSnapshot = {
    phase: "downloading",
    currentVersion,
    availableVersion: update.version,
    progress: 0,
  };
  onProgress?.(downloading);

  try {
    await update.downloadAndInstall((event: DownloadEvent) => {
      if (event.event === "Started") {
        contentLength = event.data.contentLength ?? 0;
        downloaded = 0;
      } else if (event.event === "Progress") {
        downloaded += event.data.chunkLength;
      }

      const progress =
        contentLength > 0
          ? Math.min(100, Math.round((downloaded / contentLength) * 100))
          : undefined;

      onProgress?.({
        phase: "downloading",
        currentVersion,
        availableVersion: update.version,
        progress,
      });
    });

    rememberInstalledUpdate(update.version);
    pendingUpdate = null;
    await relaunch();
    return {
      phase: "current",
      currentVersion: update.version,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const failed: UpdaterSnapshot = {
      phase: "error",
      currentVersion,
      availableVersion: update.version,
      error,
    };
    onProgress?.(failed);
    await message(`Couldn't install the update.\n\n${error}`, { title: "MonoCode" });
    return failed;
  }
}
