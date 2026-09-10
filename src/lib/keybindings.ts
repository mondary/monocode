/**
 * PK keybinding overrides: one JSON file shared by the native menu (Rust) and
 * the webview key handler. Defaults come from `keybindings.defaults.json` at
 * the repo root; user overrides live in
 * `~/Library/Application Support/com.monocode.desktop/keybindings.json`.
 *
 * Canonical binding format (Tauri accelerators): `CmdOrCtrl+Shift+K`.
 * `CmdOrCtrl` matches Meta OR Ctrl on every platform (the webview handler has
 * always treated both as "mod"); `Ctrl` alone matches Ctrl without Meta
 * (e.g. Ctrl+Tab tab cycling).
 */
import defaultsJson from "../../keybindings.defaults.json";
import { invoke } from "@tauri-apps/api/core";
import { IS_MAC } from "./platform";

export type BindingDef = {
  label: string;
  group: string;
  when: string;
  binding: string;
};

export const KEYBINDING_DEFAULTS = defaultsJson as Record<string, BindingDef>;

export const KEYBINDINGS_CHANGE_EVENT = "monocode:keybindingschange";

export type KeyEventLike = Pick<
  KeyboardEvent,
  "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey"
>;

let overrides: Record<string, string> = {};
let loaded = false;

export function loadKeybindingOverrides(): void {
  loaded = true;
  invoke<Record<string, string>>("get_keybindings")
    .then((map) => {
      overrides = map ?? {};
      window.dispatchEvent(new Event(KEYBINDINGS_CHANGE_EVENT));
    })
    .catch(() => {
      // no Tauri (tests / plain browser): defaults only
    });
}

export function bindingFor(id: string): string | null {
  return overrides[id] ?? KEYBINDING_DEFAULTS[id]?.binding ?? null;
}

export function isOverridden(id: string): boolean {
  return Boolean(overrides[id]);
}

export function setKeybindingOverride(
  id: string,
  binding: string | null,
): void {
  if (binding == null) delete overrides[id];
  else overrides[id] = binding;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(KEYBINDINGS_CHANGE_EVENT));
  }
  const map = { ...overrides };
  void invoke("save_keybindings", { map }).catch(() => {
    // not fatal: the live handler already uses the in-memory override
  });
}

// -- parsing ---------------------------------------------------------------

type ParsedBinding = {
  mod: boolean;
  ctrlOnly: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
};

const CODE_TOKENS: Record<string, string> = {
  Backquote: "`",
  BracketLeft: "[",
  BracketRight: "]",
  Equal: "=",
  Minus: "-",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Semicolon: ";",
  Quote: "'",
  Backslash: "\\",
  Tab: "Tab",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
  ArrowDown: "Down",
};

/** Stable key token: prefers the physical code so layouts can't shift it. */
function keyToken(e: KeyEventLike): string | null {
  if (CODE_TOKENS[e.code]) return CODE_TOKENS[e.code];
  if (/^Digit\d$/.test(e.code)) return e.code.slice(5);
  if (/^Numpad\d$/.test(e.code)) return e.code.slice(6);
  if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3).toLowerCase();
  const key = e.key;
  if (key.length === 1) return key.toLowerCase();
  if (key.startsWith("Arrow")) return key.slice(5);
  if (key === " ") return "Space";
  return key || null;
}

export function parseBinding(binding: string): ParsedBinding | null {
  const parts = binding.split("+");
  if (parts.length < 2) return null;
  let key = parts[parts.length - 1];
  if (key.length === 1) key = key.toLowerCase();
  let mod = false;
  let ctrlOnly = false;
  let shift = false;
  let alt = false;
  for (const part of parts.slice(0, -1)) {
    if (part === "CmdOrCtrl" || part === "Cmd" || part === "Super") mod = true;
    else if (part === "Ctrl") ctrlOnly = true;
    else if (part === "Shift") shift = true;
    else if (part === "Alt" || part === "Option") alt = true;
    else return null;
  }
  return { mod, ctrlOnly, shift, alt, key };
}

