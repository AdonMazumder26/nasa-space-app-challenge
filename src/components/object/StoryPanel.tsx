import { motion } from "framer-motion";
import { LuBox, LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { formatCoordinate, yearOf } from "../../lib/coordinates/latLon";
import { missionById } from "../../lib/filtering";
import { formatDisplayDate, recordedSpanDays } from "../../lib/presentation";
import { eventsForMission, eventsForObject, lastContactFor } from "../../lib/story";
import type { Artifact, CatalogImage, Mission, Source, TimelineEvent } from "../../types/catalog";
import type { Lang } from "../../features/localization/strings";

const statusColor: Record<string, string> = {
  active: "#6aa4ff",
  inactive: "#93a6c9",
  mission_complete: "#f2a64a",
  communication_lost: "#f2a64a",
  destroyed: "#d77979",
  impacted: "#d77979",
  unknown: "#93a6c9",
};

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
  onHear: () => void;
  narrationNote: string | null;
  onOpen3D?: () => void;
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
  onHear,
  narrationNote,
  onOpen3D,
}: Props) {
  const { t, lang } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const mission = missionById(missions, object.missionId);
  const story = object.story[lang];
  const linked = sources.filter((source) => object.sources.includes(source.id) || source.id === object.location.sourceId);
  const [era, setEra] = useState<"then" | "now">("then");
  const [pickedEvent, setPickedEvent] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"peek" | "open">("open");
  const record = missionOpen ? eventsForMission(object.missionId, events) : eventsForObject(object.id, events);
  const contact = lastContactFor(object.id, events);
  const activeEvent = record.find((event) => event.id === pickedEvent) ?? null;
  const arrivalYear = yearOf(mission?.arrivalDate);
  const place = object.location.region ?? object.location.locationName;

  useEffect(() => {
    setEra("then");
    setPickedEvent(null);
    setSheet("open");
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
    <div className={`pointer-events-none absolute inset-x-0 top-16 bottom-0 z-40 flex p-2 sm:p-4 ${mobile ? "items-end pb-2" : "items-center justify-end pb-20"}`}>
      <motion.aside
        {...motionProps}
        key={object.id}
        transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }}
        role="dialog"
        aria-labelledby="story-title"
        className={
          mobile
            ? `pointer-events-auto w-full overflow-auto rounded-t-3xl border border-white/15 bg-[#070d1c]/95 shadow-2xl backdrop-blur-2xl ${sheet === "peek" ? "max-h-[8.5rem]" : "max-h-[min(78dvh,680px)]"}`
            : "pointer-events-auto max-h-[min(68dvh,680px)] w-[min(400px,calc(100%-2rem))] overflow-auto rounded-3xl border border-white/15 bg-[#070d1c]/95 shadow-2xl backdrop-blur-2xl"
        }
      >
        {mobile && (
          <button
            type="button"
            className="mx-auto mt-2 block h-11 w-16 rounded-full text-xs text-[#93a6c9] uppercase"
            aria-expanded={sheet === "open"}
            aria-label={sheet === "open" ? t.collapseStory : t.expandStory}
            onClick={() => setSheet((current) => (current === "open" ? "peek" : "open"))}
          >
            {sheet === "open" ? t.collapseStory : t.expandStory}
          </button>
        )}
        <header className="sticky top-0 z-20 flex items-start gap-2 border-b border-white/15 bg-[#080e1c] bg-gradient-to-b from-[#0e172e] via-[#091224] to-[#080e1c] px-3.5 py-3 shadow-lg shadow-black/60 sm:gap-2.5 sm:px-4 sm:py-3.5">
          <button
            type="button"
            onClick={onPrevious ?? undefined}
            disabled={!onPrevious}
            aria-label={t.previousObject}
            title={t.previousObject}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-[#f4f7ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:border-[#6aa4ff]/60 hover:bg-[#6aa4ff]/15 hover:text-[#6aa4ff] active:scale-95 disabled:opacity-20 disabled:hover:border-white/15 disabled:hover:bg-white/5 disabled:hover:text-[#f4f7ff]"
          >
            <LuChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f2a64a] shadow-[0_0_8px_#f2a64a]" />
              <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-[#f2a64a] uppercase">
                {t.typeLabels[object.type]}
              </p>
            </div>
            <h2 id="story-title" className="font-display text-2xl font-semibold leading-tight text-[#f4f7ff] sm:text-3xl">
              {object.name[lang]}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
              {place && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-[#c5d2ea]">
                  {place}
                </span>
              )}
              {arrivalYear && (
                <span className="rounded-full border border-[#6aa4ff]/30 bg-[#6aa4ff]/10 px-2.5 py-0.5 font-mono text-xs text-[#6aa4ff]">
                  {arrivalYear.toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { useGrouping: false })}
                </span>
              )}
              {onOpen3D && (
                <button
                  type="button"
                  onClick={onOpen3D}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#6aa4ff]/40 bg-[#6aa4ff]/15 px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-wider text-[#6aa4ff] shadow-sm transition hover:border-[#6aa4ff] hover:bg-[#6aa4ff]/25 active:scale-95"
                  title={t.modelGallery}
                >
                  <LuBox className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>3D MODEL</span>
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onNext ?? undefined}
            disabled={!onNext}
            aria-label={t.nextObject}
            title={t.nextObject}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-[#f4f7ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:border-[#6aa4ff]/60 hover:bg-[#6aa4ff]/15 hover:text-[#6aa4ff] active:scale-95 disabled:opacity-20 disabled:hover:border-white/15 disabled:hover:bg-white/5 disabled:hover:text-[#f4f7ff]"
          >
            <LuChevronRight className="h-5 w-5" />
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.clearSelection}
            title={t.clearSelection}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-[#f4f7ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:border-[#f07167]/60 hover:bg-[#f07167]/15 hover:text-[#f07167] active:scale-95"
          >
            <LuX className="h-5 w-5" />
          </button>
        </header>
        <div className={`space-y-5 px-4 py-4 text-sm leading-6 sm:px-5 ${mobile && sheet === "peek" ? "hidden" : ""}`}>
          <p className="text-base text-[#f4f7ff]">{object.summary[lang]}</p>
          <button type="button" onClick={onHear} className="min-h-11 rounded-full border border-[#f2a64a]/50 px-4 text-xs tracking-[0.12em] text-[#f2a64a] uppercase">
            {t.hearSite}
          </button>
          {narrationNote && <p className="text-xs text-[#93a6c9]">{narrationNote}</p>}
          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <span className="text-[#93a6c9]">{t.status}: </span>
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusColor[object.status] ?? "#93a6c9" }} /> {t.statusLabels[object.status]}
            </div>
            {contact && (
              <div>
                <span className="text-[#93a6c9]">{t.lastContact}: </span>
                <span>{formatDisplayDate(contact.date, lang)}</span>
              </div>
            )}
          </div>
          {contact?.description[lang] && <p className="text-xs text-[#93a6c9]">{contact.description[lang]}</p>}
          {mission && <AtAGlance mission={mission} active={object.status === "active"} lang={lang} />}
          <Disclosure title={t.theStory} open>
            <p>{story.whatIsIt}</p>
          </Disclosure>
          <Disclosure title={t.whatHappened} open>
            <p>{story.whatHappened}</p>
          </Disclosure>
          <div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={era === "then"}
                onClick={() => setEra("then")}
                className={`rounded-full border px-3 py-1 text-xs ${era === "then" ? "border-[#f2a64a] text-[#f2a64a]" : "border-white/15 text-[#93a6c9]"}`}
              >
                {t.thenEra}
              </button>
              <button
                type="button"
                aria-pressed={era === "now"}
                onClick={() => setEra("now")}
                className={`rounded-full border px-3 py-1 text-xs ${era === "now" ? "border-[#6aa4ff] text-[#6aa4ff]" : "border-white/15 text-[#93a6c9]"}`}
              >
                {t.nowEra}
              </button>
            </div>
            {era === "then" ? (
              <div className="mt-2 space-y-2">
                {object.images.length > 0 ? (
                  object.images.map((image) => (
                    <StoryImage key={image.id} image={image} lang={lang} label={t.photograph} source={sources.find((item) => item.id === image.sourceId)} />
                  ))
                ) : (
                  <p className="text-xs text-[#93a6c9]">{t.noMissionImage}</p>
                )}
                {mission && (
                  <p className="text-xs text-[#93a6c9]">
                    {mission.agency} · {t.arrived} {mission.arrivalDate ? formatDisplayDate(mission.arrivalDate, lang) : t.unknownDate}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-[#93a6c9]">{t.noCurrentImage}</p>
                <p>
                  <span className="text-[#93a6c9]">{t.knownState}: </span>
                  {t.statusLabels[object.status]}. {story.whyLeft}
                </p>
              </div>
            )}
          </div>
          <Disclosure title={t.whyLeft} open>
            <p>{story.whyLeft}</p>
          </Disclosure>
          {object.type === "rover" && !hasTraverse && <p className="text-xs text-[#93a6c9]">{t.noTraverse}</p>}
          {mission && (
            <div>
              <h3 className="text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{t.mission}</h3>
              <p className="font-semibold text-[#f4f7ff]">{mission.name[lang]}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={missionOpen ? onLeaveMission : onExploreMission}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs text-[#f4f7ff] hover:border-[#6aa4ff]"
                >
                  {missionOpen ? t.leaveMission : t.exploreMission}
                </button>
              </div>
              {missionOpen && siblings.length > 0 && (
                <ul className="mt-3 space-y-1">
                  <li className="text-[11px] tracking-[0.16em] text-[#93a6c9] uppercase">{t.relatedHardware}</li>
                  {siblings.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onNearby?.(item.id)}
                        className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${item.id === object.id ? "border-[#6aa4ff] bg-[#6aa4ff]/10 text-[#f4f7ff]" : "border-white/10 text-[#c5d2ea] hover:bg-white/10"}`}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {record.length > 0 && (
            <div>
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
            </div>
          )}
          <Disclosure title={t.whyItMatters}>
            <p>{object.significance[lang]}</p>
            {story.whyItMatters !== object.significance[lang] && <p className="mt-2 text-[#c5d2ea]">{story.whyItMatters}</p>}
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
