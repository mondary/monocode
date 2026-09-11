import { ALT, MOD } from "./platform";

const SECTION_KEY = "monocode.settingsSection";

export type SettingsSectionId =
  | "general"
  | "appearance"
  | "keybindings"
  | "providers"
  | "inbox"
  | "skills"
  | "archive";

export const SETTINGS_SECTIONS: {
  id: SettingsSectionId;
  label: string;
  description: string;
}[] = [
  {
    id: "general",
    label: "General",
    description: "App-wide behavior and the build you are running.",
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme, translucency, and the tint applied to the chrome.",
  },
  {
    id: "keybindings",
    label: "Keybindings",
    description:
      "Every shortcut the workspace handles, from the app menu and the key handler.",
  },
  {
    id: "providers",
    label: "Providers",
    description:
      "Agent CLIs MonoCode can drive, and the model new sessions start with.",
  },
  {
    id: "inbox",
    label: "Inbox",
    description: "Connect and manage the services that appear in your Inbox.",
  },
  {
    id: "skills",
    label: "Skills",
    description:
      "Discover skills and configure one-click project initialization links.",
  },
  {
    id: "archive",
    label: "Archive",
    description: "Projects and conversations you have archived.",
  },
];

export const SETTINGS_SECTION_DEFAULT: SettingsSectionId = "general";

export function isSettingsSectionId(
  value: unknown,
): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

export function settingsSectionLabel(id: SettingsSectionId): string {
  return (
    SETTINGS_SECTIONS.find((section) => section.id === id)?.label ?? "General"
  );
}

export function settingsSectionDescription(id: SettingsSectionId): string {
  return (
    SETTINGS_SECTIONS.find((section) => section.id === id)?.description ?? ""
  );
}

export function loadSettingsSection(): SettingsSectionId {
  try {
    const raw = localStorage.getItem(SECTION_KEY);
    return isSettingsSectionId(raw) ? raw : SETTINGS_SECTION_DEFAULT;
  } catch {
    return SETTINGS_SECTION_DEFAULT;
  }
}

export function saveSettingsSection(id: SettingsSectionId) {
  try {
    localStorage.setItem(SECTION_KEY, id);
  } catch {
    // private mode / quota
  }
}

const COMPOSER_RUNNER_KEY = "monocode.composerRunner";

/** Where the "agent finished" check replaces the project row's visuals. */
export type DoneCheckSide = "left" | "right";

export const DONE_CHECK_SIDE_DEFAULT: DoneCheckSide = "left";

/** Fired on `window` when the done-check side setting changes. */
export const DONE_CHECK_SIDE_CHANGE_EVENT = "monocode:done-check-side-change";

export function loadDoneCheckSide(): DoneCheckSide {
  try {
    const raw = localStorage.getItem("monocode.doneCheckSide");
    return raw === "right" ? raw : DONE_CHECK_SIDE_DEFAULT;
  } catch {
    return DONE_CHECK_SIDE_DEFAULT;
  }
}

export function saveDoneCheckSide(value: DoneCheckSide): void {
  try {
    localStorage.setItem("monocode.doneCheckSide", value);
  } catch {
    // private mode / quota
  }
  window.dispatchEvent(new Event(DONE_CHECK_SIDE_CHANGE_EVENT));
}

/** How the project rail orders the (unpinned) project list. */
export type ProjectSortMode = "manual" | "recent" | "alphabetical" | "unpushed";

export const PROJECT_SORT_DEFAULT: ProjectSortMode = "manual";

/** Fired on `window` when the project sort mode changes. */
export const PROJECT_SORT_CHANGE_EVENT = "monocode:project-sort-change";

export function loadProjectSort(): ProjectSortMode {
  try {
    const raw = localStorage.getItem("monocode.projectSort");
    return raw === "recent" || raw === "alphabetical" || raw === "unpushed"
      ? raw
      : PROJECT_SORT_DEFAULT;
  } catch {
    return PROJECT_SORT_DEFAULT;
  }
}

export function saveProjectSort(value: ProjectSortMode): void {
  try {
    localStorage.setItem("monocode.projectSort", value);
  } catch {
    // private mode / quota
  }
  window.dispatchEvent(new Event(PROJECT_SORT_CHANGE_EVENT));
}

const FOLLOW_UP_BEHAVIOR_KEY = "monocode.followUpBehavior";

export type FollowUpBehavior = "steer" | "queue" | "choice";

