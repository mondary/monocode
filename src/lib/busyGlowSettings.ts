const KEY = "monocode.busyGlowColor";

/** Fired on `window` when the busy-title glow color flips. */
export const BUSY_GLOW_CHANGE_EVENT = "monocode:busy-glow-change";

/** "" follows the theme; every other entry is a literal CSS color. */
export const BUSY_GLOW_PRESETS: { label: string; value: string }[] = [
  { label: "Theme", value: "" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Emerald", value: "#34d399" },
  { label: "Sky", value: "#38bdf8" },
  { label: "Violet", value: "#a78bfa" },
  { label: "Pink", value: "#f472b6" },
  { label: "Red", value: "#f87171" },
];

export const BUSY_GLOW_DEFAULT = "";

export function isBusyGlowColor(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value === "") return true;
  return (
    /^#[0-9a-f]{3,8}$/i.test(value) ||
    /^(rgb|hsl)a?\(\s*[\d.,%\s\/]+\)$/.test(value)
  );
}

/** Highlight color for the shimmer on busy project titles. */
export function loadBusyGlowColor(): string {
  try {
    const raw = localStorage.getItem(KEY);
    return isBusyGlowColor(raw) ? raw : BUSY_GLOW_DEFAULT;
  } catch {
    return BUSY_GLOW_DEFAULT;
  }
}

export function saveBusyGlowColor(value: string): void {
  const next = isBusyGlowColor(value) ? value : BUSY_GLOW_DEFAULT;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BUSY_GLOW_CHANGE_EVENT));
}
