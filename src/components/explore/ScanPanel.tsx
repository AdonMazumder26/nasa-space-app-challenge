export function ScanPanel({
  title,
  countLabel,
  emptyLabel,
  closeLabel,
  missionLabel,
  sites,
  onSelect,
  onMission,
  onClose,
}: {
  title: string;
  countLabel: string | null;
  emptyLabel: string;
  closeLabel: string;
  missionLabel: string | null;
  sites: { id: string; name: string }[];
  onSelect: (id: string) => void;
  onMission: (() => void) | null;
  onClose: () => void;
}) {
  return (
    <section className="space-y-3" aria-labelledby="scan-title" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <h2 id="scan-title" className="font-display text-2xl">
          {title}
        </h2>
        <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-xs">
          {closeLabel}
        </button>
      </div>
      {sites.length === 0 ? (
        <p className="text-sm text-[#93a6c9]">{emptyLabel}</p>
      ) : (
        <>
          {countLabel && <p className="text-sm text-[#f4f7ff]">{countLabel}</p>}
          <ul className="space-y-1">
            {sites.map((site) => (
              <li key={site.id}>
                <button type="button" onClick={() => onSelect(site.id)} className="flex w-full items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-[#f4f7ff] hover:bg-white/10">
                  <span aria-hidden="true">●</span>
                  {site.name}
                </button>
              </li>
            ))}
          </ul>
          {onMission && missionLabel && (
            <button type="button" onClick={onMission} className="rounded-full border border-[#f2a64a] px-3 py-1.5 text-xs text-[#f2a64a]">
              {missionLabel}
            </button>
          )}
        </>
      )}
    </section>
  );
}