export const FOLLOW_UP_BEHAVIOR_DEFAULT: FollowUpBehavior = "steer";

/** Fired on `window` when the follow-up behavior setting changes. */
export const FOLLOW_UP_BEHAVIOR_CHANGE_EVENT =
  "monocode:follow-up-behavior-change";

export function loadFollowUpBehavior(): FollowUpBehavior {
  try {
    const raw = localStorage.getItem(FOLLOW_UP_BEHAVIOR_KEY);
    return raw === "queue" || raw === "steer" || raw === "choice"
      ? raw
      : FOLLOW_UP_BEHAVIOR_DEFAULT;
  } catch {
    return FOLLOW_UP_BEHAVIOR_DEFAULT;
  }
}

export function saveFollowUpBehavior(value: FollowUpBehavior) {
  try {
    localStorage.setItem(FOLLOW_UP_BEHAVIOR_KEY, value);
    window.dispatchEvent(new Event(FOLLOW_UP_BEHAVIOR_CHANGE_EVENT));
  } catch {
    // private mode / quota
  }
}

export const COMPOSER_RUNNER_DEFAULT = true;

/** Fired on `window` when the composer mascot setting flips. */
export const COMPOSER_RUNNER_CHANGE_EVENT = "monocode:composer-runner-change";

export function loadComposerRunner(): boolean {
  try {
    const raw = localStorage.getItem(COMPOSER_RUNNER_KEY);
    if (raw == null) return COMPOSER_RUNNER_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return COMPOSER_RUNNER_DEFAULT;
  }
}

export function saveComposerRunner(value: boolean) {
  try {
    localStorage.setItem(COMPOSER_RUNNER_KEY, value ? "1" : "0");
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<boolean>(COMPOSER_RUNNER_CHANGE_EVENT, { detail: value }),
  );
}

const NOTES_ENABLED_KEY = "monocode.notesEnabled";

export const NOTES_ENABLED_DEFAULT = true;

/** Fired on `window` when the Notes UI setting flips. */
export const NOTES_ENABLED_CHANGE_EVENT = "monocode:notes-enabled-change";

export function loadNotesEnabled(): boolean {
  try {
    const raw = localStorage.getItem(NOTES_ENABLED_KEY);
    if (raw == null) return NOTES_ENABLED_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return NOTES_ENABLED_DEFAULT;
  }
}

export function saveNotesEnabled(value: boolean) {
  try {
    localStorage.setItem(NOTES_ENABLED_KEY, value ? "1" : "0");
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<boolean>(NOTES_ENABLED_CHANGE_EVENT, { detail: value }),
  );
}

export function subscribeNotesEnabled(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(NOTES_ENABLED_CHANGE_EVENT, onStoreChange);
  return () =>
    window.removeEventListener(NOTES_ENABLED_CHANGE_EVENT, onStoreChange);
}

const LIVE_AGENTS_ENABLED_KEY = "monocode.liveAgentsEnabled";

export const LIVE_AGENTS_ENABLED_DEFAULT = true;

/** Fired on `window` when the working-agents rail card setting flips. */
export const LIVE_AGENTS_ENABLED_CHANGE_EVENT =
  "monocode:live-agents-enabled-change";

export function loadLiveAgentsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(LIVE_AGENTS_ENABLED_KEY);
    if (raw == null) return LIVE_AGENTS_ENABLED_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return LIVE_AGENTS_ENABLED_DEFAULT;
  }
}

export function saveLiveAgentsEnabled(value: boolean) {
  try {
    localStorage.setItem(LIVE_AGENTS_ENABLED_KEY, value ? "1" : "0");
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<boolean>(LIVE_AGENTS_ENABLED_CHANGE_EVENT, {
      detail: value,
    }),
  );
}

export function subscribeLiveAgentsEnabled(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LIVE_AGENTS_ENABLED_CHANGE_EVENT, onStoreChange);
  return () =>
    window.removeEventListener(LIVE_AGENTS_ENABLED_CHANGE_EVENT, onStoreChange);
}

const GRID_ARCADE_ENABLED_KEY = "monocode.gridArcadeEnabled";

export const GRID_ARCADE_ENABLED_DEFAULT = true;

/** Fired on `window` when the empty-session games setting flips. */
export const GRID_ARCADE_ENABLED_CHANGE_EVENT =
  "monocode:grid-arcade-enabled-change";

