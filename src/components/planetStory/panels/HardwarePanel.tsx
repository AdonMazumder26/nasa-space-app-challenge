import { lazy, Suspense, useMemo } from "react";
import { useI18n } from "../../../features/localization/LanguageContext";
import { planetStoryCatalog } from "../../../data/planetStories";
import { storyImageById } from "../../../data/storyImages";
import { resolveHardware, type HardwarePanel as HardwarePanelData, type PlanetStory } from "../../../lib/planetStory";
import { CoordinateLine, RelicLink } from "../../story/StoryPrimitives";
import { ExploreIcon, Narrative, Photo, Rule } from "../PlanetStoryPrimitives";

// The GLB viewer pulls in three.js scene code; it is only requested when this panel is near.
const RelicTurntable = lazy(() => import("../../relics/RelicTurntable").then((module) => ({ default: module.RelicTurntable })));

type Props = { story: PlanetStory; panel: HardwarePanelData; near: boolean; reducedMotion: boolean };

/** Moon 04: a scanned relic on a pedestal, technical callouts beside it, the surface inventory alongside. */
export function HardwarePanel({ story, panel, near, reducedMotion }: Props) {
  const { t, lang } = useI18n();
  const { items, relic } = useMemo(() => resolveHardware(panel, planetStoryCatalog), [panel]);
  const background = storyImageById(panel.imageId ?? "") ?? null;
  const stations = items.filter((item) => item.artifact.type === "experiment" || item.artifact.type === "instrument");
  const rovers = items.filter((item) => item.artifact.type === "rover");
  const others = items.filter((item) => !stations.includes(item) && !rovers.includes(item));
  const groups = [
    { label: t.typeLabels.experiment, items: stations },
    { label: t.typeLabels.rover, items: rovers },
    { label: t.typeLabels.other, items: others },
  ];

  return (
    <>
      {background && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img data-ps-bg src={background.file} alt="" width={background.width} height={background.height} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${story.theme.bgDeep} 0%, rgba(0,0,0,0.25) 40%, ${story.theme.bgDeep} 100%)` }} />
        </div>
      )}
      <div className="ps-panel-inner">
        <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
          <div>
            <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} />
            <ul className="mt-4 space-y-2" aria-label={t.story.hardware}>
              {panel.callouts.map((callout, index) => (
                <li key={index} data-ps-callout className="grid grid-cols-[2.5rem_1fr] items-center gap-3">
                  <Rule />
                  <span className="font-mono text-[10px] tracking-[0.14em] text-[#f4f7ff] uppercase">{callout[lang]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-[min(100%,26rem,44vh)]">
            <div className="relative aspect-square">
              <div data-ps-ring aria-hidden="true" className="ps-pedestal absolute inset-[8%] rounded-full" />
              <div data-ps-model className="absolute inset-0">
                {relic ? (
                  near ? (
                    <Suspense fallback={<p className="story-kicker absolute inset-x-0 bottom-6 text-center text-[color:var(--ps-paper)]/70">{t.story.twoWorlds.scanLoading}</p>}>
                      <RelicTurntable url={relic.file} reducedMotion={reducedMotion} spin={reducedMotion ? 0 : 0.3} bob={!reducedMotion} fit={2.2} className="h-full w-full" />
                    </Suspense>
                  ) : null
                ) : (
                  <Photo image={background} fallback={panel.title[lang]} className="h-full" credit={false} />
                )}
              </div>
            </div>
            {relic && (
              <div data-ps-meta className="mt-1 text-center">
                <p className="story-kicker text-[color:var(--ps-accent)]">{t.story.twoWorlds.scanLabel}</p>
                <h3 className="font-display mt-1.5 text-lg text-[#f4f7ff]">{relic.name[lang]}</h3>
                <p className="mt-0.5 text-xs text-[color:var(--ps-paper)]/80">
                  {relic.mission[lang]} · {relic.kind[lang]}
                </p>
                <p className="ps-note ps-tall-only mx-auto mt-2 max-w-sm text-[color:var(--ps-paper)]">{relic.significance[lang]}</p>
                <div className="mt-2 flex justify-center">
                  <RelicLink model={relic} />
                </div>
              </div>
            )}
          </div>

          <div data-ps-meta>
            <p className="story-kicker text-[color:var(--ps-accent)]">{t.story.hardware}</p>
            <p className="ps-note mt-1 text-[color:var(--ps-paper)]/70">{t.story.remainBlurbs.left}</p>
            {groups.map(({ label, items: group }) =>
              group.length > 0 ? (
                <ul key={label} className="mt-2.5 divide-y divide-white/10 border-y border-white/10" aria-label={label}>
                  {group.map(({ artifact, mission }) => (
                    <li key={artifact.id} data-ps-item className="flex items-center justify-between gap-3 py-1">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#f4f7ff]">
                          {artifact.name[lang]}
                          <span className="ml-2 text-[10px] font-normal text-[color:var(--ps-paper)]/60">{artifact.location.region ?? artifact.location.locationName}</span>
                        </p>
                        <p className="ps-tall-only truncate text-[10px] text-[color:var(--ps-paper)]/70">
                          {mission?.name[lang]} · <CoordinateLine artifact={artifact} />
                        </p>
                      </div>
                      <ExploreIcon artifact={artifact} />
                    </li>
                  ))}
                </ul>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </>
  );
}