export function matchesAction(e: KeyEventLike, id: string): boolean {
  const binding = bindingFor(id);
  if (!binding) return false;
  const parsed = parseBinding(binding);
  if (!parsed) return false;
  const token = keyToken(e);
  if (!token || token !== parsed.key) return false;
  const mod = e.metaKey || e.ctrlKey;
  const ctrlOnly = e.ctrlKey && !e.metaKey;
  if (parsed.ctrlOnly) {
    if (!ctrlOnly) return false;
  } else if (parsed.mod !== mod) {
    return false;
  }
  return parsed.shift === e.shiftKey && parsed.alt === e.altKey;
}

/**
 * Zoom keeps its legacy tolerant matcher for defaults (=, +, NumpadAdd all
 * zoom in); overridden zoom bindings are matched strictly so the override
 * wins before the legacy path runs.
 */
export function overrideZoomCommand(
  e: KeyEventLike,
): "zoom-in" | "zoom-out" | "zoom-reset" | null {
  for (const [id, cmd] of [
    ["zoom_in", "zoom-in"],
    ["zoom_out", "zoom-out"],
    ["zoom_reset", "zoom-reset"],
  ] as const) {
    if (overrides[id] && matchesAction(e, id)) return cmd;
  }
  return null;
}

// -- capture & display -----------------------------------------------------

const MODIFIER_KEYS = new Set([
  "Shift",
  "Control",
  "Meta",
  "Alt",
  "CapsLock",
  "Fn",
  "FnLock",
  "Dead",
]);

/** Canonical binding string for a freshly pressed combo, or null while the
 *  user is still holding bare modifiers (or pressed something unusable). */
export function captureAccelerator(e: KeyEventLike): string | null {
  if (MODIFIER_KEYS.has(e.key) || e.key === "") return null;
  const token = keyToken(e);
  if (!token) return null;
  const parts: string[] = [];
  const ctrlOnly = e.ctrlKey && !e.metaKey && token === "Tab";
  if (ctrlOnly) parts.push("Ctrl");
  else if (e.metaKey || e.ctrlKey) parts.push("CmdOrCtrl");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  if (parts.length === 0) return null;
  parts.push(token.length === 1 ? token.toUpperCase() : token);
  return parts.join("+");
}

export function formatAccelerator(binding: string): string {
  const parsed = parseBinding(binding);
  if (!parsed) return binding;
  const head = IS_MAC
    ? parsed.ctrlOnly && !parsed.mod
      ? "⌃"
      : "⌘"
    : "Ctrl+";
  const alt = parsed.alt ? (IS_MAC ? "⌥" : "Alt+") : "";
  const shift = parsed.shift ? (IS_MAC ? "⇧" : "Shift+") : "";
  return `${head}${alt}${shift}${prettyKey(parsed.key)}`;
}

function prettyKey(key: string): string {
  if (key === "Space") return "Space";
  if (key.length === 1) return key.toUpperCase();
  if (["Left", "Right", "Up", "Down"].includes(key)) {
    return { Left: "←", Right: "→", Up: "↑", Down: "↓" }[key] ?? key;
  }
  return key;
}

export function subscribeKeybindings(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(KEYBINDINGS_CHANGE_EVENT, onStoreChange);
  return () =>
    window.removeEventListener(KEYBINDINGS_CHANGE_EVENT, onStoreChange);
}

/** Label of another action already using `binding`, if any. */
export function findBindingOwner(
  excludeId: string,
  binding: string,
): string | null {
  for (const [id, def] of Object.entries(KEYBINDING_DEFAULTS)) {
    if (id === excludeId) continue;
    if (bindingFor(id) === binding) return def.label;
  }
  return null;
}

/** true once overrides have been fetched (or fetch failed). */
export function keybindingsReady(): boolean {
  return loaded;
}