export function loadGridArcadeEnabled(): boolean {
  try {
    const raw = localStorage.getItem(GRID_ARCADE_ENABLED_KEY);
    if (raw == null) return GRID_ARCADE_ENABLED_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return GRID_ARCADE_ENABLED_DEFAULT;
  }
}

export function saveGridArcadeEnabled(value: boolean) {
  try {
    localStorage.setItem(GRID_ARCADE_ENABLED_KEY, value ? "1" : "0");
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<boolean>(GRID_ARCADE_ENABLED_CHANGE_EVENT, {
      detail: value,
    }),
  );
}

export function subscribeGridArcadeEnabled(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(GRID_ARCADE_ENABLED_CHANGE_EVENT, onStoreChange);
  return () =>
    window.removeEventListener(GRID_ARCADE_ENABLED_CHANGE_EVENT, onStoreChange);
}

const DIFF_VIEWER_KEY = "monocode.diffViewer";

export type DiffViewer = "editor" | "unified";

export const DIFF_VIEWER_DEFAULT: DiffViewer = "editor";

/** Fired on `window` when the working-tree diff layout flips. */
export const DIFF_VIEWER_CHANGE_EVENT = "monocode:diff-viewer-change";

function isDiffViewer(value: unknown): value is DiffViewer {
  return value === "editor" || value === "unified";
}

export function loadDiffViewer(): DiffViewer {
  try {
    const raw = localStorage.getItem(DIFF_VIEWER_KEY);
    return isDiffViewer(raw) ? raw : DIFF_VIEWER_DEFAULT;
  } catch {
    return DIFF_VIEWER_DEFAULT;
  }
}

export function saveDiffViewer(value: DiffViewer) {
  const next = isDiffViewer(value) ? value : DIFF_VIEWER_DEFAULT;
  try {
    localStorage.setItem(DIFF_VIEWER_KEY, next);
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<DiffViewer>(DIFF_VIEWER_CHANGE_EVENT, { detail: next }),
  );
}

export function subscribeDiffViewer(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(DIFF_VIEWER_CHANGE_EVENT, onStoreChange);
  return () =>
    window.removeEventListener(DIFF_VIEWER_CHANGE_EVENT, onStoreChange);
}

const CLAUDE_HOOKS_KEY = "monocode.claudeHooks";

export const CLAUDE_HOOKS_DEFAULT = true;

export function loadClaudeHooks(): boolean {
  try {
    const raw = localStorage.getItem(CLAUDE_HOOKS_KEY);
    if (raw == null) return CLAUDE_HOOKS_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return CLAUDE_HOOKS_DEFAULT;
  }
}

export function saveClaudeHooks(value: boolean) {
  try {
    localStorage.setItem(CLAUDE_HOOKS_KEY, value ? "1" : "0");
  } catch {
    // private mode / quota
  }
}

import {
  bindingFor,
  formatAccelerator,
  KEYBINDING_DEFAULTS,
} from "./keybindings";

export type KeybindingRow = {
  command: string;
  keys: string;
  when: string;
  /** Present when the binding is user-editable (PKmod). */
  id?: string;
};

/** Fixed bindings the editor does not manage (kept for documentation). */
const FIXED_BINDING_ROWS: KeybindingRow[] = [
  { command: "Tab: Activate 1–8", keys: `${MOD}1 … ${MOD}8`, when: "Always" },
  { command: "Tab: Activate Last", keys: `${MOD}9`, when: "Always" },
  { command: "Editor: Replace", keys: `${MOD}${ALT}F`, when: "editorFocus" },
];

/**
 * Rows derived from the shared binding catalog (`keybindings.defaults.json`)
 * plus the user's overrides; see `src/lib/keybindings.ts`.
 */
export function buildKeybindingRows(): KeybindingRow[] {
  const rows = Object.entries(KEYBINDING_DEFAULTS).map(([id, def]) => ({
    command: def.label,
    keys: formatAccelerator(bindingFor(id) ?? def.binding),
    when: def.when,
    id,
  }));
  return [...rows, ...FIXED_BINDING_ROWS];
}

/** Static snapshot (defaults only); the settings page uses the live rows. */
export const KEYBINDINGS: KeybindingRow[] = buildKeybindingRows();

export function filterKeybindings(
  rows: KeybindingRow[],
  query: string,
): KeybindingRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter(
    (row) =>
      row.command.toLowerCase().includes(needle) ||
      row.keys.toLowerCase().includes(needle) ||
      row.when.toLowerCase().includes(needle),
  );
}
