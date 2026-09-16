import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Search } from "./icons";
import { NoteCard } from "./NoteCard";
import { useLockOverscroll } from "../hooks/useLockOverscroll";
import { useTabGroupLogos } from "../hooks/useTabGroupLogos";
import {
  createNote,
  loadNotes,
  requestOpenNote,
  type Note,
} from "../lib/notes";
import { sameProjectPath } from "../lib/recents";
import {
  loadTabGroupColors,
  loadTabGroupCustomColors,
  loadTabGroupMascots,
} from "../lib/tabGroups";

/**
 * Per-project Notes tab: the classic notes tiles for this project's notes,
 * with search, quick create, and handoff to the full Notes view.
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
  const [creating, setCreating] = useState(false);
  const logos = useTabGroupLogos();
  const [groupMascots] = useState(loadTabGroupMascots);
  const [groupColors] = useState(loadTabGroupColors);
  const [groupCustomColors] = useState(loadTabGroupCustomColors);

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
    setCreating(true);
    try {
      const note = await createNote({ sourceCwd: cwd });
      await refresh();
      requestOpenNote(note.id);
      onOpenNote?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
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
            placeholder="Filter notes"
            aria-label="Filter project notes"
            spellCheck={false}
            autoComplete="off"
            className="h-7 min-w-0 flex-1 rounded-md bg-transparent pl-7 pr-2 text-[12px] text-content outline-none placeholder:text-content/40"
          />
        </div>
        <button
          type="button"
          title="New note"
          aria-label="New note"
          disabled={creating}
          onClick={() => void create()}
          className="grid size-6 shrink-0 place-items-center rounded-md text-content/45 hover:bg-content/10 hover:text-content disabled:opacity-40"
        >
          {creating ? (
            <LoaderCircle
              className="size-3.5 animate-spin"
              strokeWidth={1.75}
            />
          ) : (
            <Plus className="size-3.5" strokeWidth={1.75} />
          )}
        </button>
      </div>
      <div
        ref={listLock}
        className="min-h-0 flex-1 overflow-y-auto overscroll-none"
      >
        {error && notes.length === 0 ? (
          <p className="px-3 py-2 text-[12px] text-content/50">{error}</p>
        ) : loading && notes.length === 0 ? (
          <div className="flex justify-center py-10 text-content/40">
            <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
          </div>
        ) : shown.length === 0 ? (
          <p className="px-3 py-2 text-[12px] leading-relaxed text-content/50">
            {query.trim()
              ? "No matching notes"
              : "No notes yet. Save a turn from the transcript, or create one with +."}
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5 p-1.5">
            {shown.map((note) => (
              <li key={note.id}>
                <NoteCard
                  note={note}
                  active={false}
                  logos={logos}
                  mascots={groupMascots}
                  colors={groupColors}
                  customColors={groupCustomColors}
                  onSelect={() => {
                    requestOpenNote(note.id);
                    onOpenNote?.();
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
