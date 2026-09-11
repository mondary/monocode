import { relaunch } from "@tauri-apps/plugin-process";
import { createPortal } from "react-dom";
import type { InstalledUpdate } from "../lib/updateNotice";
import { LAYER } from "../lib/layers";
import { X } from "./icons";

type Props = {
  update: InstalledUpdate | null;
  onOpenWhatsNew: () => void;
  onDismiss: () => void;
};

/** Global post-update notice. It must remain visible even when the sidebar is hidden. */
export function UpdateRestartToast({ update, onOpenWhatsNew, onDismiss }: Props) {
  if (!update) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-5 flex justify-center px-4"
      style={{ zIndex: LAYER.toast }}
    >
      <article
        className="pointer-events-auto flex w-[min(560px,calc(100vw-32px))] items-center gap-3 rounded-2xl border border-content/15 bg-panel/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
        role="status"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-sm">
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-content">Mise à jour installée</p>
          <p className="truncate text-[12px] text-content/60">
            MonoCodePK {update.version} est prêt. Redémarrez l’application pour appliquer la mise à jour.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void relaunch()}
          className="shrink-0 rounded-lg bg-accent px-3 py-2 text-[12px] font-semibold text-accent-foreground transition hover:brightness-110"
        >
          Redémarrer maintenant
        </button>
        <button
          type="button"
          onClick={onOpenWhatsNew}
          className="hidden shrink-0 rounded-lg px-2 py-2 text-[12px] text-content/70 hover:bg-content/10 hover:text-content sm:block"
        >
          Nouveautés
        </button>
        <button
          type="button"
          aria-label="Fermer la notification"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1.5 text-content/50 hover:bg-content/10 hover:text-content"
        >
          <X className="size-4" />
        </button>
      </article>
    </div>,
    document.body,
  );
}
