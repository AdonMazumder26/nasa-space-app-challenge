import type { CSSProperties } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { storyImageUrl, type StoryImage } from "../../data/storyImages";
import type { AssemblySection } from "../../lib/storyMode";
import { Words } from "./StoryPrimitives";

type Props = { section: AssemblySection; images: StoryImage[] };

/**
 * Final resting places for up to six prints, as percentages of the scene, plus the
 * off-screen direction each one flies in from. Index order matches `imageIds`.
 */
const slots = [
  { x: 2, y: 8, w: 23, r: -6, fromX: -120, fromY: -30, fromR: -28 },
  { x: 75, y: 5, w: 23, r: 5, fromX: 120, fromY: -40, fromR: 24 },
  { x: 4, y: 60, w: 21, r: 4, fromX: -120, fromY: 50, fromR: 18 },
  { x: 73, y: 62, w: 24, r: -5, fromX: 120, fromY: 60, fromR: -22 },
  { x: 30, y: -4, w: 15, r: -3, fromX: -10, fromY: -140, fromR: 12 },
  { x: 54, y: 78, w: 16, r: 3, fromX: 10, fromY: 140, fromR: -14 },
];

/**
 * A pinned scene in the spirit of GSAP's own landing page: as the reader scrolls, the
 * viewport holds still while photographs gather from every edge around a statement.
 * Below the desktop breakpoint the same markup becomes a simple two-column mosaic.
 */
export function StoryAssembly({ section, images }: Props) {
  const { t, lang } = useI18n();
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="story-assembly relative overflow-hidden" data-story-assembly>
      <div className="story-stars" aria-hidden="true" />
      <div className="relative mx-auto min-h-dvh max-w-[90rem] px-5 py-24 sm:px-10 lg:grid lg:place-items-center">
        <div className="story-assembly-stage relative w-full">
          <div className="story-assembly-copy relative z-20 mx-auto max-w-xl text-center" data-story-assembly-copy>
            <div className="story-assembly-halo" aria-hidden="true" />
            <div className="relative">
              {section.kicker && <p className="story-kicker story-accent">{section.kicker[lang]}</p>}
              <h3 id={`${section.id}-title`} className={`story-display mt-4 text-[#f4f7ff] ${section.title[lang].length > 48 ? "text-3xl sm:text-4xl lg:text-[2.75rem]" : "text-4xl sm:text-5xl lg:text-6xl"}`}>
                <Words text={section.title[lang]} plain />
              </h3>
              {section.body && <p className="mt-5 text-sm leading-6 text-[#c5d2ea] sm:text-base sm:leading-7" data-story-assembly-body>{section.body[lang]}</p>}
            </div>
          </div>

          <ul className="story-assembly-tiles mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-0" data-story-stagger="flip">
            {images.map((image, index) => {
              const slot = slots[index % slots.length];
              const style = {
                "--tile-x": `${slot.x}%`,
                "--tile-y": `${slot.y}%`,
                "--tile-w": `${slot.w}%`,
                "--tile-r": `${slot.r}deg`,
                "--tile-from-x": `${slot.fromX}vw`,
                "--tile-from-y": `${slot.fromY}vh`,
                "--tile-from-r": `${slot.fromR}deg`,
              } as CSSProperties;
              const wide = image.width / image.height > 1.9;
              return (
                <li key={image.id} className={`story-assembly-tile ${wide ? "col-span-2" : ""}`} style={style} data-story-assembly-tile>
                  <figure className="story-print">
                    <img
                      src={image.file}
                      alt={image.alt[lang]}
                      loading="lazy"
                      decoding="async"
                      width={image.width}
                      height={image.height}
                      className="block h-auto w-full"
                      style={{ aspectRatio: wide ? "21 / 9" : "4 / 3", objectFit: "cover" }}
                    />
                    <figcaption className="story-print-caption">{image.title}</figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className="relative mx-auto max-w-6xl px-5 pb-8 text-[11px] leading-5 text-[#93a6c9] sm:px-10">
        {t.story.archivePhotos}:{" "}
        {images.map((image, index) => (
          <span key={image.id}>
            {index > 0 && " · "}
            <a href={storyImageUrl(image)} target="_blank" rel="noreferrer noopener" className="underline decoration-white/20 underline-offset-2 hover:text-[#f4f7ff]">
              {image.nasaId}
            </a>
          </span>
        ))}
      </p>
    </section>
  );
}
