import type { CSSProperties, ReactNode } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import type { StoryChapter as Chapter, StoryTheme } from "../../lib/storyMode";
import { Words } from "./StoryPrimitives";

type Props = {
  chapter: Chapter;
  index: number;
  total: number;
  /** The intro chapter opens with StoryHero instead of a chapter plate. */
  opener?: boolean;
  children: ReactNode;
};

const numberLocale = { en: "en-GB", bn: "bn-BD" } as const;

export function chapterNumber(index: number, lang: "en" | "bn"): string {
  return (index + 1).toLocaleString(numberLocale[lang], { minimumIntegerDigits: 2 });
}

/** Colours the fixed atmosphere layer tweens to when a chapter takes over the viewport. */
export const chapterGlow: Record<StoryTheme, { bg: string; a: string; b: string }> = {
  intro: { bg: "#05080f", a: "rgba(42,60,110,0.55)", b: "rgba(197,210,234,0.12)" },
  moon: { bg: "#0b1220", a: "rgba(226,197,122,0.18)", b: "rgba(61,126,255,0.2)" },
  transition: { bg: "#0a0f1d", a: "rgba(242,166,74,0.22)", b: "rgba(224,122,95,0.22)" },
  mars: { bg: "#1a0e0c", a: "rgba(224,122,95,0.32)", b: "rgba(242,166,74,0.16)" },
  remains: { bg: "#0b0f1c", a: "rgba(158,192,255,0.2)", b: "rgba(240,113,103,0.14)" },
  legacy: { bg: "#070d1c", a: "rgba(61,126,255,0.26)", b: "rgba(242,166,74,0.2)" },
};

const ornament: Partial<Record<StoryTheme, "moon" | "mars">> = { moon: "moon", mars: "mars" };

/** A themed chapter container. The opener plate reveals number, title, and subtitle in sequence. */
export function StoryChapter({ chapter, index, total, opener = true, children }: Props) {
  const { t, lang } = useI18n();
  const headingId = `${chapter.id}-heading`;
  const glow = chapterGlow[chapter.theme];
  const disc = ornament[chapter.theme];
  return (
    <section
      id={chapter.id}
      aria-labelledby={headingId}
      className={`story-theme-${chapter.theme} relative scroll-mt-16`}
      data-story-chapter
      data-chapter-index={index}
      data-glow-bg={glow.bg}
      data-glow-a={glow.a}
      data-glow-b={glow.b}
    >
      {chapter.theme === "mars" && <div className="story-dust" aria-hidden="true" />}
      {opener && (
        <header className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-10 pt-28 sm:px-10 sm:pb-16 sm:pt-36">
          <span aria-hidden="true" className="story-watermark" data-story-parallax="0.25">
            {chapterNumber(index, lang)}
          </span>
          {disc && (
            <div aria-hidden="true" className="pointer-events-none absolute top-16 right-4 hidden h-40 w-40 opacity-80 sm:block lg:right-24 lg:h-56 lg:w-56" data-story-float>
              <div className={`story-${disc}-disc absolute inset-0`} />
              <div className="story-orbit -inset-6" style={{ "--orbit-speed": "22s" } as CSSProperties} />
            </div>
          )}
          <div className="relative">
            <p className="story-kicker story-accent" data-story-reveal>
              {t.story.chapter} {chapterNumber(index, lang)} <span className="text-[#93a6c9]">/ {chapterNumber(total - 1, lang)}</span>
            </p>
            <h2 id={headingId} className="story-display mt-4 text-5xl text-[#f4f7ff] sm:text-7xl lg:text-8xl">
              <Words text={chapter.title[lang]} />
            </h2>
            <p className="font-display mt-5 max-w-2xl text-xl leading-snug text-[#c5d2ea] sm:text-2xl" data-story-reveal>
              {chapter.subtitle[lang]}
            </p>
            <div className="story-rule mt-8 w-40" aria-hidden="true" data-story-line />
          </div>
        </header>
      )}
      {!opener && (
        <h2 id={headingId} className="sr-only">
          {chapter.title[lang]}
        </h2>
      )}
      {children}
    </section>
  );
}
