import type { Expedition } from "../../lib/exploration";

export function ExpeditionPanel({
  title,
  emptyLabel,
  closeLabel,
  startLabel,
  nextLabel,
  completeLabel,
  newLabel,
  earlierLabel,
  laterLabel,
  removeLabel,
  stepLabel,
  sites,
  expedition,
  summary,
  onOpen,
  onStart,
  onNext,
  onMove,
  onRemove,
  onClear,
  onClose,
}: {
  title: string;
  emptyLabel: string;
  closeLabel: string;
  startLabel: string;
  nextLabel: string;
  completeLabel: string;
  newLabel: string;
  earlierLabel: string;
  laterLabel: string;
  removeLabel: string;
  stepLabel: string;
  sites: { id: string; name: string }[];
  expedition: Expedition | null;
  summary: { visited: string; missions: string; explored: string; span?: string } | null;
  onOpen: (id: string) => void;
  onStart: () => void;
  onNext: () => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const stops = expedition?.artifactIds ?? [];
  const status = expedition?.status ?? "draft";
  const current = expedition?.currentIndex ?? 0;

  return (
    <section className="space-y-3" aria-labelledby="expedition-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="expedition-title" className="font-display text-2xl">
          {title}
        </h2>
        <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-xs">
          {closeLabel}
        </button>
      </div>
      {stops.length === 0 ? (
        <p className="text-sm text-[#93a6c9]">{emptyLabel}</p>
      ) : (
        <>
          {status === "active" && <p className="text-xs tracking-[0.14em] text-[#f2a64a] uppercase">{stepLabel}</p>}
          <ol className="space-y-1">
            {stops.map((id, index) => {
              const name = sites.find((site) => site.id === id)?.name ?? id;
              const mark = status === "completed" || (status === "active" && index < current) ? "■" : status === "active" && index === current ? "●" : "○";
              return (
                <li key={id} className="flex items-center gap-2">
                  <button type="button" onClick={() => onOpen(id)} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-[#f4f7ff] hover:bg-white/10">
                    <span aria-hidden="true">{mark}</span>
                    <span className="truncate">
                      {String(index + 1).padStart(2, "0")} {name}
                    </span>
                  </button>
                  {status === "draft" && (
                    <span className="flex shrink-0 gap-1">
                      <button type="button" aria-label={earlierLabel} onClick={() => onMove(id, -1)} className="rounded-full border border-white/15 px-2 py-1 text-xs">
                        ↑
                      </button>
                      <button type="button" aria-label={laterLabel} onClick={() => onMove(id, 1)} className="rounded-full border border-white/15 px-2 py-1 text-xs">
                        ↓
                      </button>
                      <button type="button" aria-label={removeLabel} onClick={() => onRemove(id)} className="rounded-full border border-white/15 px-2 py-1 text-xs">
                        ×
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {status === "draft" && (
            <button type="button" onClick={onStart} className="rounded-full border border-[#f2a64a] px-3 py-1.5 text-xs text-[#f2a64a]">
              {startLabel}
            </button>
          )}
          {status === "active" && current < stops.length - 1 && (
            <button type="button" onClick={onNext} className="rounded-full border border-[#6aa4ff] px-3 py-1.5 text-xs text-[#6aa4ff]">
              {nextLabel}
            </button>
          )}
          {status === "active" && current >= stops.length - 1 && (
            <button type="button" onClick={onNext} className="rounded-full border border-[#6aa4ff] px-3 py-1.5 text-xs text-[#6aa4ff]">
              {completeLabel}
            </button>
          )}
          {status === "completed" && summary && (
            <div className="space-y-1 text-sm text-[#c5d2ea]">
              <p className="text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{completeLabel}</p>
              <p>{summary.visited}</p>
              <p>{summary.missions}</p>
              <p>{summary.explored}</p>
              {summary.span && <p>{summary.span}</p>}
              <button type="button" onClick={onClear} className="mt-2 rounded-full border border-white/15 px-3 py-1.5 text-xs">
                {newLabel}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
