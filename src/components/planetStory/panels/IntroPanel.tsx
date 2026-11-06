import { useI18n } from "../../../features/localization/LanguageContext";
import { storyImageById } from "../../../data/storyImages";
import type { IntroPanel as IntroPanelData, PlanetStory } from "../../../lib/planetStory";
import { Narrative, Photo } from "../PlanetStoryPrimitives";

type Props = { story: PlanetStory; panel: IntroPanelData; mode: "pinned" | "native" };

/** Section 01: the planet rises out of the dark; a single archive print floats beside the words. */
export function IntroPanel({ story, panel, mode }: Props) {
  const { t, lang } = useI18n();
  const image = storyImageById(panel.imageId) ?? null;
  const mars = story.theme.disc === "mars";
  return (
    <>
      <div data-ps-stars className="story-stars pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      {mars && (
        <>
          <div data-ps-haze="a" data-ps-depth="0.12" className="ps-haze ps-haze-a pointer-events-none absolute" aria-hidden="true" />
          <div data-ps-haze="b" data-ps-depth="-0.08" className="ps-haze ps-haze-b pointer-events-none absolute" aria-hidden="true" />
        </>
      )}
      <div data-ps-disc data-ps-depth={mars ? "0.18" : "0.3"} className={`ps-disc pointer-events-none absolute ${mars ? "story-mars-disc ps-disc-mars" : "story-moon-disc ps-disc-moon"}`} aria-hidden="true" />

      <div className="ps-panel-inner">
        <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} titleClassName="ps-title-lg" proseClassName="ps-prose-lg max-w-xl" />
          <div className="relative hidden justify-center lg:flex">
            <div data-ps-print className="story-print w-[min(24rem,30vw,42vh)] rotate-[4deg]">
              <Photo image={image} fallback={panel.title[lang]} className="aspect-square" credit={false} priority />
              {image && <p className="story-print-caption">{image.title}</p>}
            </div>
          </div>
        </div>
        <p data-ps-cue className="pointer-events-none absolute bottom-[5.5rem] left-5 flex items-center gap-3 text-[11px] tracking-[0.2em] text-[color:var(--ps-paper)]/70 uppercase sm:left-12" aria-hidden="true">
          {mode === "pinned" ? <span className="story-scroll-cue" /> : null}
          {mode === "pinned" ? t.story.twoWorlds.scrollHint : t.story.twoWorlds.swipeHint}
        </p>
      </div>
    </>
  );
}
