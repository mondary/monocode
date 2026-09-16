import {
  formatReleaseDate,
  presentReleaseNotes,
} from "../lib/releaseNotes";
import { AgentMarkdown } from "../surfaces/AgentMarkdown";
import { Modal } from "./Modal";

type Props = {
  officialVersion: string;
  pkVersion: string;
  onClose: () => void;
};

export function WhatsNewBody({ version }: { version: string }) {
  const notes = presentReleaseNotes(version);

  return (
    <article
      aria-label={`What's new in ${version}`}
      className="px-5 py-4"
    >
      {notes?.markdown ? (
        <AgentMarkdown
          className="whats-new-md"
          text={notes.markdown}
          streaming={false}
        />
      ) : (
        <p className="text-[13px] text-content/60">
          Release notes for this version are not available in this build.
        </p>
      )}
    </article>
  );
}

function WhatsNewPane({
  title,
  version,
  date,
}: {
  title: string;
  version: string;
  date: string | null;
}) {
  return (
    <section className="flex min-h-0 flex-col">
      <header className="flex items-baseline gap-2 border-b border-content/10 px-5 py-3">
        <h2 className="text-[13px] font-semibold text-content">{title}</h2>
        {date ? (
          <span className="text-[11px] text-content/45">{date}</span>
        ) : null}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <WhatsNewBody version={version} />
      </div>
    </section>
  );
}

export function WhatsNewDialog({
  officialVersion,
  pkVersion,
  onClose,
}: Props) {
  const official = presentReleaseNotes(officialVersion);
  const pk = presentReleaseNotes(pkVersion);

  return (
    <Modal
      onClose={onClose}
      title="What's new"
      description="MonoCode officiel · MonoCodePK"
      size="lg"
      className="flex h-[min(72vh,680px)] flex-col overflow-hidden"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2 md:divide-x md:divide-content/10">
        <WhatsNewPane
          title="MonoCode officiel"
          version={officialVersion}
          date={official?.date ? formatReleaseDate(official.date) : null}
        />
        <WhatsNewPane
          title="MonoCodePK"
          version={pkVersion}
          date={pk?.date ? formatReleaseDate(pk.date) : null}
        />
      </div>
    </Modal>
  );
}
