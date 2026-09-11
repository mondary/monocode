import { invoke } from "@tauri-apps/api/core";

const KEY = "monocode.customProviders";

export type CustomProvider = {
  /** OpenCode config id: pk-custom-<slug>. */
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  /** Model ids reported by the endpoint during the last test. */
  models: string[];
};

export type CustomProviderProbe = {
  ok: boolean;
  status: number;
  models: string[];
  error: string | null;
};

export const CUSTOM_PROVIDERS_CHANGE_EVENT = "monocode:custom-providers-change";

export function slugCustomProviderId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  return `pk-custom-${slug}`;
}

export function loadCustomProviders(): CustomProvider[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const record = value as Record<string, unknown>;
      if (
        typeof record.id !== "string" ||
        typeof record.name !== "string" ||
        typeof record.baseUrl !== "string" ||
        typeof record.apiKey !== "string"
      ) {
        return [];
      }
      return [
        {
          id: record.id,
          name: record.name,
          baseUrl: record.baseUrl,
          apiKey: record.apiKey,
          models: Array.isArray(record.models)
            ? record.models.filter(
                (model): model is string => typeof model === "string",
              )
            : [],
        },
      ];
    });
  } catch {
    return [];
  }
}

export function saveCustomProviders(providers: CustomProvider[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(providers));
  } catch {
    // private mode / quota
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("monocode:custom-providers-change"));
  // Push the current set into OpenCode's config so the runtime can route.
  void invoke("custom_provider_sync", { providers }).catch(() => undefined);
}

export function upsertCustomProvider(
  provider: CustomProvider,
): CustomProvider[] {
  const next = loadCustomProviders().filter(
    (entry) => entry.id !== provider.id,
  );
  next.push(provider);
  saveCustomProviders(next);
  return next;
}

export function deleteCustomProvider(id: string): CustomProvider[] {
  const next = loadCustomProviders().filter((entry) => entry.id !== id);
  saveCustomProviders(next);
  return next;
}

export function customProviderTestLabel(
  probe: CustomProviderProbe | null,
): string | null {
  if (!probe) return null;
  if (probe.ok) {
    const count = probe.models.length;
    return count > 0
      ? `OK — ${count} model${count === 1 ? "" : "s"} found`
      : "OK";
  }
  return probe.error ?? `Failed (HTTP ${probe.status})`;
}
