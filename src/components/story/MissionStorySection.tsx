import type { ReactNode } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { formatDisplayDate, recordedSpanDays } from "../../lib/presentation";
import { lastContactFor, yearsSince } from "../../lib/story";
import type { ResolvedMissionSection as ResolvedMission } from "../../lib/storyMode";
import type { ArtifactModel } from "../../data/artifactModels";
import type { Artifact, Mission, TimelineEvent } from "../../types/catalog";
import { MissionTimeline } from "./MissionTimeline";
import { CoordinateLine, CountUp, ExploreLink, RelicLink, SourceList, StatusPill, StoryImage, Words } from "./StoryPrimitives";

/** One mission, told in one of five layouts so the chapter never reads as a stack of identical cards. */
export function MissionStorySection(props: ResolvedMission) {
  switch (props.section.layout) {
    case "cinematic":
      return <Cinematic {...props} />;
    case "editorial":
      return <Editorial {...props} />;
    case "date":
      return <DateLed {...props} />;
    case "split-reverse":
      return <Split {...props} reverse />;
    default:
      return <Split {...props} />;
  }
}

/* ----------------------------------------------------------------------------------- */

function Cinematic({ section, mission, artifacts, image, events, sources, relic }: ResolvedMission) {
  const { lang } = useI18n();
  const primary = artifacts[0];
  return (
    <article id={section.id} aria-labelledby={`${section.id}-name`} className="relative">
      <div className="relative min-h-[82vh] overflow-hidden lg:min-h-dvh">
        {image ? (
          <div className="absolute inset-0" data-story-parallax="0.12">
            <img src={image.url} alt={image.alt[lang]} loading="lazy" decoding="async" width={1600} height={1200} className="h-[112%] w-full object-cover" data-story-zoom />
          </div>
        ) : (
          <div className="story-placeholder absolute inset-0" aria-hidden="true" />
        )}
        <div className="story-cinematic-shade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[82vh] max-w-6xl flex-col justify-end px-5 pb-14 pt-32 sm:px-10 lg:min-h-dvh lg:pb-20">
          <div className="max-w-2xl" data-story-stagger>
            <MissionKicker mission={mission} />
            <h3 id={`${section.id}-name`} className="story-display mt-4 text-5xl text-[#f4f7ff] sm:text-7xl lg:text-8xl">
              <Words text={mission.name[lang]} />
            </h3>
            <p className="story-prose-lg mt-6 max-w-xl">{section.lead[lang]}</p>
          </div>
        </div>
      </div>
      {image && (
        <p className="mx-auto max-w-6xl px-5 pt-3 text-[11px] leading-5 text-[#93a6c9] sm:px-10">
          {image.credit}
        </p>
      )}
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-10 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <DateStrip mission={mission} primary={primary} events={events} />
          <MissionStats mission={mission} primary={primary} events={events} />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5" data-story-reveal>
            <Facts mission={mission} primary={primary} />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <HardwareList artifacts={artifacts} relic={relic} />
            <SourceList sources={sources} className="mt-8" />
          </div>
        </div>
      </div>
    </article>
  );
}

