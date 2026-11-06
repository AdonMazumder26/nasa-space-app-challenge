import { useMemo } from "react";
import { useI18n } from "../../../features/localization/LanguageContext";
import { planetStoryCatalog } from "../../../data/planetStories";
import { storyImageById } from "../../../data/storyImages";
import { resolveBeats, type MissionsPanel as MissionsPanelData, type PlanetStory, type ResolvedBeat } from "../../../lib/planetStory";
import { formatDisplayDate, recordedSpanDays } from "../../../lib/presentation";
import { lastContactFor } from "../../../lib/story";
import type { Artifact } from "../../../types/catalog";
import { StatusPill } from "../../story/StoryPrimitives";
import { DateLine, ExploreIcon, Narrative, Photo, Rule, yearOf } from "../PlanetStoryPrimitives";

type Props = { story: PlanetStory; panel: MissionsPanelData };

/** The artifact a mission beat links to: the first one with a surveyed position. */
const linkable = (artifacts: Artifact[]) => artifacts.find((artifact) => artifact.location.precision !== "unknown") ?? null;

export function MissionsPanel({ story, panel }: Props) {
  const beats = useMemo(() => resolveBeats(panel, planetStoryCatalog), [panel]);
  switch (panel.animationPreset) {
    case "apollo":
      return <Filmstrip panel={panel} beats={beats} />;
    case "landers":
      return <Landers panel={panel} beats={beats} />;
    case "rovers":
      return <Rovers panel={panel} beats={beats} />;
    case "habitability":
      return <Habitability story={story} panel={panel} beats={beats} />;
    default:
      return <Arrivals panel={panel} beats={beats} />;
  }
}

