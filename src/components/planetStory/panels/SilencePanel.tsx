import { useMemo } from "react";
import { useI18n } from "../../../features/localization/LanguageContext";
import { planetStoryCatalog } from "../../../data/planetStories";
import { storyImageById } from "../../../data/storyImages";
import { resolveSilenceEvents, type PlanetStory, type SilencePanel as SilencePanelData } from "../../../lib/planetStory";
import { formatDisplayDate } from "../../../lib/presentation";
import { NASA_AGENCY } from "../../../lib/storyMode";
import { StatusPill } from "../../story/StoryPrimitives";
import { Narrative } from "../PlanetStoryPrimitives";

type Props = { story: PlanetStory; panel: SilencePanelData };

export function SilencePanel({ story, panel }: Props) {
  const events = useMemo(() => resolveSilenceEvents(panel, planetStoryCatalog), [panel]);
  const image = storyImageById(panel.imageId) ?? null;
  const backdrop = image && (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <img data-ps-bg src={image.file} alt="" width={image.width} height={image.height} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      <div data-ps-shade className="ps-shade absolute inset-0" style={{ background: story.theme.bgDeep }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${story.theme.bgDeep} 0%, transparent 60%), linear-gradient(0deg, ${story.theme.bgDeep} 0%, transparent 40%)` }} />
    </div>
  );
  return (
    <>
      {backdrop}
      {panel.animationPreset === "signal-loss" ? <SignalLoss story={story} panel={panel} events={events} /> : <LunarDusk panel={panel} events={events} />}
      {image && <p className="pointer-events-none absolute right-5 bottom-[4.25rem] z-10 max-w-xs truncate text-right text-[10px] text-[color:var(--ps-paper)]/60 sm:right-12">{image.credit}</p>}
    </>
  );
}

type Events = ReturnType<typeof resolveSilenceEvents>;

/* Moon 05 · the light fades; what was built to stay is set apart from what simply stopped. */
function LunarDusk({ panel, events }: { panel: SilencePanelData; events: Events }) {
  const { t, lang } = useI18n();
  return (
    <div className="ps-panel-inner">
      <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} className="max-w-2xl" titleClassName="ps-title-lg" proseClassName="ps-prose-lg max-w-xl" />
        <div className="grid gap-3">
          <div data-ps-col className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
            <p className="story-kicker text-[color:var(--ps-accent)]">{t.story.twoWorlds.leftByDesign}</p>
            <p className="ps-prose mt-2 text-[color:var(--ps-paper)]">{t.story.twoWorlds.leftByDesignBody}</p>
            <p className="ps-note ps-tall-only mt-2 text-[color:var(--ps-paper)]/70">{t.story.remainBlurbs.left}</p>
          </div>
          <div data-ps-col className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
            <p className="story-kicker text-[color:var(--ps-accent)]">{t.story.twoWorlds.stoppedWorking}</p>
            <p className="ps-prose mt-2 text-[color:var(--ps-paper)]">{t.story.twoWorlds.stoppedWorkingBody}</p>
            {events.map((event) => (
              <div key={event.id} data-ps-event className="mt-3 border-t border-white/10 pt-2.5">
                <p className="plate-date text-[11px] text-[color:var(--ps-accent)]">{formatDisplayDate(event.date, lang)}</p>
                <p className="mt-0.5 text-sm font-medium text-[#f4f7ff]">{event.label[lang]}</p>
                <p className="ps-note mt-0.5 text-[color:var(--ps-paper)]/80">{event.description[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Mars 05 · a signal trace, one light per mission going dark, and the two that still answer. */
const WAVE_BARS = 36;
const barHeight = (index: number) => 22 + Math.round(Math.abs(Math.sin(index * 1.7) * 48 + Math.cos(index * 0.6) * 22));

function SignalLoss({ story, panel, events }: { story: PlanetStory; panel: SilencePanelData; events: Events }) {
  const { t, lang } = useI18n();
  const stillActive = useMemo(
    () =>
      planetStoryCatalog.objects.filter((object) => {
        if (object.planet !== story.planet || object.status !== "active") return false;
        const mission = planetStoryCatalog.missions.find((item) => item.id === object.missionId);
        return mission?.agency === NASA_AGENCY;
      }),
    [story.planet],
  );
  return (
    <div className="ps-panel-inner">
      <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} />
          <div data-ps-wave aria-hidden="true" className="mt-5 flex h-[min(6rem,12vh)] items-center gap-[3px]">
            {Array.from({ length: WAVE_BARS }, (_, index) => (
              <span key={index} className="w-1 flex-1 rounded-full bg-[color:var(--ps-accent)]/80" style={{ height: `${barHeight(index)}%` }} />
            ))}
          </div>
          {stillActive.length > 0 && (
            <div data-ps-still className="mt-4 flex flex-wrap items-center gap-3">
              <span className="story-kicker text-[#9ec0ff]">{t.story.twoWorlds.signalActive}</span>
              {stillActive.map((object) => (
                <span key={object.id} className="inline-flex items-center gap-2 text-sm text-[#f4f7ff]">
                  {object.name[lang]}
                  <StatusPill status={object.status} />
                </span>
              ))}
            </div>
          )}
        </div>
        <ol className="grid gap-2 lg:grid-cols-2" aria-label={t.story.twoWorlds.lastEvent}>
          {events.map((event) => {
            const mission = planetStoryCatalog.missions.find((item) => item.id === event.missionId);
            const silence = event.kind === "loss" || event.kind === "retired";
            return (
              <li key={event.id} data-ps-event className="grid grid-cols-[0.75rem_1fr] items-start gap-2.5 rounded-xl border border-white/8 bg-black/30 px-3 py-2">
                <span aria-hidden="true" data-ps-dot={silence ? "" : undefined} className={`mt-1.5 h-2.5 w-2.5 rounded-full ${silence ? "bg-[color:var(--ps-accent)] shadow-[0_0_10px_var(--ps-accent)]" : "border border-[color:var(--ps-paper)]/60"}`} />
                <span className="min-w-0">
                  <span className="plate-date block text-[10px] text-[color:var(--ps-paper)]/70">{formatDisplayDate(event.date, lang)}</span>
                  <span className="block text-[13px] leading-5 font-medium text-[#f4f7ff]">
                    {mission?.name[lang]} · {event.label[lang]}
                  </span>
                  <span className="ps-note ps-tall-only mt-0.5 text-[color:var(--ps-paper)]/75">{event.description[lang]}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
