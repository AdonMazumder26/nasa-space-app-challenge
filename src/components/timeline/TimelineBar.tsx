import { LuCalendarDays, LuChevronRight } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { formatDisplayDate } from "../../lib/presentation";
import type { TimelineEvent } from "../../types/catalog";

type Props = {
  events: TimelineEvent[];
  activeId: string | null;
  onSelect: (event: TimelineEvent) => void;
};

export function TimelineBar({ events, activeId, onSelect }: Props) {
  const { t, lang } = useI18n();
  return (
    <section className="overflow-hidden rounded-3xl border border-[#f2a64a]/30 bg-[linear-gradient(135deg,rgba(16,24,46,0.96),rgba(7,13,28,0.94))] p-3 shadow-2xl backdrop-blur-md" aria-labelledby="timeline-heading">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-[#f2a64a]/30 bg-[#f2a64a]/10 text-[#f2a64a]">
            <LuCalendarDays aria-hidden="true" />
          </span>
          <div>
            <h2 id="timeline-heading" className="text-[11px] tracking-[0.18em] text-[#f2a64a] uppercase">{t.timeline}</h2>
            <p className="text-[11px] text-[#93a6c9]">{events.length} {t.missionEvents.toLowerCase()}</p>
          </div>
        </div>
        <span className="text-[10px] text-[#c5d2ea]">{events[0] ? formatDisplayDate(events[0].date, lang) : ""}</span>
      </div>
      <div className="relative overflow-x-auto pb-2">
        <div className="absolute top-4 right-3 left-3 h-px bg-gradient-to-r from-[#f2a64a]/15 via-[#f2a64a]/70 to-[#6aa4ff]/20" />
        <div className="relative flex min-w-max gap-3 px-1">
        {events.map((event) => {
          const selected = event.objectId === activeId;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event)}
              aria-pressed={selected}
              className={`group min-w-52 shrink-0 rounded-2xl border px-3 pt-8 pb-3 text-left shadow-lg transition duration-300 hover:-translate-y-0.5 hover:border-[#f2a64a]/60 hover:bg-white/10 focus-visible:-translate-y-0.5 ${selected ? "border-[#f2a64a] bg-[#f2a64a]/15 ring-1 ring-[#f2a64a]/35" : "border-white/10 bg-black/25"}`}
            >
              <span className={`absolute top-2 left-4 h-4 w-4 rounded-full border-4 border-[#10182e] transition ${selected ? "bg-[#f2a64a] shadow-[0_0_16px_rgba(242,166,74,0.9)]" : "bg-[#6aa4ff] group-hover:bg-[#f2a64a]"}`} />
              <span className="block text-[11px] tracking-[0.12em] text-[#f2a64a] uppercase">{formatDisplayDate(event.date, lang)}</span>
              <span className="mt-1 block text-sm leading-5 text-[#f4f7ff]">{event.label[lang]}</span>
              <span className="mt-3 flex items-center gap-1 text-[10px] tracking-[0.12em] text-[#c5d2ea] uppercase group-hover:text-[#f2a64a]">
                {selected ? t.viewArtifact : t.explore} <LuChevronRight aria-hidden="true" />
              </span>
            </button>
          );
        })}
        </div>
      </div>
    </section>
  );
}
