import type { ProjectInitResult } from "./fs";

const SETTINGS_KEY = "monocode.projectInitialization";

export type ProjectInitLink = {
  source: string;
  target: string;
};

export type ProjectInitSettings = {
  links: ProjectInitLink[];
  linkAgentInstructions: boolean;
  ensureGitignore: boolean;
  createMetadataFiles: boolean;
};

export const DEFAULT_PROJECT_INIT_SETTINGS: ProjectInitSettings = {
  links: [
    { source: "~/Documents/GitHub/-agent", target: ".agent" },
    { source: "~/Documents/GitHub/-inspi", target: ".inspi" },
  ],
  linkAgentInstructions: true,
  ensureGitignore: true,
  createMetadataFiles: true,
};

function copyDefaults(): ProjectInitSettings {
  return {
    links: DEFAULT_PROJECT_INIT_SETTINGS.links.map((link) => ({ ...link })),
    linkAgentInstructions: DEFAULT_PROJECT_INIT_SETTINGS.linkAgentInstructions,
    ensureGitignore: DEFAULT_PROJECT_INIT_SETTINGS.ensureGitignore,
    createMetadataFiles: DEFAULT_PROJECT_INIT_SETTINGS.createMetadataFiles,
  };
}

function validLink(value: unknown): value is ProjectInitLink {
  if (!value || typeof value !== "object") return false;
  const link = value as { source?: unknown; target?: unknown };
  return (
    typeof link.source === "string" &&
    typeof link.target === "string" &&
    link.source.trim().length > 0 &&
    link.target.trim().length > 0
  );
}

export function loadProjectInitSettings(): ProjectInitSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return copyDefaults();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return copyDefaults();
    const value = parsed as Partial<ProjectInitSettings>;
    const links = Array.isArray(value.links)
      ? value.links.filter(validLink).map((link) => ({
          source: link.source.trim(),
          target: link.target.trim(),
        }))
      : copyDefaults().links;
    return {
      links: links.slice(0, 24),
      linkAgentInstructions:
        typeof value.linkAgentInstructions === "boolean"
          ? value.linkAgentInstructions
          : DEFAULT_PROJECT_INIT_SETTINGS.linkAgentInstructions,
      ensureGitignore:
        typeof value.ensureGitignore === "boolean"
          ? value.ensureGitignore
          : DEFAULT_PROJECT_INIT_SETTINGS.ensureGitignore,
      createMetadataFiles:
        typeof value.createMetadataFiles === "boolean"
          ? value.createMetadataFiles
          : DEFAULT_PROJECT_INIT_SETTINGS.createMetadataFiles,
    };
  } catch {
    return copyDefaults();
  }
}

export function saveProjectInitSettings(value: ProjectInitSettings): void {
  const next: ProjectInitSettings = {
    links: value.links
      .map((link) => ({
        source: link.source.trim(),
        target: link.target.trim(),
      }))
      .filter(validLink)
      .slice(0, 24),
    linkAgentInstructions: value.linkAgentInstructions,
    ensureGitignore: value.ensureGitignore,
    createMetadataFiles: value.createMetadataFiles,
  };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // private mode / quota
  }
}

export function projectInitResultMessage(result: ProjectInitResult): string {
  const linked = result.created.length + result.updated.length;
  const stable = result.existing.length;
  const skipped = result.skipped.length;
  const missing = result.missing.length;
  const metadata = result.metadataCreated.length;
  const parts = [`${linked} link${linked === 1 ? "" : "s"} ready`];
  if (stable > 0) parts.push(`${stable} already present`);
  if (skipped > 0)
    parts.push(`${skipped} local item${skipped === 1 ? "" : "s"} kept`);
  if (missing > 0)
    parts.push(`${missing} source${missing === 1 ? "" : "s"} missing`);
  if (metadata > 0)
    parts.push(`${metadata} metadata file${metadata === 1 ? "" : "s"} created`);
  if (result.gitignoreUpdated) parts.push(".gitignore updated");
  return `${parts.join(", ")}.`;
}
