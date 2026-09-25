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
    <div className="rounded-3xl border border-white/10 bg-[#090b10]/78 p-3 shadow-2xl backdrop-blur-md">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-[11px] tracking-[0.18em] text-[#b7b0a4] uppercase">{t.timeline}</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {events.map((event) => {
          const selected = event.objectId === activeId;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event)}
              aria-pressed={selected}
              className={`min-w-44 shrink-0 rounded-2xl border px-3 py-2 text-left ${selected ? "border-[#e39a62] bg-[#e39a62]/15" : "border-white/10 bg-black/20"}`}
            >
              <span className="block text-[11px] text-[#e39a62]">{formatDisplayDate(event.date, lang)}</span>
              <span className="mt-1 block text-sm leading-5">{event.label[lang]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
