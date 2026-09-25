import { motion } from "framer-motion";
import { LuX } from "react-icons/lu";
import { useEffect, useRef } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { formatCoordinate } from "../../lib/coordinates/latLon";
import { missionById } from "../../lib/filtering";
import { formatDisplayDate } from "../../lib/presentation";
import type { Artifact, Mission, Source } from "../../types/catalog";

type Props = {
  object: Artifact;
  missions: Mission[];
  sources: Source[];
  mobile: boolean;
  reducedMotion: boolean;
  onClose: () => void;
};

export function StoryPanel({ object, missions, sources, mobile, reducedMotion, onClose }: Props) {
  const { t, lang } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const mission = missionById(missions, object.missionId);
  const story = object.story[lang];
  const linked = sources.filter((source) => object.sources.includes(source.id) || source.id === object.location.sourceId);

  useEffect(() => {
    closeRef.current?.focus();
  }, [object.id]);

  const motionProps = reducedMotion
    ? {}
    : mobile
      ? { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      : { initial: { x: 28, opacity: 0 }, animate: { x: 0, opacity: 1 } };

  return (
    <motion.aside
      {...motionProps}
      transition={{ duration: reducedMotion ? 0 : 0.32, ease: "easeOut" }}
      role="dialog"
      aria-labelledby="story-title"
      className={
        mobile
          ? "fixed inset-x-0 bottom-0 z-40 max-h-[78dvh] overflow-auto rounded-t-3xl border border-white/10 bg-[#10131a] shadow-2xl"
          : "absolute top-20 right-3 bottom-4 z-30 w-[min(400px,calc(100%-1.5rem))] overflow-auto rounded-3xl border border-white/10 bg-[#090b10]/82 shadow-2xl backdrop-blur-md"
      }
    >
      <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-white/10 bg-[#10131a]/95 px-5 py-4 backdrop-blur">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-[#e39a62] uppercase">{t.typeLabels[object.type]}</p>
          <h2 id="story-title" className="font-display text-3xl leading-tight">
            {object.name[lang]}
          </h2>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t.clearSelection} className="rounded-full border border-white/15 p-2">
          <LuX />
        </button>
      </div>
      <div className="space-y-5 px-5 py-4 text-sm leading-6">
        <p className="text-base text-[#f3efe6]">{object.summary[lang]}</p>
        <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs">
          <div>
            <dt className="text-[#b7b0a4]">{t.coordinates}</dt>
            <dd className="mt-1 text-sm">{formatCoordinate(object.location.latitude, object.location.longitude)}</dd>
          </div>
          <div>
            <dt className="text-[#b7b0a4]">{t.precision}</dt>
            <dd className="mt-1 text-sm">{t.precisionLabels[object.location.precision]}</dd>
          </div>
          <div>
            <dt className="text-[#b7b0a4]">{t.location}</dt>
            <dd className="mt-1 text-sm">{object.location.locationName}</dd>
          </div>
          <div>
            <dt className="text-[#b7b0a4]">{t.region}</dt>
            <dd className="mt-1 text-sm">{object.location.region ?? t.unknownDate}</dd>
          </div>
          <div>
            <dt className="text-[#b7b0a4]">{t.status}</dt>
            <dd className="mt-1 text-sm">{t.statusLabels[object.status]}</dd>
          </div>
          <div>
            <dt className="text-[#b7b0a4]">{t.mission}</dt>
            <dd className="mt-1 text-sm">{mission?.name[lang]}</dd>
          </div>
        </dl>
        {mission && (
          <p className="text-xs text-[#b7b0a4]">
            {mission.agency} · {t.launch} {mission.launchDate ? formatDisplayDate(mission.launchDate, lang) : t.unknownDate}
            {" · "}
            {t.arrived} {mission.arrivalDate ? formatDisplayDate(mission.arrivalDate, lang) : t.unknownDate}
            {mission.endDate ? ` · ${t.ended} ${formatDisplayDate(mission.endDate, lang)}` : ""}
          </p>
        )}
        <Section title={t.whatIsIt} body={story.whatIsIt} />
        <Section title={t.whatHappened} body={story.whatHappened} />
        <Section title={t.whyLeft} body={story.whyLeft} />
        <Section title={t.whyItMatters} body={story.whyItMatters} />
        {mission && <Section title={t.objectives} body={mission.objectives[lang]} />}
        <div>
          <h3 className="text-[11px] tracking-[0.16em] text-[#b7b0a4] uppercase">{t.sources}</h3>
          <ul className="mt-2 space-y-2">
            {linked.map((source) => (
              <li key={source.id} className="rounded-xl border border-white/10 px-3 py-2">
                <a href={source.url} target="_blank" rel="noreferrer noopener" className="text-[#e7d3b0] underline decoration-white/20 underline-offset-2">
                  {source.title}
                </a>
                <p className="mt-1 text-xs text-[#b7b0a4]">
                  {source.publisher} · {source.accessedDate} · {t.externalLink}
                </p>
                {source.notes && <p className="mt-1 text-xs leading-5 text-[#d9d2c6]">{source.notes}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.aside>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h3 className="text-[11px] tracking-[0.16em] text-[#b7b0a4] uppercase">{title}</h3>
      <p className="mt-1 text-[#f3efe6]">{body}</p>
    </section>
  );
}
