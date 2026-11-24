const KEY = "monocode.legacyModelPicker";
const CHANGE_EVENT = "monocode:legacy-model-picker-change";

export const LEGACY_MODEL_PICKER_DEFAULT = false;

export function loadLegacyModelPicker(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw == null) return LEGACY_MODEL_PICKER_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return LEGACY_MODEL_PICKER_DEFAULT;
  }
}

export function saveLegacyModelPicker(value: boolean): void {
  try {
    localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    // private mode / quota
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** The picker re-mounts on change, so a version counter is enough. */
export function subscribeLegacyModelPicker(
  onStoreChange: () => void,
): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
}

export function legacyModelPickerSnapshot(): number {
  return loadLegacyModelPicker() ? 1 : 0;
}
