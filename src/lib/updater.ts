import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type DownloadEvent, type Update } from "@tauri-apps/plugin-updater";
import { PK_VERSION } from "./pkVersion";
import { announceUpdateAvailable } from "./sounds";
import { rememberInstalledUpdate } from "./updateNotice";

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
        const unpushed =
          info && info.pkAhead > 0
            ? ` — ${info.pkAhead} commit${info.pkAhead === 1 ? "" : "s"} local${info.pkAhead === 1 ? "" : "aux"} non poussé${info.pkAhead === 1 ? "" : "s"}`
            : "";
        const pkLine = info
          ? info.pkBehind > 0
            ? `MonoCodePK : ${PK_VERSION} → ${info.pkBehind} commit${info.pkBehind === 1 ? "" : "s"} disponible${info.pkBehind === 1 ? "" : "s"} sur GitHub${unpushed}`
            : `MonoCodePK : ${PK_VERSION} — à jour${unpushed}`
          : `MonoCodePK : ${PK_VERSION}`;
        if (info && info.behind === 0 && info.pkBehind === 0) {
          await message(
            `MonoCode officiel : ${currentVersion} — à jour\n${pkLine}`,
            { title: "Mise à jour PKmod" },
          );
          return idle;
        }
        const officialLine = info
          ? info.behind > 0
            ? `MonoCode officiel : ${currentVersion} → ${info.tag} (${info.behind} commit${info.behind === 1 ? "" : "s"} en retard)`
            : `MonoCode officiel : ${currentVersion} — à jour`
          : "";
        const upstreamList =
          info && info.commits.length > 0
            ? `\n\nCommits officiels :\n${info.commits
                .map((commit) => `• ${commit}`)
                .join("\n")}${
                info.behind > info.commits.length
                  ? `\n• … et ${info.behind - info.commits.length} autres`
                  : ""
              }`
            : "";
        const pkList =
          info && info.pkCommits.length > 0
            ? `\n\nCommits PK :\n${info.pkCommits
                .map((commit) => `• ${commit}`)
                .join("\n")}${
                info.pkBehind > info.pkCommits.length
                  ? `\n• … et ${info.pkBehind - info.pkCommits.length} autres`
                  : ""
              }`
            : "";
        const proceed = await ask(
          `${officialLine}\n${pkLine}${upstreamList}${pkList}\n\nPKmod va récupérer les commits officiels et PK, reconstruire l'application et la relancer.`,
          {
            title: "Mise à jour PKmod",
            kind: "info",
            okLabel: "Mettre à jour",
            cancelLabel: "Plus tard",
          },
        );
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
