import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownCircle, Check } from "./icons";
import { Modal } from "./Modal";
import {
  registerPkUpdateDialog,
  type PkUpdateAxis,
  type PkUpdateDialogRequest,
} from "../lib/pkUpdateDialog";

/**
 * In-app replacement for the native update prompt: the same two-axis status
 * (official upstream + PK branch) rendered like the What's New panes, with
 * commit lists and a Mettre à jour / Plus tard footer.
 */
export function UpdateFlowDialog() {
  const [request, setRequest] = useState<PkUpdateDialogRequest | null>(null);
  const resolveRef = useRef<((proceed: boolean) => void) | null>(null);

  useEffect(() => {
    registerPkUpdateDialog(async (next) => {
      setRequest(next);
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
      });
    });
    return () => {
      registerPkUpdateDialog(null);
      resolveRef.current = null;
      setRequest(null);
    };
  }, []);

  const finish = (proceed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setRequest(null);
    resolve?.(proceed);
  };

  if (!request) return null;

  return (
    <Modal
      onClose={() => finish(false)}
      title={request.upToDate ? "Tout est à jour" : "Mise à jour PKmod"}
      description="MonoCode officiel · MonoCodePK"
      size="lg"
      className="flex h-[min(64vh,560px)] flex-col overflow-hidden"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2 md:divide-x md:divide-content/10">
        {request.axes.map((axis) => (
          <UpdateAxisPane key={axis.label} axis={axis} />
        ))}
      </div>
      <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-content/10 px-4 py-3">
        <button
          type="button"
          onClick={() => finish(false)}
          className="rounded-md px-3 py-1.5 text-[12px] text-content/60 hover:bg-content/8 hover:text-content"
        >
          {request.upToDate ? "Fermer" : "Plus tard"}
        </button>
        {request.upToDate ? null : (
          <button
            type="button"
            autoFocus
            onClick={() => finish(true)}
            className="flex items-center gap-1.5 rounded-md border border-accent/35 bg-accent/10 px-3 py-1.5 text-[12px] font-medium text-accent hover:bg-accent/15"
          >
            <ArrowDownCircle className="size-3.5" strokeWidth={1.75} />
            Mettre à jour
          </button>
        )}
      </footer>
    </Modal>
  );
}

function UpdateAxisPane({ axis }: { axis: PkUpdateAxis }): ReactNode {
  const upToDate = axis.behind === 0;
  return (
    <section className="flex min-h-0 flex-col">
      <header className="flex items-center gap-2 border-b border-content/10 px-5 py-3">
        <h2 className="text-[13px] font-semibold text-content">{axis.label}</h2>
        {upToDate ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <Check className="size-2.5" strokeWidth={2.5} />
            À jour
          </span>
        ) : (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
            {axis.behind} commit{axis.behind === 1 ? "" : "s"}
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] text-content/45">
          {axis.currentVersion}
          {axis.availableVersion && !upToDate
            ? ` → ${axis.availableVersion}`
            : ""}
        </span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        {upToDate ? (
          <p className="text-[12px] text-content/50">
            {axis.currentVersion} est la dernière version.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {axis.commits.map((commit) => (
              <li
                key={commit}
                className="truncate font-mono text-[11px] leading-relaxed text-content/70"
                title={commit}
              >
                <span className="text-content/35">•</span> {commit}
              </li>
            ))}
            {axis.behind > axis.commits.length ? (
              <li className="text-[11px] text-content/40">
                … et {axis.behind - axis.commits.length} autres
              </li>
            ) : null}
          </ul>
        )}
        {axis.ahead > 0 ? (
          <p className="mt-3 rounded-md border border-amber-400/25 bg-amber-400/8 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-300/90">
            {axis.ahead} commit{axis.ahead === 1 ? "" : "s"} local
            {axis.ahead === 1 ? "" : "aux"} non poussé
            {axis.ahead === 1 ? "" : "s"} — la mise à jour exige un arbre
            propre&nbsp;: pousse d'abord.
          </p>
        ) : null}
      </div>
    </section>
  );
}
