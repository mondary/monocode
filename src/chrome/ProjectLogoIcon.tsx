import { Folder, type IconComponent } from "./icons";
import { useEffect, useState } from "react";
import { projectLogoSrc } from "../lib/projectLogos";
import { projectKey } from "../lib/paths";
import { loadTabGroupLogos } from "../lib/tabGroups";
import {
  TAB_GROUP_LOGOS_CHANGED,
  tabGroupLogoDisplayRevision,
} from "../lib/tabGroups";

type Props = {
  /** Chemin du fichier logo resolu. */
  path?: string | null;
  /** Chemin du projet : le logo est resolu depuis la table des logos. */
  projectPath?: string | null;
  className?: string;
  imageClassName?: string;
  fallback?: IconComponent;
  fallbackStrokeWidth?: number;
  onLoadError?: () => void;
};

export function ProjectLogoIcon({
  path,
  projectPath,
  className = "size-3.5 shrink-0",
  imageClassName,
  fallback: Fallback = Folder,
  fallbackStrokeWidth = 1.5,
  onLoadError,
}: Props) {
  const [revision, setRevision] = useState(tabGroupLogoDisplayRevision);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const refresh = () => setRevision(tabGroupLogoDisplayRevision());
    window.addEventListener(TAB_GROUP_LOGOS_CHANGED, refresh);
    return () => window.removeEventListener(TAB_GROUP_LOGOS_CHANGED, refresh);
  }, []);

  useEffect(() => setFailed(false), [path, projectPath]);

  const resolved = projectPath
    ? loadTabGroupLogos()[projectKey(projectPath)]
    : path;
  const src = failed ? null : projectLogoSrc(resolved);
  if (src) {
    return (
      <img
        key={`${resolved ?? ""}:${revision}`}
        src={src}
        alt=""
        className={`rounded-sm object-cover ${className} ${imageClassName ?? ""}`}
        onError={() => {
          setFailed(true);
          onLoadError?.();
        }}
      />
    );
  }
  return (
    <Fallback className={className} strokeWidth={fallbackStrokeWidth} />
  );
}
