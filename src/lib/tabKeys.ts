/**
 * Workspace keybindings:
 *   New tab             cmd-t
 *   Close other tabs    cmd-opt-t
 *   Close tab           cmd-w
 *   Split pane right    cmd-d
 *   Split pane down     shift-cmd-d
 *   Next tab            shift-cmd-}
 *   Previous tab        shift-cmd-{
 *   Back in tab history cmd-[
 *   Forward in history  cmd-]
 *   Activate tab 1–8    cmd-1 … cmd-8
 *   Last tab            cmd-9
 *   Cycle next tab      cmd-opt-right
 *   Cycle previous tab  cmd-opt-left
 *   Focus pane          cmd-opt-arrows
 *   New terminal        cmd-`
 *   New terminal tab    shift-cmd-`
 *   Toggle terminal     cmd-j
 *   Zoom in             cmd-= (cmd-+ on shift layouts)
 *   Zoom out            cmd--
 *   Reset zoom          cmd-0
 *   Previous session    shift-cmd-up
 *   Next session        shift-cmd-down
 *   Archive session     shift-cmd-a
 *   Previous project    shift-cmd-left
 *   Next project        shift-cmd-right
 *   Stop focused turn   escape
 */

import { matchesAction } from "./keybindings";
import type { FocusDir } from "./layout";

export type TabCommand =
  | "new"
  | "close-others"
  | "close"
  | "next"
  | "prev"
  | "cycle-next"
  | "cycle-prev"
  | "back"
  | "forward"
  | "split-right"
  | "split-down"
  | "new-terminal"
  | "new-terminal-tab"
  | "toggle-terminal"
  | "prev-session"
  | "next-session"
  | "archive-session"
  | "prev-project"
  | "next-project"
  | { activate: number }
  | { focus: FocusDir };

/**
 * PKmod: bindings come from `keybindings.defaults.json` plus user overrides
 * (see `src/lib/keybindings.ts`). Check order defines precedence when two
 * actions share a binding; tab-activation digits stay fixed and last.
 */
export function tabCommand(e: KeyboardEvent): TabCommand | null {
  if (e.isComposing) return null;

  if (matchesAction(e, "cycle_next_tab")) return "cycle-next";
  if (matchesAction(e, "cycle_prev_tab")) return "cycle-prev";
  if (matchesAction(e, "close_other_tabs")) return "close-others";
  if (matchesAction(e, "focus_left")) return { focus: "left" };
  if (matchesAction(e, "focus_right")) return { focus: "right" };
  if (matchesAction(e, "focus_up")) return { focus: "up" };
  if (matchesAction(e, "focus_down")) return { focus: "down" };

  if (matchesAction(e, "new_terminal_tab")) return "new-terminal-tab";
  if (matchesAction(e, "new_terminal")) return "new-terminal";

  if (matchesAction(e, "archive_session") && !e.repeat) {
    return "archive-session";
  }
  if (matchesAction(e, "next_tab")) return "next";
  if (matchesAction(e, "prev_tab")) return "prev";
  if (matchesAction(e, "prev_session")) return "prev-session";
  if (matchesAction(e, "next_session")) return "next-session";
  if (matchesAction(e, "prev_project")) return "prev-project";
  if (matchesAction(e, "next_project")) return "next-project";
  if (matchesAction(e, "split_down")) return "split-down";

  if (matchesAction(e, "new_tab")) return "new";
  if (matchesAction(e, "close_tab")) return "close";
  if (matchesAction(e, "split_right")) return "split-right";
  if (matchesAction(e, "toggle_terminal")) return "toggle-terminal";
  if (matchesAction(e, "back_tab")) return "back";
  if (matchesAction(e, "forward_tab")) return "forward";

  const mod = e.metaKey || e.ctrlKey;
  const key = e.key.toLowerCase();
  if (mod && !e.altKey && !e.shiftKey) {
    if (key >= "1" && key <= "8") return { activate: Number(key) - 1 };
    if (key === "9") return { activate: -1 };
  }
  return null;
}

export function adjacentItemId(
  ids: readonly string[],
  current: string | null,
  delta: number,
): string | null {
  if (ids.length === 0) return null;
  const index = current ? ids.indexOf(current) : -1;
  if (index < 0) return delta < 0 ? ids[ids.length - 1] : ids[0];
  const next = (index + (delta < 0 ? -1 : 1) + ids.length) % ids.length;
  return ids[next] ?? null;
}

export function shouldHandleListNavigation(input: {
  blockedTarget: boolean;
  emptyComposerTarget: boolean;
  surfaceOpen: boolean;
}): boolean {
  return (
    !input.surfaceOpen && (!input.blockedTarget || input.emptyComposerTarget)
  );
}

type EscapeKeyEvent = Pick<
  KeyboardEvent,
  | "key"
  | "isComposing"
  | "defaultPrevented"
  | "repeat"
  | "metaKey"
  | "ctrlKey"
  | "altKey"
  | "shiftKey"
>;

type EscapeFocusTab = {
  id: string;
  focusedId: string;
  diffFocused?: boolean;
};

type EscapeFocusSession = {
  id: string;
  busy?: boolean;
};

function isPlainEscape(e: EscapeKeyEvent): boolean {
  return (
    e.key === "Escape" &&
    !e.isComposing &&
    !e.repeat &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.altKey &&
    !e.shiftKey
  );
}

export function shouldStopFocusedTurnOnEscape(
  e: EscapeKeyEvent,
  options: { inTerminal: boolean; focusedSessionBusy: boolean },
): boolean {
  return (
    isPlainEscape(e) &&
    !e.defaultPrevented &&
    !options.inTerminal &&
    options.focusedSessionBusy
  );
}

export function focusedBusyAgentSessionId(
  activeTabId: string,
  tabs: readonly EscapeFocusTab[],
  sessions: readonly EscapeFocusSession[],
  projectTerminalFocused: boolean,
): string | null {
  if (projectTerminalFocused) return null;
  const tab = tabs.find((entry) => entry.id === activeTabId);
  if (!tab || tab.diffFocused) return null;
  const session = sessions.find((entry) => entry.id === tab.focusedId);
  return session?.busy === true ? session.id : null;
}

export function deferUnhandledEscape(
  e: EscapeKeyEvent,
  run: () => void,
  defer: (callback: () => void) => void = queueMicrotask,
): void {
  if (!isPlainEscape(e) || e.defaultPrevented) return;
  defer(() => {
    if (!e.defaultPrevented) run();
  });
}
