import { useI18n } from "../../features/localization/LanguageContext";
import { storyImageUrl, type StoryImage } from "../../data/storyImages";
import type { TransitionSection } from "../../lib/storyMode";
import { Words } from "./StoryPrimitives";

type Props = { section: TransitionSection; image?: StoryImage };

/**
 * Chapter 03: the palette shifts from the Moon to Mars. A dotted trajectory draws itself
 * between the two worlds and a small probe rides along it as the reader scrolls. Both
 * worlds are laid out side by side so the scene reads without JavaScript; on desktop
 * useStoryAnimations pins it and scrubs the hand-off.
 */
export function ChapterTransition({ section, image }: Props) {
  const { lang } = useI18n();
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="relative min-h-dvh overflow-hidden" data-story-pin data-story-transition>
      <div className="story-stars" aria-hidden="true" />
      <div className="story-comet" aria-hidden="true" style={{ top: "30%", animationDelay: "9s" }} />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(224,122,95,0.26),transparent_70%)]" data-story-transition-glow />
      <div className="story-aurora top-[10%] right-[-10%] h-[50vh] w-[40vw] bg-[#e07a5f]/20" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-dvh max-w-6xl items-center gap-12 px-5 py-28 sm:px-10 lg:grid-cols-2">
        <div className="relative order-2 mx-auto h-[min(64vw,22rem)] w-full max-w-[36rem] lg:order-1 lg:h-[min(38vw,30rem)]">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="story-moon-disc absolute top-1/2 left-0 aspect-square h-[58%] -translate-y-1/2" data-story-transition-from />
            <div className="story-mars-disc absolute top-1/2 right-0 aspect-square h-[88%] -translate-y-1/2" data-story-transition-to />
            {/* Trajectory drawn in a 100×60 box over the disc area (which shares its aspect); the probe follows it. */}
            <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full overflow-visible">
              <path data-story-trajectory className="story-trajectory" d="M 16 30 C 30 2, 55 -2, 72 18 S 86 44, 80 36" vectorEffect="non-scaling-stroke" />
              <g data-story-probe className="story-probe" style={{ opacity: 0 }}>
                <circle r="1.6" fill="#f4f7ff" />
                <circle r="4" fill="none" stroke="#f4f7ff" strokeOpacity="0.35" strokeWidth="0.4" />
              </g>
            </svg>
          </div>
          {image && (
            <figure className="story-print absolute -bottom-6 left-[38%] z-10 w-40 rotate-[5deg] sm:w-48 lg:-bottom-10 lg:left-[30%]" data-story-transition-print>
              <img src={image.file} alt={image.alt[lang]} decoding="async" width={image.width} height={image.height} className="block h-auto w-full" style={{ aspectRatio: "16 / 10", objectFit: "cover" }} />
              <figcaption className="story-print-caption">
                {section.imageCaption?.[lang] ?? image.title}
                {" · "}
                <a href={storyImageUrl(image)} target="_blank" rel="noreferrer noopener" className="underline decoration-black/20 underline-offset-2">
                  {image.nasaId}
                </a>
              </figcaption>
            </figure>
          )}
        </div>
        <div className="order-1 lg:order-2" data-story-stagger>
          <p className="story-kicker story-accent">{section.kicker[lang]}</p>
          <h3 id={`${section.id}-title`} className="story-display mt-4 text-5xl text-[#f4f7ff] sm:text-6xl lg:text-7xl">
            <Words text={section.title[lang]} />
          </h3>
          <div className="story-prose-lg mt-8 max-w-xl">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.en}>{paragraph[lang]}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
