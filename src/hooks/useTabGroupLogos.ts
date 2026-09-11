import { useEffect, useState } from "react";
import { loadTabGroupLogos, TAB_GROUP_LOGOS_CHANGED } from "../lib/tabGroups";

export type TabGroupLogos = Record<string, string>;

export function useTabGroupLogos(): TabGroupLogos {
  const [logos, setLogos] = useState(loadTabGroupLogos);
  useEffect(() => {
    const refresh = () => setLogos(loadTabGroupLogos());
    window.addEventListener(TAB_GROUP_LOGOS_CHANGED, refresh);
    return () => window.removeEventListener(TAB_GROUP_LOGOS_CHANGED, refresh);
  }, []);
  return logos;
}