function Split({ section, mission, artifacts, image, events, sources, relic, reverse = false }: ResolvedMission & { reverse?: boolean }) {
  const { lang } = useI18n();
  const primary = artifacts[0];
  return (
    <article id={section.id} aria-labelledby={`${section.id}-name`} className="relative mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24">
      <div className={`grid gap-10 lg:grid-cols-12 lg:gap-14 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-24">
            {image ? (
              <StoryImage image={image} fallback={{ title: primary?.location.locationName ?? mission.name[lang], subtitle: primary?.location.region }} aspect="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]" parallax={0.1} />
            ) : (
              primary && <SitePlate artifact={primary} />
            )}
            {events.length > 0 && section.showTimeline && (
              <div className="mt-8 hidden lg:block">
                <MilestonesHeading />
                <MissionTimeline events={events} variant="compact" />
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-6">
          <div data-story-stagger>
            <MissionKicker mission={mission} />
            <h3 id={`${section.id}-name`} className="story-display mt-4 text-4xl text-[#f4f7ff] sm:text-6xl">
              <Words text={mission.name[lang]} />
            </h3>
            <DateStrip mission={mission} primary={primary} events={events} className="mt-6" />
            <p className="story-prose-lg mt-8">{section.lead[lang]}</p>
          </div>
          <MissionStats mission={mission} primary={primary} events={events} className="mt-8" />
          <div className="mt-10" data-story-reveal>
            <Facts mission={mission} primary={primary} />
          </div>
          {events.length > 0 && section.showTimeline && (
            <div className="mt-10 lg:hidden">
              <MilestonesHeading />
              <MissionTimeline events={events} variant="compact" />
            </div>
          )}
          <HardwareList artifacts={artifacts} relic={relic} className="mt-10" />
          <SourceList sources={sources} className="mt-8" />
        </div>
      </div>
    </article>
  );
}

function Editorial({ section, mission, artifacts, image, events, sources, relic }: ResolvedMission) {
  const { lang } = useI18n();
  const primary = artifacts[0];
  return (
    <article id={section.id} aria-labelledby={`${section.id}-name`} className="relative mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24">
      <div className="max-w-3xl" data-story-stagger>
        <MissionKicker mission={mission} />
        <h3 id={`${section.id}-name`} className="story-display mt-4 text-5xl text-[#f4f7ff] sm:text-7xl">
          <Words text={mission.name[lang]} />
        </h3>
        <DateStrip mission={mission} primary={primary} events={events} className="mt-6" />
      </div>
      {image ? (
        <StoryImage image={image} fallback={{ title: primary?.location.locationName ?? mission.name[lang] }} aspect="aspect-[16/10] sm:aspect-[21/9]" className="mt-10" parallax={0.14} />
      ) : (
        primary && <SitePlate artifact={primary} className="mt-10" />
      )}
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="story-prose-lg" data-story-reveal>
            {section.lead[lang]}
          </p>
          <MissionStats mission={mission} primary={primary} events={events} className="mt-8" />
          <div className="mt-8" data-story-reveal>
            <Facts mission={mission} primary={primary} />
          </div>
        </div>
        <div className="lg:col-span-3">
          {events.length > 0 && section.showTimeline && (
            <>
              <MilestonesHeading />
              <MissionTimeline events={events} variant="compact" />
            </>
          )}
        </div>
        <div className="lg:col-span-4">
          <HardwareList artifacts={artifacts} relic={relic} />
          <SourceList sources={sources} className="mt-8" />
        </div>
      </div>
    </article>
  );
}

function DateLed({ section, mission, artifacts, image, events, sources, relic }: ResolvedMission) {
  const { lang, t } = useI18n();
  const primary = artifacts[0];
  const date = mission.arrivalDate ?? mission.launchDate;
  const dateLabel = mission.arrivalDate ? t.story.landed : t.story.launched;
  return (
    <article id={section.id} aria-labelledby={`${section.id}-name`} className="relative mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5" data-story-reveal>
          {date && (
            <>
              <p className="story-kicker text-[#93a6c9]">{dateLabel}</p>
              <time dateTime={date} className="story-big-date mt-3 block text-[4.5rem] sm:text-[6.5rem] lg:text-[7.5rem]">
                <CountUp value={Number(date.slice(0, 4))} from={Number(date.slice(0, 4)) - 40} />
              </time>
              <p className="plate-date mt-2 text-xl text-[#c5d2ea] sm:text-2xl">{formatDisplayDate(date, lang)}</p>
            </>
          )}
          <div className="story-rule mt-8 w-32" aria-hidden="true" data-story-line />
          <DateStrip mission={mission} primary={primary} events={events} className="mt-6" omitArrival />
          <MissionStats mission={mission} primary={primary} events={events} className="mt-8" />
        </div>
        <div className="lg:col-span-7">
          <div data-story-stagger>
            <MissionKicker mission={mission} />
            <h3 id={`${section.id}-name`} className="story-display mt-4 text-4xl text-[#f4f7ff] sm:text-6xl">
              <Words text={mission.name[lang]} />
            </h3>
            <p className="story-prose-lg mt-6">{section.lead[lang]}</p>
          </div>
          {image && <StoryImage image={image} fallback={{ title: mission.name[lang] }} aspect="aspect-[16/9]" className="mt-8" parallax={0.1} />}
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div data-story-reveal>
              <Facts mission={mission} primary={primary} />
              {events.length > 0 && section.showTimeline && (
                <div className="mt-8">
                  <MilestonesHeading />
                  <MissionTimeline events={events} variant="compact" />
                </div>
              )}
            </div>
            <div>
              <HardwareList artifacts={artifacts} relic={relic} />
              <SourceList sources={sources} className="mt-8" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------------- */

function MissionKicker({ mission }: { mission: Mission }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="story-kicker story-accent">
        {mission.agency} · {mission.missionType}
      </p>
      <StatusPill status={mission.status} />
    </div>
  );
}

function MilestonesHeading() {
  const { t } = useI18n();
  return <p className="story-kicker mb-4 text-[#93a6c9]">{t.story.milestones}</p>;
}

/** Big counted numbers derived only from catalog dates: time on the surface, time since the last signal. */
function MissionStats({ mission, primary, events, className = "" }: { mission: Mission; primary?: Artifact; events: TimelineEvent[]; className?: string }) {
  const { t } = useI18n();
  const silence = primary ? lastContactFor(primary.id, events) : null;
  const end = silence?.date ?? mission.endDate;
  const items: { label: string; value: number; grouping?: boolean }[] = [];
  if (mission.status === "active") {
    const years = yearsSince(mission.arrivalDate);
    if (years !== null && years > 0) items.push({ label: t.story.stats.yearsActive, value: years });
  } else {
    const days = recordedSpanDays(mission.arrivalDate, end);
    if (days !== null && days > 0) items.push({ label: t.story.stats.days, value: days, grouping: true });
    const since = yearsSince(end);
    if (since !== null && since > 0) items.push({ label: t.story.stats.yearsSince, value: since });
  }
  if (items.length === 0) return null;
  return (
    <dl className={`flex flex-wrap gap-x-10 gap-y-4 ${className}`} data-story-stagger>
      {items.map((item) => (
        <div key={item.label}>
          <dd className="story-big-date text-4xl sm:text-5xl">
            <CountUp value={item.value} grouping={item.grouping} />
          </dd>
          <dt className="story-kicker mt-1 text-[#93a6c9]">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}

function DateStrip({ mission, primary, events, className = "", omitArrival = false }: { mission: Mission; primary?: Artifact; events: TimelineEvent[]; className?: string; omitArrival?: boolean }) {
  const { t, lang } = useI18n();
  const silence = primary ? lastContactFor(primary.id, events) : null;
  const items: { label: string; date?: string; text?: string }[] = [];
  if (mission.launchDate) items.push({ label: t.story.launched, date: mission.launchDate });
  if (mission.arrivalDate && !omitArrival) items.push({ label: t.story.landed, date: mission.arrivalDate });
  if (silence) items.push({ label: t.story.lastContact, date: silence.date });
  else if (mission.endDate) items.push({ label: t.story.missionEnded, date: mission.endDate });
  else if (mission.status === "active") items.push({ label: t.story.hardwareStatus, text: t.story.ongoing });
  if (items.length === 0) return null;
  return (
    <dl className={`flex flex-wrap gap-x-8 gap-y-3 ${className}`}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="story-kicker text-[#93a6c9]">{item.label}</dt>
          <dd className="plate-date mt-1 text-lg text-[#f4f7ff]">
            {item.date ? <time dateTime={item.date}>{formatDisplayDate(item.date, lang)}</time> : item.text}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Facts({ mission, primary }: { mission: Mission; primary?: Artifact }) {
  const { t, lang } = useI18n();
  return (
    <dl className="space-y-6">
      <Fact label={t.story.objectives}>{mission.objectives[lang]}</Fact>
      {primary && <Fact label={t.story.outcome}>{primary.story[lang].whatHappened}</Fact>}
    </dl>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="story-kicker text-[#93a6c9]">{label}</dt>
      <dd className="mt-2 text-sm leading-6 text-[#e8edf8] sm:text-base sm:leading-7">{children}</dd>
    </div>
  );
}

function HardwareList({ artifacts, relic, className = "" }: { artifacts: Artifact[]; relic: ArtifactModel | null; className?: string }) {
  const { t, lang } = useI18n();
  if (artifacts.length === 0) return null;
  return (
    <div className={className}>
      <p className="story-kicker text-[#93a6c9]">{t.story.hardware}</p>
      <ul className="mt-3 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/20" data-story-stagger>
        {artifacts.map((artifact) => (
          <li key={artifact.id} className="flex flex-col gap-3 p-4">
            <div className="min-w-0">
              <p className="font-display text-lg leading-tight text-[#f4f7ff]">{artifact.name[lang]}</p>
              <p className="mt-1 text-xs text-[#93a6c9]">
                {t.typeLabels[artifact.type]} · {artifact.location.locationName}
              </p>
              <p className="mt-1 text-xs">
                <CoordinateLine artifact={artifact} />
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusPill status={artifact.status} />
              <ExploreLink artifact={artifact} compact />
            </div>
          </li>
        ))}
      </ul>
      {relic && (
        <div className="mt-3">
          <RelicLink model={relic} />
        </div>
      )}
    </div>
  );
}

/** A wide archival plate used where the archive holds no photograph of a lunar site. */
function SitePlate({ artifact, className = "" }: { artifact: Artifact; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`data-plate relative overflow-hidden rounded-2xl p-6 sm:p-10 ${className}`} data-story-reveal>
      <div aria-hidden="true" className={`story-${artifact.planet}-disc pointer-events-none absolute -top-1/2 -right-[10%] aspect-square w-[55%] opacity-70 sm:-top-[70%]`} />
      <p className="story-kicker text-[#93a6c9]">{t.story.location}</p>
      <p className="font-display mt-2 text-3xl text-[#f4f7ff] sm:text-5xl">{artifact.location.locationName}</p>
      {artifact.location.region && <p className="mt-2 text-sm text-[#c5d2ea]">{artifact.location.region}</p>}
      <p className="mt-6 text-sm">
        <span className="story-kicker mr-3 text-[#93a6c9]">{t.story.coordinates}</span>
        <CoordinateLine artifact={artifact} />
      </p>
      <p className="mt-4 max-w-xl text-xs leading-5 text-[#93a6c9]">{t.story.noPhoto}</p>
    </div>
  );
}
