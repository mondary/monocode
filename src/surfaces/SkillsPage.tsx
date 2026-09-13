import { useEffect, useMemo, useState, type ReactNode } from "react";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  Copy,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  WandSparkles,
} from "../chrome/icons";
import { CreateSkillForm } from "../chrome/SkillPicker";
import { copyText } from "../lib/clipboard";
import { initializeProject, listSkills, type DiscoveredSkill } from "../lib/fs";
import {
  DEFAULT_PROJECT_INIT_SETTINGS,
  loadProjectInitSettings,
  projectInitResultMessage,
  saveProjectInitSettings,
  type ProjectInitLink,
  type ProjectInitSettings,
} from "../lib/projectInit";
import {
  createBlankSkill,
  invalidateSkills,
  loadDisabledSkillPaths,
  saveDisabledSkillPaths,
  SKILLS_CHANGE_EVENT,
} from "../lib/skills";

/** Inspect and manage file skills without modifying provider-owned catalogs. */
export function SkillsPage({ cwd }: { cwd: string }): ReactNode {
  const [skills, setSkills] = useState<DiscoveredSkill[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [disabledPaths, setDisabledPaths] = useState<string[]>(() =>
    loadDisabledSkillPaths(),
  );
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSkills(null);
    setError(null);
    listSkills(cwd)
      .then((next) => {
        if (cancelled) return;
        setSkills(next);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [cwd, reload]);

  useEffect(() => {
    const onChange = (): void => setDisabledPaths(loadDisabledSkillPaths());
    window.addEventListener(SKILLS_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(SKILLS_CHANGE_EVENT, onChange);
  }, []);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      (skills ?? []).filter(
        (skill) =>
          !needle ||
          skill.name.toLowerCase().includes(needle) ||
          skill.description.toLowerCase().includes(needle) ||
          skill.source.toLowerCase().includes(needle) ||
          skill.path.toLowerCase().includes(needle),
      ),
    [needle, skills],
  );

  const onToggle = (path: string, enabled: boolean): void => {
    const next = enabled
      ? disabledPaths.filter((item) => item !== path)
      : [...disabledPaths, path];
    try {
      saveDisabledSkillPaths(next);
      setActionError(null);
    } catch {
      setActionError("Could not save the skill preference. Try again.");
    }
  };

  const onReveal = (path: string): void => {
    setActionError(null);
    void revealItemInDir(path).catch((err: unknown) => {
      setActionError(
        `Could not open the folder: ${err instanceof Error ? err.message : String(err)}`,
      );
    });
  };

  const onCopyPath = (path: string): void => {
    setActionError(null);
    void copyText(path).catch(() => {
      setActionError("Could not copy the path to the clipboard.");
    });
  };

  const onCreate = (name: string, scope: "project" | "user"): void => {
    setBusy(true);
    setCreateError(null);
    void createBlankSkill({ cwd, name, scope })
      .then(() => {
        invalidateSkills();
        window.dispatchEvent(new Event(SKILLS_CHANGE_EVENT));
        setAdding(false);
        setReload((value) => value + 1);
      })
      .catch((err: unknown) => {
        setCreateError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setBusy(false));
  };

  return (
    <>
      <ProjectInitializationPanel cwd={cwd} />
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 text-[12px] text-content/40 tabular-nums">
            {skills == null
              ? "…"
              : `${filtered.length} ${filtered.length === 1 ? "skill" : "skills"}`}
          </span>
          <label className="flex h-7 w-52 min-w-0 flex-1 items-center gap-2 rounded-md border border-content/10 px-2 text-content/45 focus-within:border-content/20">
            <Search className="size-3.5 shrink-0" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter"
              aria-label="Filter skills"
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-content outline-none placeholder:text-content/35"
            />
          </label>
          <button
            type="button"
            aria-label="Refresh skills"
            title="Rescan skill folders"
            disabled={skills === null && !error}
            onClick={() => {
              invalidateSkills();
              window.dispatchEvent(new Event(SKILLS_CHANGE_EVENT));
              setReload((value) => value + 1);
            }}
            className="grid size-6 shrink-0 place-items-center rounded-md text-content/45 hover:bg-content/10 hover:text-content"
          >
            <RefreshCw className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={adding ? "Close skill form" : "Add skill"}
            disabled={busy}
            className="rounded-md border border-content/10 px-2.5 py-1 text-[12px] text-content/70 hover:bg-content/10 disabled:opacity-40"
            onClick={() => {
              setAdding((value) => !value);
              setCreateError(null);
            }}
            title="Create a starter SKILL.md you can edit"
          >
            {adding ? "Close" : "Add skill"}
          </button>
        </div>
      </div>

      {adding ? (
        <div className="mb-4 overflow-hidden rounded-lg border border-content/10 bg-content/[0.03]">
          <CreateSkillForm
            key={cwd}
            query={query}
            cwd={cwd}
            monospace={false}
            error={createError}
            busy={busy}
            onCancel={() => {
              setAdding(false);
              setCreateError(null);
            }}
            onCreate={onCreate}
          />
        </div>
      ) : null}

      {actionError ? (
        <p role="alert" className="pb-3 text-[12px] text-red-400">
          {actionError}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-[12px] text-red-400">
          {error}
        </p>
      ) : skills == null ? (
        <p className="text-[12px] text-content/45">Loading skills…</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-content/10">
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-[12px] text-content/45">
              {skills.length === 0
                ? "No skills yet. Add skill creates a starter SKILL.md."
                : "No matching skills"}
            </p>
          ) : (
            filtered.map((skill) => {
              const disabled = disabledPaths.includes(skill.path);
              return (
                <div
                  key={skill.path}
                  className={`border-b border-content/5 px-3 py-2 last:border-b-0 ${
                    disabled ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="min-w-0 flex-1 truncate font-sans text-[12px] text-content"
                      title={skill.name}
                    >
                      {skill.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-content/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-content/60">
                      {skill.scope === "user"
                        ? "Personal"
                        : skill.scope === "builtin"
                          ? "MonoCode"
                          : "Project"}
                    </span>
                    <span className="w-20 shrink-0 truncate text-right font-sans text-[11px] text-content/40">
                      {skill.source}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-label={`Include ${skill.name} in MonoCode catalog`}
                      aria-checked={!disabled}
                      onClick={() => onToggle(skill.path, disabled)}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${disabled ? "bg-content/20" : "bg-accent"}`}
                    >
                      <span
                        className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] ${disabled ? "left-0.5" : "left-4.5"}`}
                      />
                    </button>
                  </div>
                  {skill.description ? (
                    <p
                      className="mt-0.5 truncate text-[12px] text-content/55"
                      title={skill.description}
                    >
                      {skill.description}
                    </p>
                  ) : null}
                  <div className="mt-0.5 flex items-center gap-1">
                    <p
                      className="min-w-0 flex-1 truncate font-sans text-[11px] text-content/35"
                      title={skill.path}
                    >
                      {skill.path}
                    </p>
                    <button
                      type="button"
                      aria-label={`Copy path of ${skill.name}`}
                      title="Copy path"
                      onClick={() => onCopyPath(skill.path)}
                      className="grid size-5 shrink-0 place-items-center rounded text-content/40 hover:bg-content/10 hover:text-content"
                    >
                      <Copy className="size-3" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Reveal ${skill.name} in file explorer`}
                      title="Reveal in file manager"
                      onClick={() => onReveal(skill.path)}
                      className="grid size-5 shrink-0 place-items-center rounded text-content/40 hover:bg-content/10 hover:text-content"
                    >
                      <FolderOpen className="size-3" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <p className="pt-3 text-[12px] text-content/40">
        Hidden skills stay on disk and are excluded from MonoCode's file-skill
        catalog. Provider-managed skills and native commands are unaffected.
        Skills live in <span className="font-sans">.agents/skills</span> for
        this project and <span className="font-sans">~/.agents/skills</span> for
        you personally; harness folders are also picked up.
      </p>
    </>
  );
}

function ProjectInitializationPanel({ cwd }: { cwd: string }): ReactNode {
  const [settings, setSettings] = useState<ProjectInitSettings>(() =>
    loadProjectInitSettings(),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const persist = (next: ProjectInitSettings) => {
    setSettings(next);
    saveProjectInitSettings(next);
    setMessage(null);
    setError(null);
  };

  const updateLink = (index: number, patch: Partial<ProjectInitLink>) => {
    persist({
      ...settings,
      links: settings.links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    });
  };

  const initialize = () => {
    if (!cwd || cwd === "~") {
      setError("Open a project before initializing it.");
      return;
    }
    setBusy(true);
    setMessage(null);
    setError(null);
    void initializeProject(cwd, settings)
      .then((result) => {
        setMessage(projectInitResultMessage(result));
        invalidateSkills();
        window.dispatchEvent(new Event(SKILLS_CHANGE_EVENT));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setBusy(false));
  };

  const reset = () => {
    persist({
      links: DEFAULT_PROJECT_INIT_SETTINGS.links.map((link) => ({ ...link })),
      linkAgentInstructions:
        DEFAULT_PROJECT_INIT_SETTINGS.linkAgentInstructions,
      ensureGitignore: DEFAULT_PROJECT_INIT_SETTINGS.ensureGitignore,
      createMetadataFiles: DEFAULT_PROJECT_INIT_SETTINGS.createMetadataFiles,
    });
  };

  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-accent/20 bg-accent/[0.04]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-accent/10 px-3 py-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-content">
            Project initialization
            <span className="rounded border border-accent/35 bg-accent/10 px-1 py-px text-[9px] font-semibold uppercase tracking-[0.08em] text-accent">
              PK
            </span>
          </h2>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-content/50">
            Create your local template and skill links in one click. Existing
            files and folders are never overwritten.
          </p>
        </div>
        <button
          type="button"
          onClick={initialize}
          disabled={busy || !cwd || cwd === "~"}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-accent/35 bg-accent/10 px-2.5 py-1.5 text-[12px] text-accent hover:bg-accent/15 disabled:cursor-default disabled:opacity-40"
        >
          <WandSparkles
            className={`size-3.5 ${busy ? "animate-pulse" : ""}`}
            strokeWidth={1.75}
          />
          {busy ? "Initializing…" : "Initialize project"}
        </button>
      </div>

      <div className="space-y-3 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-medium text-content">
              Directory links
            </p>
            <p className="text-[11px] text-content/40">
              Sources accept absolute paths or paths beginning with{" "}
              <code>~</code>.
            </p>
          </div>
          <button
            type="button"
            aria-label="Add project initialization link"
            title="Add link"
            onClick={() =>
              persist({
                ...settings,
                links: [...settings.links, { source: "", target: "" }],
              })
            }
            className="grid size-6 shrink-0 place-items-center rounded-md text-content/50 hover:bg-content/10 hover:text-content"
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {settings.links.length === 0 ? (
          <p className="rounded-md border border-dashed border-content/10 px-3 py-2 text-[11px] text-content/40">
            No directory links configured.
          </p>
        ) : (
          <div className="space-y-2">
            {settings.links.map((link, index) => (
              <div
                key={`project-init-link-${index}`}
                className="flex min-w-0 items-center gap-2"
              >
                <input
                  value={link.source}
                  onChange={(event) =>
                    updateLink(index, { source: event.target.value })
                  }
                  aria-label={`Initialization source ${index + 1}`}
                  placeholder="~/Documents/GitHub/-agent"
                  spellCheck={false}
                  className="min-w-0 flex-1 rounded-md border border-content/10 bg-content/5 px-2 py-1.5 font-mono text-[11px] text-content outline-none placeholder:text-content/30 focus:border-accent/45"
                />
                <span className="shrink-0 text-content/30">→</span>
                <input
                  value={link.target}
                  onChange={(event) =>
                    updateLink(index, { target: event.target.value })
                  }
                  aria-label={`Initialization target ${index + 1}`}
                  placeholder=".agent"
                  spellCheck={false}
                  className="w-32 shrink-0 rounded-md border border-content/10 bg-content/5 px-2 py-1.5 font-mono text-[11px] text-content outline-none placeholder:text-content/30 focus:border-accent/45"
                />
                <button
                  type="button"
                  aria-label={`Remove initialization link ${index + 1}`}
                  title="Remove link"
                  onClick={() =>
                    persist({
                      ...settings,
                      links: settings.links.filter(
                        (_, linkIndex) => linkIndex !== index,
                      ),
                    })
                  }
                  className="grid size-6 shrink-0 place-items-center rounded-md text-content/35 hover:bg-red-400/10 hover:text-red-400"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-2 border-t border-content/5 pt-3">
          <InitToggle
            label="Link agent instruction files"
            description="Expose available AGENT/LLM instruction files at the project root."
            on={settings.linkAgentInstructions}
            onChange={(value) =>
              persist({ ...settings, linkAgentInstructions: value })
            }
          />
          <InitToggle
            label="Update .gitignore"
            description="Ignore the configured symlink targets and generated instruction links."
            on={settings.ensureGitignore}
            onChange={(value) =>
              persist({ ...settings, ensureGitignore: value })
            }
          />
          <InitToggle
            label="Create VERSION and CHANGELOG.md"
            description="Create starter metadata files only when they do not exist."
            on={settings.createMetadataFiles}
            onChange={(value) =>
              persist({ ...settings, createMetadataFiles: value })
            }
          />
        </div>

        {error ? (
          <p role="alert" className="text-[12px] text-red-400">
            {error}
          </p>
        ) : message ? (
          <p role="status" className="text-[12px] text-emerald-400">
            {message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="text-[11px] text-content/40 hover:text-content"
          >
            Reset defaults
          </button>
        </div>
      </div>
    </section>
  );
}

function InitToggle({
  label,
  description,
  on,
  onChange,
}: {
  label: string;
  description: string;
  on: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[12px] text-content">{label}</p>
        <p className="text-[11px] text-content/40">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          on ? "bg-accent" : "bg-content/20"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] ${
            on ? "left-4.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
