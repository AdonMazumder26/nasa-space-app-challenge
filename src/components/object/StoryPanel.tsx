import { motion } from "framer-motion";
import { LuArrowRight, LuBookOpen, LuBookOpenCheck, LuBox, LuChevronLeft, LuChevronRight, LuVolume2, LuX } from "react-icons/lu";
import { forwardRef, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { fillCopy, type Lang } from "../../features/localization/strings";
import { coordinateParts, yearOf } from "../../lib/coordinates/latLon";
import { missionById } from "../../lib/filtering";
import { formatDisplayDate, recordedSpanDays } from "../../lib/presentation";
import { CHAPTER_IDS, endingFor, eventsForMission, eventsForObject, yearsSince, type ChapterId, type Ending } from "../../lib/story";
import type { ArtifactModel } from "../../data/artifactModels";
import { RelicTurntable } from "../relics/RelicTurntable";
import type { Artifact, CatalogImage, EventKind, Mission, Source, TimelineEvent } from "../../types/catalog";

const statusColor: Record<string, string> = {
  active: "var(--color-present)",
  inactive: "#93a6c9",
  mission_complete: "var(--color-history)",
  communication_lost: "var(--color-loss)",
  destroyed: "var(--color-loss)",
  impacted: "var(--color-loss)",
  unknown: "#93a6c9",
};

const kindColor: Record<EventKind, string> = {
  arrival: "var(--color-history)",
  loss: "var(--color-loss)",
  found: "var(--color-present)",
  retired: "var(--color-history)",
  milestone: "#c5d2ea",
};

const numerals = ["I", "II", "III", "IV", "V", "VI"];

type Props = {
  object: Artifact;
  missions: Mission[];
  sources: Source[];
  mobile: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  onPrevious: (() => void) | null;
  onNext: (() => void) | null;
  previousName?: string | null;
  nextName?: string | null;
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
  relics?: ArtifactModel[];
  onOpenRelic?: (model: ArtifactModel) => void;
  reading?: boolean;
  onToggleReading?: () => void;
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
  previousName = null,
  nextName = null,
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
  relics = [],
  onOpenRelic,
  reading = false,
  onToggleReading,
}: Props) {
  const { t, lang } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mission = missionById(missions, object.missionId);
  const story = object.story[lang];
  const linked = sources.filter((source) => object.sources.includes(source.id) || source.id === object.location.sourceId);
  const [pickedEvent, setPickedEvent] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"peek" | "open">("open");
  const [chapter, setChapter] = useState<ChapterId>("what");
  const [scrolled, setScrolled] = useState(false);
  const record = missionOpen ? eventsForMission(object.missionId, events) : eventsForObject(object.id, events);
  const ending = useMemo(() => endingFor(object, mission, events), [object, mission, events]);
  const activeEvent = record.find((event) => event.id === pickedEvent) ?? null;
  const arrivalYear = yearOf(mission?.arrivalDate);
  const place = object.location.region ?? object.location.locationName;
  const hero = object.images[0] ?? null;
  const locale = lang === "bn" ? "bn-BD" : "en-GB";

  useEffect(() => {
    setPickedEvent(null);
    setSheet("open");
    setChapter("what");
    setScrolled(false);
    scrollRef.current?.scrollTo({ top: 0 });
    closeRef.current?.focus();
  }, [object.id]);

  // Scrollspy for the chapter rail.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const sections = CHAPTER_IDS.map((id) => root.querySelector<HTMLElement>(`[data-chapter="${id}"]`)).filter((node): node is HTMLElement => Boolean(node));
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0]?.target.getAttribute("data-chapter") as ChapterId | undefined;
        if (first) setChapter(first);
      },
      { root, rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [object.id, mobile, sheet]);

  const jumpTo = (id: ChapterId) => {
    const target = scrollRef.current?.querySelector<HTMLElement>(`[data-chapter="${id}"]`);
    target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const motionProps = reducedMotion
    ? {}
    : mobile
      ? { initial: { y: 28, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      : { initial: { x: 28, opacity: 0 }, animate: { x: 0, opacity: 1 } };

  const asideClass = mobile
    ? `pointer-events-auto flex w-full flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#070d1c]/96 shadow-2xl backdrop-blur-2xl transition-[max-height] duration-300 ${sheet === "peek" ? "max-h-[7.5rem]" : "max-h-[min(84dvh,760px)]"}`
    : `pointer-events-auto flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#070d1c]/96 shadow-2xl backdrop-blur-2xl transition-[width,max-height] duration-500 ease-out ${reading ? "max-h-[calc(100dvh-5.5rem)] w-[min(640px,calc(100%-2rem))]" : "max-h-[min(74dvh,760px)] w-[min(440px,calc(100%-2rem))]"}`;

  return (
    <div className={`pointer-events-none absolute inset-x-0 top-16 bottom-0 z-40 flex p-2 sm:p-4 ${mobile ? "items-end pb-2" : reading ? "items-start justify-center pb-4" : "items-center justify-end pb-20"}`}>
      <motion.aside {...motionProps} key={object.id} transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }} role="dialog" aria-labelledby="story-title" className={asideClass}>
        {mobile && (
          <button
            type="button"
            className="mx-auto mt-2 flex h-8 w-24 shrink-0 items-center justify-center text-[10px] tracking-[0.16em] text-[#93a6c9] uppercase"
            aria-expanded={sheet === "open"}
            aria-label={sheet === "open" ? t.collapseStory : t.expandStory}
            onClick={() => setSheet((current) => (current === "open" ? "peek" : "open"))}
          >
            <span className="block h-1 w-12 rounded-full bg-white/25" />
          </button>
        )}

        <header className="relative z-20 flex shrink-0 items-center gap-1.5 border-b border-white/10 bg-[#080e1c]/90 px-2.5 py-2 sm:px-3">
          <div className="flex items-center gap-1">
            <HeaderButton onClick={onPrevious ?? undefined} disabled={!onPrevious} label={t.previousObject}>
              <LuChevronLeft className="h-5 w-5" />
            </HeaderButton>
            <HeaderButton onClick={onNext ?? undefined} disabled={!onNext} label={t.nextObject}>
              <LuChevronRight className="h-5 w-5" />
            </HeaderButton>
          </div>
          <div className="min-w-0 flex-1 px-1">
            <p className={`truncate font-display text-base font-semibold text-[#f4f7ff] transition-opacity duration-300 ${scrolled || (mobile && sheet === "peek") ? "opacity-100" : "opacity-0"}`} aria-hidden={!scrolled}>
              {object.name[lang]}
            </p>
          </div>
          {onToggleReading && !mobile && (
            <HeaderButton onClick={onToggleReading} label={reading ? t.exitReading : t.readingMode} pressed={reading}>
              {reading ? <LuBookOpenCheck className="h-5 w-5" /> : <LuBookOpen className="h-5 w-5" />}
            </HeaderButton>
          )}
          <HeaderButton ref={closeRef} onClick={onClose} label={t.clearSelection} tone="danger">
            <LuX className="h-5 w-5" />
          </HeaderButton>
        </header>

        <div
          ref={scrollRef}
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 180)}
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${mobile && sheet === "peek" ? "hidden" : ""}`}
        >
          <Hero image={hero} lang={lang} />

          <div className={`px-5 pb-6 sm:px-6 ${hero ? "-mt-10" : "pt-5"} relative`}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-history shadow-[0_0_8px_var(--color-history)]" />
              <p className="story-kicker text-history">{t.typeLabels[object.type]}</p>
            </div>
            <h2 id="story-title" className={`font-display font-semibold leading-[1.05] tracking-tight text-[#f4f7ff] ${reading ? "text-4xl sm:text-5xl" : "text-3xl sm:text-[2.1rem]"}`}>
              {object.name[lang]}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {place && <Chip>{place}</Chip>}
              {arrivalYear && <Chip tone="present">{arrivalYear.toLocaleString(locale, { useGrouping: false })}</Chip>}
              {mission && <Chip>{mission.agency}</Chip>}
              {relics.length > 0 && onOpenRelic && (
                <button type="button" onClick={() => jumpTo("remains")} className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-present/40 bg-present/15 px-2.5 text-[11px] font-medium tracking-wider text-present transition hover:border-present hover:bg-present/25 active:scale-95" title={t.seeIn3D}>
                  <LuBox className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>3D</span>
                </button>
              )}
            </div>

            <p className="story-opening mt-5">{object.summary[lang]}</p>

            <nav aria-label={t.chapterNav} className="sticky top-0 z-10 -mx-5 mt-6 mb-2 bg-gradient-to-b from-[#070d1c] via-[#070d1c]/95 to-transparent px-5 pt-2 pb-4 sm:-mx-6 sm:px-6">
              <ol className="no-scrollbar flex gap-1 overflow-x-auto">
                {CHAPTER_IDS.map((id, index) => {
                  const active = chapter === id;
                  return (
                    <li key={id} className="shrink-0">
                      <button type="button" aria-current={active ? "step" : undefined} onClick={() => jumpTo(id)} className={`flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] transition ${active ? "border-history/60 bg-history/15 text-[#f4f7ff]" : "border-white/10 text-[#93a6c9] hover:border-white/25 hover:text-[#c5d2ea]"}`}>
                        <span className={`font-mono text-[10px] ${active ? "text-history" : "text-[#6b7a99]"}`}>{numerals[index]}</span>
                        <span className="whitespace-nowrap">{t.chapters[id]}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <Chapter id="what" index={0} title={t.chapters.what}>
              <div className={`story-prose ${story.whatIsIt.length > 110 ? "story-dropcap" : ""}`}>
                <p>{story.whatIsIt}</p>
              </div>
            </Chapter>

            <Chapter id="happened" index={1} title={t.chapters.happened}>
              <div className="story-prose">
                <p>{story.whatHappened}</p>
              </div>
              {record.length > 0 && (
                <ol className="mt-5 space-y-1 border-l border-white/10 pl-4">
                  {record.map((event) => {
                    const picked = activeEvent?.id === event.id;
                    return (
                      <li key={event.id} className="relative">
                        <span className="absolute top-[0.85rem] -left-[1.33rem] h-2.5 w-2.5 rounded-full border-2 border-[#070d1c]" style={{ backgroundColor: kindColor[event.kind] }} />
                        <button
                          type="button"
                          aria-pressed={picked}
                          onClick={() => {
                            setPickedEvent((current) => (current === event.id ? null : event.id));
                            if (event.objectId !== object.id) onEvent(event);
                          }}
                          className={`w-full rounded-xl px-2 py-1.5 text-left transition hover:bg-white/5 ${picked ? "bg-white/5" : ""}`}
                        >
                          <span className="block font-mono text-[11px] tracking-wide" style={{ color: kindColor[event.kind] }}>{formatDisplayDate(event.date, lang)}</span>
                          <span className="block text-sm text-[#f4f7ff]">{event.label[lang]}</span>
                          {picked && <span className="mt-1 block text-sm leading-6 text-[#c5d2ea]">{event.description[lang]}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Chapter>

            <Chapter id="signal" index={2} title={t.chapters.signal}>
              <TransmissionCard ending={ending} object={object} mission={mission} lang={lang} />
            </Chapter>

            <Chapter id="stayed" index={3} title={t.chapters.stayed}>
              <div className="story-prose">
                <p>{story.whyLeft}</p>
              </div>
              {object.type === "rover" && !hasTraverse && <p className="mt-3 text-xs leading-5 text-[#93a6c9]">{t.noTraverse}</p>}
            </Chapter>

            <Chapter id="remains" index={4} title={t.chapters.remains}>
              {relics.length > 0 && onOpenRelic && <RelicCard relics={relics} lang={lang} mobile={mobile} reducedMotion={reducedMotion} onOpen={onOpenRelic} />}
              <ThenNow object={object} mission={mission} ending={ending} sources={sources} lang={lang} />
            </Chapter>

            <Chapter id="matters" index={5} title={t.chapters.matters}>
              <div className="story-prose">
                <p>{object.significance[lang]}</p>
                {story.whyItMatters !== object.significance[lang] && <p>{story.whyItMatters}</p>}
              </div>
            </Chapter>

            <div className="mt-10 space-y-5 border-t border-white/10 pt-6">
              {mission && (
                <section>
                  <p className="story-kicker text-[#93a6c9]">{t.openMission}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-lg text-[#f4f7ff]">{mission.name[lang]}</p>
                    <button type="button" onClick={missionOpen ? onLeaveMission : onExploreMission} className="min-h-9 rounded-full border border-white/20 px-3 text-xs text-[#f4f7ff] transition hover:border-present">
                      {missionOpen ? t.leaveMission : t.exploreMission}
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#c5d2ea]">{mission.description[lang]}</p>
                  {missionOpen && siblings.length > 1 && (
                    <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {siblings.map((item) => (
                        <li key={item.id}>
                          <button type="button" onClick={() => onNearby?.(item.id)} disabled={item.id === object.id} className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${item.id === object.id ? "border-present bg-present/10 text-[#f4f7ff]" : "border-white/10 text-[#c5d2ea] hover:bg-white/10"}`}>
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {nearby.length > 0 && (
                <section>
                  <p className="story-kicker text-[#93a6c9]">{t.nearbySites}</p>
                  <ul className="mt-2 space-y-1">
                    {nearby.map((item) => (
                      <li key={item.id}>
                        <button type="button" onClick={() => onNearby?.(item.id)} className="flex w-full items-baseline justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-left transition hover:bg-white/10">
                          <span className="text-sm text-[#f4f7ff]">{item.name}</span>
                          <span className="shrink-0 font-mono text-xs text-[#93a6c9]">{item.distance}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <RecordPlate object={object} mission={mission} lang={lang} />

              <Disclosure title={t.sources} count={linked.length}>
                <ol className="divide-y divide-white/8">
                  {linked.map((source, index) => (
                    <li key={source.id} className="grid grid-cols-[1.6rem_1fr] gap-x-2 py-3 first:pt-1 last:pb-1">
                      <span className="font-mono text-[11px] leading-6 text-history">{String(index + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <a href={source.url} target="_blank" rel="noreferrer noopener" className="font-display text-[15px] leading-6 text-[#f4f7ff] underline decoration-history/40 underline-offset-4 transition hover:decoration-history">
                          {source.title}
                        </a>
                        <p className="mt-1 font-mono text-[11px] tracking-wide text-[#93a6c9]">
                          {source.publisher} · {source.accessedDate}
                        </p>
                        {source.notes && <p className="mt-1.5 text-xs leading-5 text-[#c5d2ea]">{source.notes}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-[11px] text-[#6b7a99]">{t.externalLink}</p>
              </Disclosure>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-[1fr_2fr]">
              <button type="button" onClick={onPrevious ?? undefined} disabled={!onPrevious} className="group flex min-h-14 items-center gap-2 rounded-2xl border border-white/10 px-4 text-left transition hover:border-white/30 disabled:opacity-30">
                <LuChevronLeft className="h-4 w-4 shrink-0 text-[#93a6c9]" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="story-kicker block text-[#93a6c9]">{t.previousInStory}</span>
                  <span className="block truncate text-sm text-[#f4f7ff]">{previousName ?? "—"}</span>
                </span>
              </button>
              <button type="button" onClick={onNext ?? undefined} disabled={!onNext} className="group flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-history/50 bg-history/10 px-4 text-left transition hover:bg-history/20 disabled:border-white/10 disabled:bg-transparent disabled:opacity-40">
                <span className="min-w-0">
                  <span className="story-kicker block text-history">{onNext ? t.nextInStory : t.endOfSequence}</span>
                  <span className="block truncate font-display text-lg text-[#f4f7ff]">{nextName ?? "—"}</span>
                </span>
                {onNext && <LuArrowRight className="h-5 w-5 shrink-0 text-history transition group-hover:translate-x-0.5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        <div className={`shrink-0 border-t border-white/10 bg-[#080e1c]/90 px-3 py-2 ${mobile && sheet === "peek" ? "hidden" : ""}`}>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onHear} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-history/50 px-4 text-xs tracking-[0.12em] text-history uppercase transition hover:bg-history/10">
              <LuVolume2 className="h-4 w-4" aria-hidden="true" />
              {t.hearSite}
            </button>
            <p className="min-w-0 flex-1 truncate text-xs text-[#93a6c9]">{narrationNote ?? t.listenToStory}</p>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

function Hero({ image, lang }: { image: CatalogImage | null; lang: Lang }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image?.id]);
  if (!image || failed) return null;
  return (
    <figure className="story-hero-mask relative m-0">
      <img src={image.url} alt={image.alt[lang]} onError={() => setFailed(true)} className="h-52 w-full object-cover sm:h-60" />
      <figcaption className="absolute right-3 bottom-12 left-5 truncate text-right text-[10px] text-[#93a6c9]/80 sm:left-6">{image.credit}</figcaption>
    </figure>
  );
}

function Chapter({ id, index, title, children }: { id: ChapterId; index: number; title: string; children: ReactNode }) {
  return (
    <section data-chapter={id} className="scroll-mt-16 pt-6 first-of-type:pt-2">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-mono text-xs text-history">{numerals[index]}</span>
        <h3 className="story-chapter-title">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function TransmissionCard({ ending, object, mission, lang }: { ending: Ending; object: Artifact; mission: Mission | undefined; lang: Lang }) {
  const { t } = useI18n();
  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  const years = (iso: string | null | undefined) => yearsSince(iso);
  const fmtYears = (value: number | null, template: string, under: string) => (value === null ? null : value < 1 ? under : fillCopy(template, { years: value.toLocaleString(locale) }));

  let kicker = t.recordedStatus;
  let tone = "var(--color-history)";
  let date: string | null = null;
  let headline = t.statusLabels[object.status];
  let body: string | null = null;
  let badge: string | null = null;

  switch (ending.kind) {
    case "silence":
      kicker = t.finalTransmission;
      tone = "var(--color-loss)";
      date = ending.date;
      headline = ending.event.label[lang];
      body = ending.event.description[lang];
      badge = fmtYears(years(ending.date), t.silentFor, t.silentUnderYear);
      break;
    case "retired":
      kicker = t.plannedEnd;
      date = ending.date;
      headline = ending.event?.label[lang] ?? t.statusLabels[object.status];
      body = ending.event?.description[lang] ?? null;
      badge = fmtYears(years(ending.date), t.silentFor, t.silentUnderYear);
      break;
    case "impact":
      kicker = t.hardLanding;
      tone = "var(--color-loss)";
      date = ending.date;
      headline = t.statusLabels[object.status];
      body = object.story[lang].whatHappened;
      break;
    case "active":
      kicker = t.stillTransmitting;
      tone = "var(--color-present)";
      date = mission?.arrivalDate ?? null;
      headline = t.statusLabels.active;
      body = t.notLive;
      badge = fmtYears(years(mission?.arrivalDate), t.activeSince, t.stillTransmitting);
      break;
    case "complete":
      date = ending.date;
      headline = t.statusLabels[object.status];
      body = mission?.endDate ? null : t.noEndingRecorded;
      badge = fmtYears(years(mission?.arrivalDate), t.surfaceStay, t.surfaceStay);
      break;
    default:
      body = t.noEndingRecorded;
  }

  return (
    <div className="transmission-card rounded-2xl border p-4 sm:p-5" style={{ borderColor: `color-mix(in srgb, ${tone} 45%, transparent)` }}>
      <div className="flex items-center justify-between gap-3">
        <p className="story-kicker" style={{ color: tone }}>{kicker}</p>
        {badge && (
          <span className="rounded-full border px-2.5 py-0.5 text-[11px] whitespace-nowrap" style={{ borderColor: `color-mix(in srgb, ${tone} 50%, transparent)`, color: tone }}>
            {badge}
          </span>
        )}
      </div>
      {date && <p className="mt-3 font-mono text-2xl tracking-tight text-[#f4f7ff] sm:text-3xl">{formatDisplayDate(date, lang)}</p>}
      <div className="transmission-dashes my-3" style={{ backgroundImage: `linear-gradient(90deg, ${tone} 0 8px, transparent 8px 14px)`, opacity: 0.6 }} />
      <p className="font-display text-lg leading-snug text-[#f4f7ff]">{headline}</p>
      {body && <p className="mt-2 text-sm leading-6 text-[#c5d2ea]">{body}</p>}
    </div>
  );
}

function ThenNow({ object, mission, ending, sources, lang }: { object: Artifact; mission: Mission | undefined; ending: Ending; sources: Source[]; lang: Lang }) {
  const { t } = useI18n();
  const thenImage = object.images[1] ?? object.images[0] ?? null;
  const source = thenImage ? sources.find((item) => item.id === thenImage.sourceId) : undefined;
  const endDate = ending.kind === "silence" || ending.kind === "retired" || ending.kind === "impact" || ending.kind === "complete" ? ending.date : null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-history/30 bg-history/5 p-3">
        <p className="story-kicker text-history">{t.thenCaption}</p>
        {thenImage ? (
          <figure className="mt-2 m-0">
            <img src={thenImage.url} alt={thenImage.alt[lang]} className="h-32 w-full rounded-xl bg-black object-cover" />
            <figcaption className="mt-1.5 text-[11px] leading-4 text-[#93a6c9]">
              {thenImage.credit}
              {source && (
                <>
                  {" · "}
                  <a href={source.url} target="_blank" rel="noreferrer noopener" className="text-[#9ec0ff] underline decoration-white/20 underline-offset-2">
                    {source.title}
                  </a>
                </>
              )}
            </figcaption>
          </figure>
        ) : (
          <p className="mt-2 text-xs leading-5 text-[#93a6c9]">{t.noMissionImage}</p>
        )}
        {mission?.arrivalDate && (
          <p className="mt-2 text-sm text-[#f4f7ff]">
            {t.arrived} {formatDisplayDate(mission.arrivalDate, lang)}
          </p>
        )}
      </div>
      <div className="rounded-2xl border border-present/30 bg-present/5 p-3">
        <p className="story-kicker text-present">{t.nowCaption}</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-[#f4f7ff]">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColor[object.status] }} />
          {t.statusLabels[object.status]}
        </p>
        {endDate && (
          <p className="mt-1 text-sm text-[#c5d2ea]">
            {ending.kind === "silence" ? t.lastContact : t.ended} {formatDisplayDate(endDate, lang)}
          </p>
        )}
        <p className="mt-2 text-sm leading-6 text-[#c5d2ea]">{object.story[lang].whyLeft}</p>
        <p className="mt-3 text-[11px] leading-4 text-[#93a6c9]">{t.noCurrentImage}</p>
      </div>
    </div>
  );
}

function RelicCard({ relics, lang, mobile, reducedMotion, onOpen }: { relics: ArtifactModel[]; lang: Lang; mobile: boolean; reducedMotion: boolean; onOpen: (model: ArtifactModel) => void }) {
  const { t } = useI18n();
  const lead = relics[0];
  const count = relics.length;
  const countLabel = count === 1 ? t.scannedPiece : fillCopy(t.scannedPieces, { count: count.toLocaleString(lang === "bn" ? "bn-BD" : "en-GB") });
  return (
    <button type="button" onClick={() => onOpen(lead)} className="group relative mb-4 flex w-full items-stretch overflow-hidden rounded-2xl border border-present/35 bg-[radial-gradient(circle_at_80%_30%,rgba(106,164,255,0.18),transparent_55%),linear-gradient(135deg,rgba(16,24,46,0.9),rgba(7,13,28,0.9))] text-left transition hover:border-present/70">
      <span className="relative block h-36 w-36 shrink-0 sm:h-40 sm:w-40">
        {!mobile ? (
          <RelicTurntable url={lead.file} reducedMotion={reducedMotion} spin={0.4} fit={2.1} distance={4.2} className="!absolute !inset-0" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-present">
            <LuBox className="h-10 w-10" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-4">
        <span className="story-kicker text-present">{t.relicCardTitle}</span>
        <span className="mt-1 block font-display text-lg leading-tight text-[#f4f7ff]">{lead.name[lang]}</span>
        <span className="mt-1 block text-xs text-[#93a6c9]">{countLabel}</span>
        <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-present/50 px-3 py-1 text-[11px] tracking-[0.1em] text-present uppercase transition group-hover:bg-present group-hover:text-[#07101f]">
          {t.seeIn3D} <LuArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

function RecordPlate({ object, mission, lang }: { object: Artifact; mission: Mission | undefined; lang: Lang }) {
  const { t } = useI18n();
  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  const coords = coordinateParts(object.location.latitude, object.location.longitude);
  const days = recordedSpanDays(mission?.arrivalDate, mission?.endDate);
  const stops: { label: string; date?: string; kind: EventKind | "none" }[] = [
    { label: t.launch, date: mission?.launchDate, kind: "milestone" },
    { label: t.arrived, date: mission?.arrivalDate, kind: "arrival" },
    { label: t.ended, date: mission?.endDate, kind: object.status === "active" ? "none" : "retired" },
  ];
  const tone = statusColor[object.status] ?? "#93a6c9";

  return (
    <section aria-label={t.missionRecord} className="data-plate rounded-2xl border border-white/12 px-4 pt-4 pb-5 sm:px-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="story-kicker text-[#93a6c9]">{t.missionRecord}</p>
        <p className="story-kicker text-history">{t.precisionLabels[object.location.precision]}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Coordinate label={t.latitudeShort} value={coords.latitude} hemisphere={coords.latHemisphere} />
        <Coordinate label={t.longitudeShort} value={coords.longitude} hemisphere={coords.lonHemisphere} />
      </div>
      <p className="mt-2 text-sm text-[#c5d2ea]">
        {object.location.locationName}
        {object.location.region && <span className="text-[#93a6c9]"> · {object.location.region}</span>}
      </p>

      {mission && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <ol className="relative grid grid-cols-3 gap-2">
            <span aria-hidden="true" className="absolute top-[5px] right-[16%] left-[16%] h-px bg-gradient-to-r from-[#c5d2ea]/30 via-history/70 to-[#c5d2ea]/30" />
            {stops.map((stop) => (
              <li key={stop.label} className="relative flex flex-col items-center text-center">
                <span className="relative z-10 mb-2 block h-[11px] w-[11px] rounded-full border-2 border-[#0a1120]" style={{ backgroundColor: stop.date ? kindColor[stop.kind === "none" ? "milestone" : stop.kind] : "#2c3a57" }} />
                <span className="story-kicker text-[#6b7a99]">{stop.label}</span>
                <span className={`plate-date mt-1 text-[15px] leading-5 sm:text-base ${stop.date ? "text-[#f4f7ff]" : "text-[#6b7a99]"}`}>
                  {stop.date ? formatDisplayDate(stop.date, lang) : stop.kind === "none" ? t.statusLabels.active : t.noEndRecorded}
                </span>
              </li>
            ))}
          </ol>
          {days !== null && <p className="mt-3 text-center font-mono text-[11px] tracking-wide text-[#93a6c9]">{fillCopy(t.recordSpanShort, { days: days.toLocaleString(locale) })}</p>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="story-kicker text-[#6b7a99]">{t.status}</span>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-[#f4f7ff]" style={{ borderColor: `color-mix(in srgb, ${tone} 45%, transparent)`, backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)` }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone, boxShadow: `0 0 8px ${tone}` }} />
          {t.statusLabels[object.status]}
        </span>
      </div>

      {mission && (
        <figure className="mt-4 m-0">
          <figcaption className="story-kicker text-[#6b7a99]">{t.objective}</figcaption>
          <blockquote className="plate-quote mt-1.5 border-l-2 border-history/60 pl-3 text-[17px] leading-snug text-[#eef2fb]">
            {mission.objectives[lang]}
          </blockquote>
        </figure>
      )}
    </section>
  );
}

function Coordinate({ label, value, hemisphere }: { label: string; value: string; hemisphere: string }) {
  const [whole, fraction] = value.split(".");
  return (
    <div>
      <span className="story-kicker text-[#6b7a99]">{label}</span>
      <span className="mt-1 flex items-baseline gap-1 text-[#f4f7ff]">
        <span className="plate-value text-[1.65rem] leading-none sm:text-3xl">
          {whole}
          {fraction && <span className="text-[#c5d2ea]">.{fraction}</span>}
          <span className="text-[#93a6c9]">°</span>
        </span>
        <span className="font-mono text-sm font-semibold text-history">{hemisphere}</span>
      </span>
    </div>
  );
}

function Chip({ children, tone }: { children: ReactNode; tone?: "present" }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${tone === "present" ? "border-present/30 bg-present/10 font-mono text-present" : "border-white/10 bg-white/5 text-[#c5d2ea]"}`}>
      {children}
    </span>
  );
}

const HeaderButton = forwardRef<HTMLButtonElement, { onClick?: () => void; disabled?: boolean; label: string; pressed?: boolean; tone?: "danger"; children: ReactNode }>(
  function HeaderButton({ onClick, disabled, label, pressed, tone, children }, ref) {
    const hover = tone === "danger" ? "hover:border-loss/60 hover:bg-loss/15 hover:text-loss" : "hover:border-present/60 hover:bg-present/15 hover:text-present";
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={pressed}
        title={label}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-[#f4f7ff] transition active:scale-95 disabled:opacity-20 ${pressed ? "border-present/60 bg-present/15 text-present" : "border-white/10 bg-white/5"} ${hover} disabled:hover:border-white/10 disabled:hover:bg-white/5 disabled:hover:text-[#f4f7ff]`}
      >
        {children}
      </button>
    );
  },
);

function Disclosure({ title, count, open = false, children }: { title: string; count?: number; open?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.open = open;
  }, [open]);
  return (
    <details ref={ref} className="group rounded-2xl border border-white/10 open:border-white/15 open:bg-white/[0.03]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-base text-[#f4f7ff]">{title}</span>
        {count !== undefined && <span className="font-mono text-[11px] text-[#93a6c9]">{String(count).padStart(2, "0")}</span>}
        <LuChevronRight className="ml-auto h-4 w-4 text-[#93a6c9] transition group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="px-4 pt-1 pb-4 text-[#f4f7ff]">{children}</div>
    </details>
  );
}
