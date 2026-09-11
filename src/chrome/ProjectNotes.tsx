import { useCallback, useEffect, useMemo, useState } from "react";
import { File, Plus, Search, Trash2 } from "./icons";
import { useLockOverscroll } from "../hooks/useLockOverscroll";
import { formatRelativeTime } from "../lib/githubTasks";
import {
  createNote,
  deleteNote,
  loadNotes,
  notePreview,
  noteTitle,
  requestOpenNote,
  type Note,
} from "../lib/notes";
import { sameProjectPath } from "../lib/recents";

/**
 * Per-project Notes tab: the notes saved from this project's sessions and
 * composer, with quick create/delete and handoff to the full Notes view.
 */
export function ProjectNotes({
  cwd,
  active,
  onOpenNote,
}: {
  cwd: string;
  active: boolean;
  onOpenNote?: () => void;
}) {
  const listLock = useLockOverscroll<HTMLDivElement>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    try {
      setNotes(await loadNotes(false));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    void refresh();
  }, [cwd, active, refresh]);

  const projectNotes = useMemo(() => {
    if (!cwd) return [];
    return notes
      .filter((note) => note.sourceCwd && sameProjectPath(note.sourceCwd, cwd))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, cwd]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projectNotes;
    return projectNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(needle) ||
        note.body.toLowerCase().includes(needle),
    );
  }, [projectNotes, query]);

  const create = async () => {
    try {
      const note = await createNote({ sourceCwd: cwd });
      await refresh();
      requestOpenNote(note.id);
      onOpenNote?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteNote(id);
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-content/10 px-2">
        <div className="relative flex h-7 min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-2 size-3 shrink-0 opacity-50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes"
            aria-label="Search project notes"
            className="h-7 min-w-0 flex-1 rounded-md bg-content/5 pl-7 pr-2 text-[12px] text-content outline-none placeholder:text-content/35 focus:bg-content/8"
          />
        </div>
        <button
          type="button"
          title="New note"
          aria-label="New note"
          onClick={() => void create()}
          className="grid size-6 shrink-0 place-items-center rounded-md text-content/55 hover:bg-content/10 hover:text-content"
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
      <div
        ref={listLock}
        className="min-h-0 flex-1 overflow-y-auto overscroll-none"
      >
        {error ? (
          <p role="alert" className="px-3 py-2 text-[12px] text-red-400">
            {error}
          </p>
        ) : loading ? (
          <p className="px-3 py-2 text-[12px] text-content/40">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="px-3 py-2 text-[12px] leading-relaxed text-content/40">
            {query
              ? "No notes match."
              : "No notes for this project yet. Save a finished turn with the note button, or create one with +."}
          </p>
        ) : (
          <ul className="px-1.5 py-1">
            {shown.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                onOpen={() => {
                  requestOpenNote(note.id);
                  onOpenNote?.();
                }}
                onDelete={() => void remove(note.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NoteRow({
  note,
  onOpen,
  onDelete,
}: {
  note: Note;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const title = note.title || noteTitle(note.body) || "Untitled note";
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-content/8"
        title={`${title} — ${formatRelativeTime(
          new Date(note.updatedAt).toISOString(),
        )}`}
      >
        <File
          className="mt-0.5 size-3.5 shrink-0 text-content/40"
          strokeWidth={1.75}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] leading-snug text-content">
            {title}
          </span>
          <span className="block truncate text-[11px] leading-snug text-content/45">
            {notePreview(note.body, title)}
          </span>
        </span>
        <button
          type="button"
          title="Delete note"
          aria-label={`Delete note ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="mt-0.5 hidden size-5 shrink-0 place-items-center rounded text-content/40 hover:bg-red-400/10 hover:text-red-400 group-hover:grid"
        >
          <Trash2 className="size-3" strokeWidth={1.75} />
        </button>
      </button>
    </li>
  );
}