/* Moon 02 · a photograph, then a timeline rail the Surveyors land on. ------------------- */
function Arrivals({ panel, beats }: { panel: MissionsPanelData; beats: ResolvedBeat[] }) {
  const { t, lang } = useI18n();
  const hero = storyImageById(panel.imageId ?? "") ?? null;
  return (
    <div className="ps-panel-inner">
      <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} />
        <div className="relative">
          <Photo image={hero} fallback={panel.title[lang]} className="aspect-[2/1] max-h-[28vh] w-full" frameAttrs={{ "data-ps-hero": "" }} priority credit={false} />
          {hero && <p className="mt-1 truncate text-[10px] text-[color:var(--ps-paper)]/60">{hero.credit}</p>}
          <ol className="relative mt-4 grid gap-5 sm:grid-cols-3" aria-label={panel.title[lang]}>
            <span aria-hidden="true" data-ps-rail className="absolute top-[7px] right-0 left-0 hidden h-px bg-gradient-to-r from-[color:var(--ps-accent)] via-[color:var(--ps-accent-soft)] to-transparent sm:block" />
            {beats.map(({ beat, mission, artifacts }) => {
              const target = linkable(artifacts);
              return (
                <li key={mission.id} className="relative sm:pt-5">
                  <span aria-hidden="true" data-ps-node className="absolute top-0 left-0 hidden h-[15px] w-[15px] rounded-full border-2 border-[color:var(--ps-accent)] bg-[color:var(--ps-bg)] sm:block" />
                  <p data-ps-date className="story-big-date ps-date">
                    {yearOf(mission.arrivalDate)}
                  </p>
                  <div data-ps-beat>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg text-[#f4f7ff]">{mission.name[lang]}</h3>
                      {target && <ExploreIcon artifact={target} />}
                    </div>
                    <DateLine label={t.story.landed} iso={mission.arrivalDate} />
                    <p className="ps-note mt-2 text-[color:var(--ps-paper)]">{beat.note[lang]}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* Moon 03 · six years on a filmstrip; each photograph opens like an iris. --------------- */
function Filmstrip({ panel, beats }: { panel: MissionsPanelData; beats: ResolvedBeat[] }) {
  const { t, lang } = useI18n();
  return (
    <div className="ps-panel-inner">
      <div className="flex h-full flex-col gap-8 lg:flex-row lg:items-center">
        <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} className="shrink-0 lg:w-[min(30vw,26rem)]" />
        <div className="relative lg:pl-6">
          <span aria-hidden="true" data-ps-rail className="absolute top-[2.6rem] right-0 left-0 hidden h-px bg-gradient-to-r from-[color:var(--ps-accent)] to-transparent lg:block" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:flex lg:gap-6" aria-label={panel.title[lang]}>
            {beats.map(({ beat, mission, image, artifacts }, index) => {
              const target = linkable(artifacts);
              return (
                <li key={mission.id} data-ps-drift={index % 2 ? "-1" : "1"} className="lg:w-[min(18rem,36vh)] lg:shrink-0">
                  <p data-ps-date className="story-big-date ps-date-lg">
                    {yearOf(mission.arrivalDate)}
                  </p>
                  <Photo image={image} fallback={mission.name[lang]} className="mt-3 aspect-[4/5] max-h-[30vh]" frameAttrs={{ "data-ps-mask": "" }} credit={false} />
                  <div data-ps-beat className="mt-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg text-[#f4f7ff]">{mission.name[lang]}</h3>
                      {target && <ExploreIcon artifact={target} />}
                    </div>
                    <DateLine label={t.story.landed} iso={mission.arrivalDate} />
                    <p className="ps-note mt-2 text-[color:var(--ps-paper)]">{beat.note[lang]}</p>
                    {image && <p className="mt-1.5 truncate text-[10px] text-[color:var(--ps-paper)]/60">{image.credit}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* Mars 02 · the ground reveals from the bottom up; labels drop in from above. ------------ */
function Landers({ panel, beats }: { panel: MissionsPanelData; beats: ResolvedBeat[] }) {
  const { t, lang } = useI18n();
  return (
    <div className="ps-panel-inner">
      <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} />
        <ol className="grid gap-5 sm:grid-cols-3" aria-label={panel.title[lang]}>
          {beats.map(({ beat, mission, image, artifacts }) => {
            const target = linkable(artifacts);
            return (
              <li key={mission.id} className="relative">
                <Photo image={image} fallback={mission.name[lang]} className="aspect-[3/4] max-h-[30vh]" frameAttrs={{ "data-ps-mask": "" }} credit={false}>
                  <span data-ps-chip className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/55 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-[#f4f7ff] uppercase backdrop-blur-sm">
                    {mission.name[lang]}
                  </span>
                </Photo>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p data-ps-date className="plate-date text-xs text-[color:var(--ps-accent)]">
                    {t.story.landed} · {mission.arrivalDate ? formatDisplayDate(mission.arrivalDate, lang) : ""}
                  </p>
                  {target && <ExploreIcon artifact={target} />}
                </div>
                <Rule className="mt-1.5" />
                <div data-ps-beat className="mt-2.5">
                  <p className="ps-note text-[color:var(--ps-paper)]">{beat.note[lang]}</p>
                  <p className="ps-note mt-1.5 text-[color:var(--ps-paper)]/70">
                    <span className="font-mono text-[10px] tracking-[0.16em] uppercase">{t.story.objectives}</span> · {mission.objectives[lang]}
                  </p>
                  {image && <p className="mt-1.5 truncate text-[10px] text-[color:var(--ps-paper)]/60">{image.credit}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* Mars 03 · two rovers, two panoramas, two very different spans on the surface. ---------- */
function Rovers({ panel, beats }: { panel: MissionsPanelData; beats: ResolvedBeat[] }) {
  const { t, lang } = useI18n();
  const spans = beats.map(({ mission }) => recordedSpanDays(mission.arrivalDate, mission.endDate) ?? 0);
  const longest = Math.max(1, ...spans);
  return (
    <div className="ps-panel-inner">
      <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]">
        <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} />
        <div className="grid gap-6 sm:grid-cols-2">
          {beats.map(({ beat, mission, image, artifacts }, index) => {
            const rover = artifacts.find((artifact) => artifact.type === "rover") ?? artifacts[0];
            const portrait = rover?.images[0] ?? null;
            const days = spans[index] ?? 0;
            const years = Math.round((days / 365.25) * 10) / 10;
            const ending = rover ? lastContactFor(rover.id, planetStoryCatalog.events) : null;
            return (
              <article key={mission.id} className={index % 2 ? "sm:mt-5" : ""} aria-labelledby={`${panel.id}-${mission.id}`}>
                <div className="flex items-center gap-3">
                  <div data-ps-portrait className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/40">
                    {portrait ? <img src={portrait.url} alt={portrait.alt[lang]} loading="lazy" decoding="async" width={96} height={96} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <h3 id={`${panel.id}-${mission.id}`} className="font-display text-xl text-[#f4f7ff]">
                      {mission.name[lang]}
                    </h3>
                    {rover && <StatusPill status={rover.status} />}
                  </div>
                  {rover && <ExploreIcon artifact={rover} />}
                </div>
                <div className="min-w-0">
                  <Photo image={image} fallback={mission.name[lang]} className="mt-2.5 aspect-[21/9] max-h-[22vh]" frameAttrs={{ "data-ps-pan": "" }} credit={false} />
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span data-ps-bar aria-hidden="true" className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[color:var(--ps-accent-soft)] to-[color:var(--ps-accent)]" style={{ width: `${Math.max(4, (days / longest) * 100)}%` }} />
                    </span>
                    <span className="plate-value shrink-0 text-xs text-[#f4f7ff]">
                      {years.toLocaleString(lang === "bn" ? "bn-BD" : "en-GB")} <span className="text-[color:var(--ps-paper)]/70">{t.story.twoWorlds.yearsOnSurface}</span>
                    </span>
                  </div>
                  <div data-ps-date>
                    <DateLine label={t.story.landed} iso={mission.arrivalDate} className="mt-1.5" />
                  </div>
                  <p data-ps-beat className="ps-note mt-1.5 text-[color:var(--ps-paper)]">
                    {beat.note[lang]}
                  </p>
                  {ending && (
                    <p data-ps-end className="ps-note mt-1.5 text-[#f5a39c]">
                      <span className="font-mono text-[10px] tracking-[0.16em] uppercase">{t.story.lastContact}</span> · {formatDisplayDate(ending.date, lang)} · {ending.label[lang]}
                    </p>
                  )}
                  {image && <p className="mt-1.5 truncate text-[10px] text-[color:var(--ps-paper)]/60">{image.credit}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Mars 04 · terrain behind, instrument cards in front; two of them are still working. ---- */
function Habitability({ story, panel, beats }: { story: PlanetStory; panel: MissionsPanelData; beats: ResolvedBeat[] }) {
  const { t, lang } = useI18n();
  const background = storyImageById(panel.imageId ?? "") ?? null;
  return (
    <>
      {background && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img data-ps-bg src={background.file} alt="" width={background.width} height={background.height} loading="lazy" decoding="async" className="h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${story.theme.bgDeep} 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.6) 100%), linear-gradient(0deg, ${story.theme.bgDeep} 0%, transparent 45%)` }} />
        </div>
      )}
      <div className="ps-panel-inner">
        <div className="mx-auto grid h-full w-full max-w-7xl items-end gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} />
          <ol className="grid gap-4 sm:grid-cols-3" aria-label={panel.title[lang]}>
            {beats.map(({ beat, mission, image, artifacts }) => {
              const target = linkable(artifacts);
              return (
                <li key={mission.id} data-ps-card className="flex">
                  <div className="story-card flex w-full flex-col rounded-2xl p-3">
                  <Photo image={image} fallback={mission.name[lang]} className="aspect-[4/3] max-h-[22vh]" frameAttrs={{ "data-ps-mask": "" }} credit={false} />
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <StatusPill status={mission.status} />
                    {target && <ExploreIcon artifact={target} />}
                  </div>
                  <h3 className="font-display mt-1.5 text-lg text-[#f4f7ff]">{mission.name[lang]}</h3>
                  <DateLine label={t.story.landed} iso={mission.arrivalDate} />
                  <p data-ps-beat className="ps-note mt-1.5 text-[color:var(--ps-paper)]">
                    {beat.note[lang]}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t.story.location}>
                    {target?.location.region && (
                      <li data-ps-chip className="rounded-full border border-[color:var(--ps-accent)]/40 bg-black/30 px-2.5 py-0.5 text-[10px] tracking-[0.12em] text-[color:var(--ps-accent)] uppercase">
                        {target.location.region}
                      </li>
                    )}
                  </ul>
                  <p className="ps-note ps-tall-only mt-1.5 text-[color:var(--ps-paper)]/70">
                    <span className="font-mono text-[10px] tracking-[0.16em] uppercase">{t.story.objectives}</span> · {mission.objectives[lang]}
                  </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}
