import { useRef, useState } from "react";
import { LuBadgeCheck, LuCalendarDays, LuChevronRight, LuCircleDotDashed, LuRadioTower, LuRocket, LuSatellite } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { formatDisplayDate } from "../../lib/presentation";
import type { PlanetId, TimelineEvent } from "../../types/catalog";

type Signal = "active" | "achievement" | "loss" | "routine";

function classify(event: TimelineEvent): { signal: Signal; milestone: boolean; icon: typeof LuRocket } {
  const words = `${event.label.en} ${event.description.en}`.toLowerCase();
  if (/impact|crash|lost|silent|contact|communication|fail/.test(words)) return { signal: "loss", milestone: true, icon: LuRadioTower };
  if (/active|operate|operational|extension|continues/.test(words)) return { signal: "active", milestone: true, icon: LuSatellite };
  if (/land|arriv|touchdown|deploy|launch|complete|final|first|drive|traverse|record/.test(words)) return { signal: "achievement", milestone: true, icon: /launch/.test(words) ? LuRocket : LuBadgeCheck };
  return { signal: "routine", milestone: false, icon: LuCircleDotDashed };
}

const signalStyle: Record<Signal, { dot: string; card: string; label: string }> = {
  active: { dot: "bg-[#6aa4ff] shadow-[0_0_16px_rgba(106,164,255,0.9)]", card: "border-[#6aa4ff]/40 bg-[#6aa4ff]/10", label: "text-[#9ec0ff]" },
  achievement: { dot: "bg-[#f2a64a] shadow-[0_0_16px_rgba(242,166,74,0.85)]", card: "border-[#f2a64a]/45 bg-[#f2a64a]/10", label: "text-[#f2a64a]" },
  loss: { dot: "bg-[#f07167] shadow-[0_0_16px_rgba(240,113,103,0.8)]", card: "border-[#f07167]/45 bg-[#f07167]/10", label: "text-[#ffaaa2]" },
  routine: { dot: "bg-[#93a6c9]", card: "border-white/15 bg-black/25", label: "text-[#c5d2ea]" },
};

type Props = { planet: PlanetId; events: TimelineEvent[]; activeId: string | null; onSelect: (event: TimelineEvent) => void; onPreview: (event: TimelineEvent | null) => void };

export function TimelineBar({ planet, events, activeId, onSelect, onPreview }: Props) {
  const { t, lang } = useI18n();
  const rail = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<TimelineEvent | null>(null);
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const first = ordered[0];
  const last = ordered.at(-1);
  const previewEvent = (event: TimelineEvent | null) => { setPreview(event); onPreview(event); };
  const scrub = (clientX: number) => {
    const bounds = rail.current?.getBoundingClientRect();
    if (!bounds || ordered.length === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
    previewEvent(ordered[Math.round(ratio * (ordered.length - 1))]);
  };
  const background = planet === "moon"
    ? "bg-[radial-gradient(circle_at_16%_20%,rgba(230,223,204,0.1),transparent_26%),linear-gradient(135deg,rgba(22,29,46,0.98),rgba(7,13,28,0.96))]"
    : "bg-[radial-gradient(circle_at_16%_20%,rgba(224,122,95,0.15),transparent_28%),linear-gradient(135deg,rgba(46,23,29,0.96),rgba(7,13,28,0.97))]";

  return (
    <section className={`overflow-hidden rounded-3xl border border-[#f2a64a]/30 p-3 shadow-2xl backdrop-blur-md ${background}`} aria-labelledby="timeline-heading">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-[#f2a64a]/30 bg-[#f2a64a]/10 text-[#f2a64a]"><LuCalendarDays aria-hidden="true" /></span>
          <div>
            <h2 id="timeline-heading" className="text-[11px] tracking-[0.18em] text-[#f2a64a] uppercase">{t.timeline}</h2>
            <p className="text-[11px] text-[#93a6c9]">{events.length} {t.missionEvents.toLowerCase()}</p>
          </div>
        </div>
        <span className="text-right text-[10px] text-[#c5d2ea]">{first && last ? `${formatDisplayDate(first.date, lang)} — ${formatDisplayDate(last.date, lang)}` : ""}</span>
      </div>
      <div ref={rail} className="relative overflow-x-auto pb-2" onPointerMove={(event) => scrub(event.clientX)} onPointerLeave={() => previewEvent(null)}>
        <div className="absolute top-4 right-3 left-3 h-px bg-gradient-to-r from-[#f2a64a]/20 via-[#f2a64a]/75 to-[#6aa4ff]/35" />
        <div className="relative flex min-w-max items-start gap-3 px-1">
          {ordered.map((event) => {
            const selected = event.objectId === activeId;
            const previewed = event.id === preview?.id;
            const detail = classify(event);
            const style = signalStyle[detail.signal];
            const Icon = detail.icon;
            return <button key={event.id} type="button" onClick={() => onSelect(event)} onFocus={() => previewEvent(event)} onBlur={() => previewEvent(null)} aria-pressed={selected} className={`group relative shrink-0 rounded-2xl border px-3 pt-8 pb-3 text-left shadow-lg transition duration-300 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 ${detail.milestone ? "min-w-56" : "min-w-44"} ${style.card} ${selected ? "ring-1 ring-white/35" : ""} ${previewed ? "-translate-y-1 ring-1 ring-white/30" : ""}`}>
              <span className={`absolute top-2 left-4 h-4 w-4 rounded-full border-4 border-[#10182e] transition ${selected || previewed ? `${style.dot} scale-125` : style.dot}`} />
              <span className={`flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase ${style.label}`}><Icon aria-hidden="true" /> {formatDisplayDate(event.date, lang)}</span>
              <span className="mt-1 block text-sm leading-5 text-[#f4f7ff]">{event.label[lang]}</span>
              <span className={`mt-3 flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase ${style.label}`}>{selected ? t.viewArtifact : t.explore} <LuChevronRight aria-hidden="true" /></span>
            </button>;
          })}
        </div>
      </div>
    </section>
  );
}
