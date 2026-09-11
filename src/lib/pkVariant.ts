import { useEffect, useState } from "react";
import { getIdentifier } from "@tauri-apps/api/app";

/** Which installed PK variant this window runs as. */
export type PkVariant = "dev" | "stable" | "official";

let cached: PkVariant | null = null;

/** Resolves once per app run; the bundle identifier never changes mid-run. */
export function pkVariant(): Promise<PkVariant> {
  if (cached) return Promise.resolve(cached);
  return (async () => {
    try {
      const identifier = await getIdentifier();
      if (identifier === "com.monocode.pk.dev") cached = "dev";
      else if (identifier === "com.monocode.pk") cached = "stable";
      else cached = "official";
    } catch {
      cached = "official";
    }
    return cached;
  })();
}

export function usePkVariant(): PkVariant | null {
  const [variant, setVariant] = useState<PkVariant | null>(null);
  useEffect(() => {
    let cancelled = false;
    void pkVariant().then((value) => {
      if (!cancelled) setVariant(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return variant;
}
