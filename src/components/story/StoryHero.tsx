import type { CSSProperties } from "react";
import { LuArrowDown } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import type { HeroSection } from "../../lib/storyMode";
import { Words } from "./StoryPrimitives";

type Props = {
  section: HeroSection;
  nextChapterId: string | null;
};

/**
 * Chapter 01 opener: a slowly turning Moon with satellites on orbit, twinkling stars, the
 * odd comet, and a word-by-word title. Pinned briefly on desktop (see useStoryAnimations)
 * so the Moon rises and the question settles. Fully readable without any of it.
 */
export function StoryHero({ section, nextChapterId }: Props) {
  const { t, lang } = useI18n();
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="relative min-h-dvh overflow-hidden" data-story-pin>
      <div className="story-stars" aria-hidden="true" data-story-parallax="0.08" />
      <div className="story-comet" aria-hidden="true" />
      <div className="story-aurora top-[-10%] left-[-10%] h-[50vh] w-[50vw] bg-[#3d7eff]/25" aria-hidden="true" />
      <div className="story-aurora story-aurora-b bottom-[-20%] left-[20%] h-[40vh] w-[40vw] bg-[#c5d2ea]/10" aria-hidden="true" />

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[58%] h-[140vw] w-[140vw] -translate-x-1/2 sm:top-[62%] sm:h-[92vmin] sm:w-[92vmin] lg:left-[68%] lg:top-1/2 lg:h-[88vmin] lg:w-[88vmin] lg:-translate-y-1/2"
      >
        <div className="story-moon-disc absolute inset-0" data-story-hero-moon />
        <div className="story-orbit -inset-[6%]" style={{ "--orbit-speed": "36s" } as CSSProperties} data-story-hero-orbit />
        <div className="story-orbit -inset-[16%] rotate-[25deg] border-white/5" style={{ "--orbit-speed": "58s", animationDirection: "reverse" } as CSSProperties} data-story-hero-orbit />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,15,0.2),rgba(5,8,15,0.55)_60%,#05080f)] lg:bg-[linear-gradient(90deg,#05080f_0%,rgba(5,8,15,0.85)_38%,rgba(5,8,15,0.15)_70%,rgba(5,8,15,0.2))]" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-5 pb-28 pt-24 sm:px-10 lg:justify-center lg:py-24">
        <div className="max-w-2xl">
          <p className="story-kicker story-accent" data-story-hero="kicker">
            {t.story.heroKicker}
          </p>
          <h1 id={`${section.id}-title`} className="story-display mt-4 text-[2.75rem] text-[#f4f7ff] sm:text-6xl lg:text-[clamp(3rem,8.5vh,4.5rem)]" data-story-hero="title">
            <Words text={section.title[lang]} />
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[#93a6c9] lg:mt-[2vh]" data-story-hero="sub">
            {section.kicker[lang]}
          </p>
          <div className="mt-6 max-w-xl space-y-3 text-[0.95rem] leading-6 text-[#e8edf8] sm:text-base sm:leading-7 lg:mt-[2.5vh] lg:space-y-[1.4vh] lg:text-[clamp(0.875rem,1.9vh,1rem)] lg:leading-[1.6]" data-story-hero="body">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.en}>{paragraph[lang]}</p>
            ))}
          </div>
          <p className="font-display mt-7 max-w-xl text-xl leading-snug text-[#f4f7ff] sm:text-2xl lg:mt-[3vh] lg:text-[clamp(1.375rem,3.4vh,1.875rem)]" data-story-hero="question">
            <Words text={section.question[lang]} />
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5 lg:mt-[3vh]" data-story-hero="cta">
            {nextChapterId && (
              <a
                href={`#${nextChapterId}`}
                className="story-cta-glow inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f4f7ff] px-6 py-3 text-xs font-semibold tracking-[0.18em] text-[#07101f] uppercase transition hover:bg-white"
              >
                {t.story.beginStory}
                <LuArrowDown aria-hidden="true" />
              </a>
            )}
            <span className="inline-flex items-center gap-3 text-xs tracking-[0.2em] text-[#93a6c9] uppercase">
              <span className="story-scroll-cue" aria-hidden="true" />
              {t.story.scrollCue}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
