/**
 * PKmod: tracks which terminals produced pty output recently, so the UI can
 * show a live activity cue (the little chomping pac) even while a runtime
 * runs silently in a terminal you're not staring at.
 */

/** How long after the last byte a terminal still counts as active. */
export const ACTIVITY_DECAY_MS = 1200;

const lastOutput = new Map<string, number>();

export function markTerminalOutput(id: string): void {
  lastOutput.set(id, Date.now());
}

export function forgetTerminal(id: string): void {
  lastOutput.delete(id);
}

export function forgetAllTerminals(): void {
  lastOutput.clear();
}

export function terminalActive(id: string): boolean {
  const at = lastOutput.get(id);
  return at != null && Date.now() - at < ACTIVITY_DECAY_MS;
}

export function anyTerminalActive(ids: readonly string[]): boolean {
  return ids.some(terminalActive);
}

export function activeTerminalIds(ids: readonly string[]): string[] {
  return ids.filter(terminalActive);
}
