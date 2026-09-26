import { motion } from "framer-motion";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { formatCoordinate, yearOf } from "../../lib/coordinates/latLon";
import { missionById } from "../../lib/filtering";
import { formatDisplayDate, recordedSpanDays } from "../../lib/presentation";
import { eventsForMission, eventsForObject, lastContactFor } from "../../lib/story";
import type { Artifact, CatalogImage, Mission, Source, TimelineEvent } from "../../types/catalog";
import type { Lang } from "../../features/localization/strings";

type Props = {
  object: Artifact;
  missions: Mission[];
  sources: Source[];
  mobile: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  onPrevious: (() => void) | null;
  onNext: (() => void) | null;
  nearby?: { id: string; name: string; distance: string }[];
  onNearby?: (id: string) => void;
  events: TimelineEvent[];
  missionOpen: boolean;
  siblings: { id: string; name: string }[];
  hasTraverse: boolean;
  onExploreMission: () => void;
  onLeaveMission: () => void;
  onEvent: (event: TimelineEvent) => void;
  inExpedition: boolean;
  onToggleExpedition: () => void;
};

export function StoryPanel({
  object,
  missions,
  sources,
  mobile,
  reducedMotion,
  onClose,
  onPrevious,
  onNext,
  nearby = [],
  onNearby,
  events,
  missionOpen,
  siblings,
  hasTraverse,
  onExploreMission,
  onLeaveMission,
  onEvent,
  inExpedition,
  onToggleExpedition,
}: Props) {
  const { t, lang } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const mission = missionById(missions, object.missionId);
  const story = object.story[lang];
  const linked = sources.filter((source) => object.sources.includes(source.id) || source.id === object.location.sourceId);
  const [era, setEra] = useState<"then" | "now">("then");
  const [pickedEvent, setPickedEvent] = useState<string | null>(null);
  const record = missionOpen ? eventsForMission(object.missionId, events) : eventsForObject(object.id, events);
  const contact = lastContactFor(object.id, events);
  const activeEvent = record.find((event) => event.id === pickedEvent) ?? null;
  const arrivalYear = yearOf(mission?.arrivalDate);
  const place = object.location.region ?? object.location.locationName;

  useEffect(() => {
    setEra("then");
    setPickedEvent(null);
  }, [object.id]);

  useEffect(() => {
    closeRef.current?.focus();
  }, [object.id]);

  const motionProps = reducedMotion
    ? {}
    : mobile
      ? { initial: { y: 28, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      : { initial: { x: 28, opacity: 0 }, animate: { x: 0, opacity: 1 } };

  return (
    <div className={`pointer-events-none absolute inset-x-0 top-16 bottom-0 z-40 flex p-4 ${mobile ? "items-end pb-2" : "items-center justify-end pb-16"}`}>
    <motion.aside
      {...motionProps}
      key={object.id}
      transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }}
      role="dialog"
      aria-labelledby="story-title"
      className={
        mobile
          ? "pointer-events-auto max-h-[56dvh] w-full overflow-auto rounded-t-3xl border border-white/20 bg-[#070d1c]/72 shadow-2xl backdrop-blur-xl"
          : "pointer-events-auto max-h-[min(68dvh,680px)] w-[min(400px,calc(100%-2rem))] overflow-auto rounded-3xl border border-white/20 bg-[#070d1c]/48 shadow-2xl backdrop-blur-xl"
      }
    >
      <div className="sticky top-0 z-10 flex items-start gap-2 border-b border-white/10 bg-[#070d1c]/45 px-4 py-3 backdrop-blur-md">
        <button type="button" onClick={onPrevious ?? undefined} disabled={!onPrevious} aria-label={t.previousObject} className="rounded-full border border-white/15 p-2 disabled:opacity-30">
          <LuChevronLeft />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] tracking-[0.18em] text-[#f2a64a] uppercase">{t.typeLabels[object.type]}</p>
          <h2 id="story-title" className="font-display text-3xl leading-tight">
            {object.name[lang]}
          </h2>
          <p className="mt-1 text-xs text-[#93a6c9]">
            {place}
            {arrivalYear ? ` · ${arrivalYear.toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { useGrouping: false })}` : ""}
          </p>
        </div>
        <button type="button" onClick={onNext ?? undefined} disabled={!onNext} aria-label={t.nextObject} className="rounded-full border border-white/15 p-2 disabled:opacity-30">
          <LuChevronRight />
        </button>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t.clearSelection} className="rounded-full border border-white/15 p-2">
          <LuX />
        </button>
      </div>
      <div className="space-y-5 px-5 py-4 text-sm leading-6">
        <p className="text-base text-[#f4f7ff]">{object.summary[lang]}</p>
        <section className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
          <h3 className="text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{t.status}</h3>
          <p className="mt-1 text-sm text-[#f4f7ff]">
            <span aria-hidden="true">● </span>
            {t.statusLabels[object.status]}
          </p>
          {mission && <AtAGlance mission={mission} active={object.status === "active"} lang={lang} />}
          {contact && (
            <p className="mt-2 text-xs text-[#93a6c9]">
              {t.lastContact}: {formatDisplayDate(contact.date, lang)}. {contact.description[lang]}
            </p>
          )}
        </section>
        <Disclosure title={t.theStory} open>
          <p>{story.whatIsIt}</p>
        </Disclosure>
        <Disclosure title={t.whatHappened} open>
          <p>{story.whatHappened}</p>
        </Disclosure>
        <section>
          <div className="flex gap-2" role="group" aria-label={`${t.thenEra} / ${t.nowEra}`}>
            <button type="button" aria-pressed={era === "then"} onClick={() => setEra("then")} className={`rounded-full border px-3 py-1 text-xs tracking-[0.14em] uppercase ${era === "then" ? "border-[#f2a64a] text-[#f2a64a]" : "border-white/15 text-[#93a6c9]"}`}>
              {t.thenEra}
            </button>
            <button type="button" aria-pressed={era === "now"} onClick={() => setEra("now")} className={`rounded-full border px-3 py-1 text-xs tracking-[0.14em] uppercase ${era === "now" ? "border-[#6aa4ff] text-[#6aa4ff]" : "border-white/15 text-[#93a6c9]"}`}>
              {t.nowEra}
            </button>
          </div>
          {era === "then" ? (
            <div className="mt-3 space-y-3">
              {object.images.length > 0 ? (
                object.images.map((image) => (
                  <StoryImage key={image.id} image={image} lang={lang} label={t.photograph} source={sources.find((item) => item.id === image.sourceId)} />
                ))
              ) : (
                <p className="text-[#93a6c9]">{t.noMissionImage}</p>
              )}
              {mission && (
                <p className="text-xs text-[#93a6c9]">
                  {mission.agency} · {t.arrived} {mission.arrivalDate ? formatDisplayDate(mission.arrivalDate, lang) : t.unknownDate}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-[#93a6c9]">{t.noCurrentImage}</p>
              <p>
                <span className="text-[#93a6c9]">{t.knownState}. </span>
                {t.statusLabels[object.status]}. {story.whyLeft}
              </p>
            </div>
          )}
        </section>
        <Disclosure title={t.whyLeft} open>
          <p>{story.whyLeft}</p>
        </Disclosure>
        {object.type === "rover" && !hasTraverse && <p className="text-xs text-[#93a6c9]">{t.noTraverse}</p>}
        {mission && (
          <section>
            <h3 className="text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{t.mission}</h3>
            <p className="mt-1 text-[#f4f7ff]">{mission.name[lang]}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={missionOpen ? onLeaveMission : onExploreMission}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs"
              >
                {missionOpen ? t.leaveMission : t.exploreMission}
              </button>
              <button type="button" aria-pressed={inExpedition} onClick={onToggleExpedition} className="rounded-full border border-[#f2a64a]/40 px-3 py-1.5 text-xs text-[#f2a64a]">
                {inExpedition ? t.removeFromExpedition : t.addToExpedition}
              </button>
            </div>
            {inExpedition && <p className="mt-2 text-xs text-[#c5d2ea]">{t.addedToExpedition}</p>}
            {missionOpen && siblings.length > 0 && (
              <ul className="mt-3 space-y-1">
                <li className="text-[11px] tracking-[0.16em] text-[#93a6c9] uppercase">{t.relatedHardware}</li>
                {siblings.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNearby?.(item.id)}
                      aria-current={item.id === object.id ? "true" : undefined}
                      className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${item.id === object.id ? "border-[#6aa4ff] text-[#f4f7ff]" : "border-white/10 text-[#c5d2ea] hover:bg-white/10"}`}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {record.length > 0 && (
          <section>
            <h3 className="text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{t.missionEvents}</h3>
            <ol className="mt-2 space-y-2 border-l border-white/15 pl-3">
              {record.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    aria-pressed={activeEvent?.id === event.id}
                    onClick={() => {
                      setPickedEvent(event.id);
                      onEvent(event);
                    }}
                    className="text-left"
                  >
                    <span className="block text-[11px] text-[#f2a64a]">{formatDisplayDate(event.date, lang)}</span>
                    <span className="block text-sm text-[#f4f7ff]">{event.label[lang]}</span>
                  </button>
                </li>
              ))}
            </ol>
            {activeEvent && <p className="mt-2 text-[#c5d2ea]">{activeEvent.description[lang]}</p>}
          </section>
        )}
        <Disclosure title={t.whyItMatters}>
          <p>{story.whyItMatters}</p>
        </Disclosure>
        {mission && (
          <Disclosure title={t.objectives}>
            <p>{mission.objectives[lang]}</p>
          </Disclosure>
        )}
        <Disclosure title={t.coordinates}>
          <p>{formatCoordinate(object.location.latitude, object.location.longitude)}</p>
          <p className="mt-1 text-xs text-[#93a6c9]">
            {t.precision}: {t.precisionLabels[object.location.precision]} · {object.location.locationName}
            {object.location.region ? ` · ${object.location.region}` : ""}
          </p>
          {mission && (
            <p className="mt-1 text-xs text-[#93a6c9]">
              {t.launch} {mission.launchDate ? formatDisplayDate(mission.launchDate, lang) : t.unknownDate}
              {mission.endDate ? ` · ${t.ended} ${formatDisplayDate(mission.endDate, lang)}` : ""}
            </p>
          )}
        </Disclosure>
        {nearby.length > 0 && (
          <div>
            <h3 className="text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{t.nearbySites}</h3>
            <ul className="mt-2 space-y-1">
              {nearby.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNearby?.(item.id)}
                    className="flex w-full items-baseline justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <span className="text-sm text-[#f4f7ff]">{item.name}</span>
                    <span className="shrink-0 text-xs text-[#93a6c9]">{item.distance}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Disclosure title={t.sources}>
          <ul className="space-y-2">
            {linked.map((source) => (
              <li key={source.id} className="rounded-xl border border-white/10 px-3 py-2">
                <a href={source.url} target="_blank" rel="noreferrer noopener" className="text-[#9ec0ff] underline decoration-white/20 underline-offset-2">
                  {source.title}
                </a>
                <p className="mt-1 text-xs text-[#93a6c9]">
                  {source.publisher} · {source.accessedDate} · {t.externalLink}
                </p>
                {source.notes && <p className="mt-1 text-xs leading-5 text-[#c5d2ea]">{source.notes}</p>}
              </li>
            ))}
          </ul>
        </Disclosure>
      </div>
    </motion.aside>
    </div>
  );
}

function StoryImage({ image, lang, label, source }: { image: CatalogImage; lang: Lang; label: string; source?: Source }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <figure>
      <img
        src={image.url}
        alt={image.alt[lang]}
        onError={() => setFailed(true)}
        className="max-h-64 w-full rounded-2xl bg-black object-contain"
      />
      <figcaption className="mt-2 text-xs leading-5 text-[#93a6c9]">
        {label}. {image.credit}
        {source && (
          <>
            {" "}
            <a href={source.url} target="_blank" rel="noreferrer noopener" className="text-[#9ec0ff] underline decoration-white/20 underline-offset-2">
              {source.title}
            </a>
          </>
        )}
      </figcaption>
    </figure>
  );
}

function AtAGlance({ mission, active, lang }: { mission: Mission; active: boolean; lang: Lang }) {
  const { t } = useI18n();
  const days = recordedSpanDays(mission.arrivalDate, mission.endDate);
  const still = active && !mission.endDate;
  if (!mission.arrivalDate && !still && days === null) return null;
  return (
    <p className="mt-1 text-xs text-[#c5d2ea]">
      <span className="sr-only">{t.atAGlance}. </span>
      <span>
        {still
          ? t.stillOperating
          : days !== null
            ? `${days.toLocaleString(lang === "bn" ? "bn-BD" : "en-GB")} ${t.recordedSpan}`
            : t.unknownDate}
      </span>
    </p>
  );
}

function Disclosure({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.open = open;
  }, [open]);
  return (
    <details ref={ref} className="group">
      <summary className="cursor-pointer list-none text-[11px] tracking-[0.16em] text-[#93a6c9] uppercase [&::-webkit-details-marker]:hidden">
        {title}
      </summary>
      <div className="mt-1 text-[#f4f7ff]">{children}</div>
    </details>
  );
}
