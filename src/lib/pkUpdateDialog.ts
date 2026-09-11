import { ask, message } from "@tauri-apps/plugin-dialog";

/**
 * One update axis of the PK flow: the official upstream, or the PK branch.
 * `availableVersion` null with `behind === 0` means the axis is up to date.
 */
export type PkUpdateAxis = {
  label: string;
  currentVersion: string;
  availableVersion: string | null;
  behind: number;
  /** Local commits not pushed yet (PK axis only). */
  ahead: number;
  commits: string[];
};

export type PkUpdateDialogRequest = {
  /** True when every axis is up to date — the dialog becomes a status card. */
  upToDate: boolean;
  axes: PkUpdateAxis[];
};

export type PkUpdateDialogHandler = (
  request: PkUpdateDialogRequest,
) => Promise<boolean>;

let handler: PkUpdateDialogHandler | null = null;

/** The in-app dialog registers on mount; tests and headless runs stay native. */
export function registerPkUpdateDialog(next: PkUpdateDialogHandler | null): void {
  handler = next;
}

export function isPkUpdateDialogRegistered(): boolean {
  return handler != null;
}

/** Resolve through the in-app dialog when mounted, else the native one. */
export async function requestPkUpdateDecision(
  request: PkUpdateDialogRequest,
): Promise<boolean> {
  if (handler) return handler(request);
  return nativePkUpdateDialog(request);
}

async function nativePkUpdateDialog(
  request: PkUpdateDialogRequest,
): Promise<boolean> {
  const lines = request.axes.map((axis) => axisLine(axis));
  if (request.upToDate) {
    await message(lines.join("\n"), { title: "Mise à jour PKmod" });
    return false;
  }
  const lists = request.axes.map((axis) => axisCommitList(axis)).join("");
  const proceed = await ask(
    `${lines.join("\n")}${lists}\n\nPKmod va récupérer les commits officiels et PK, reconstruire l'application et la relancer.`,
    {
      title: "Mise à jour PKmod",
      kind: "info",
      okLabel: "Mettre à jour",
      cancelLabel: "Plus tard",
    },
  );
  return proceed;
}

function axisLine(axis: PkUpdateAxis): string {
  const unpushed =
    axis.ahead > 0
      ? ` — ${axis.ahead} commit${axis.ahead === 1 ? "" : "s"} local${axis.ahead === 1 ? "" : "aux"} non poussé${axis.ahead === 1 ? "" : "s"}`
      : "";
  if (axis.behind === 0) {
    return `${axis.label} : ${axis.currentVersion} — à jour${unpushed}`;
  }
  const target = axis.availableVersion
    ? `${axis.currentVersion} → ${axis.availableVersion}`
    : axis.currentVersion;
  return `${axis.label} : ${target} (${axis.behind} commit${axis.behind === 1 ? "" : "s"} disponible${axis.behind === 1 ? "" : "s"}${axis.label.includes("PK") ? " sur GitHub" : ""})${unpushed}`;
}

function axisCommitList(axis: PkUpdateAxis): string {
  if (axis.commits.length === 0) return "";
  const extra =
    axis.behind > axis.commits.length
      ? `\n• … et ${axis.behind - axis.commits.length} autres`
      : "";
  return `\n\nCommits ${axis.label} :\n${axis.commits
    .map((commit) => `• ${commit}`)
    .join("\n")}${extra}`;
}
