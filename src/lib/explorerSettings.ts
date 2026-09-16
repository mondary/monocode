const SHOW_CHANGES_KEY = "monocode.explorerShowChanges";
const HIGHLIGHT_ACTIONS_KEY = "monocode.explorerHighlightActions";

/** Fired on `window` when either Explorer header setting flips. */
export const EXPLORER_SETTINGS_CHANGE_EVENT =
  "monocode:explorer-settings-change";

export const EXPLORER_SHOW_CHANGES_DEFAULT = true;
export const EXPLORER_HIGHLIGHT_ACTIONS_DEFAULT = false;

/** Show the Changes (diff) button in the Explorer header. */
export function loadExplorerShowChanges(): boolean {
  try {
    const raw = localStorage.getItem(SHOW_CHANGES_KEY);
    if (raw == null) return EXPLORER_SHOW_CHANGES_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return EXPLORER_SHOW_CHANGES_DEFAULT;
  }
}

export function saveExplorerShowChanges(value: boolean): void {
  try {
    localStorage.setItem(SHOW_CHANGES_KEY, value ? "1" : "0");
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EXPLORER_SETTINGS_CHANGE_EVENT));
}

/** Tint the custom Explorer actions (reveal, initialize) with the PK accent. */
export function loadExplorerHighlightActions(): boolean {
  try {
    const raw = localStorage.getItem(HIGHLIGHT_ACTIONS_KEY);
    if (raw == null) return EXPLORER_HIGHLIGHT_ACTIONS_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return EXPLORER_HIGHLIGHT_ACTIONS_DEFAULT;
  }
}

export function saveExplorerHighlightActions(value: boolean): void {
  try {
    localStorage.setItem(HIGHLIGHT_ACTIONS_KEY, value ? "1" : "0");
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EXPLORER_SETTINGS_CHANGE_EVENT));
}
