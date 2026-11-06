import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { LuArrowDown, LuCompass } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import type { ConclusionSection } from "../../lib/storyMode";
import { chapterNumber } from "./StoryChapter";
import { Words } from "./StoryPrimitives";

type Props = { section: ConclusionSection; index: number; total: number };

/** Chapter 06 close: the two worlds rise together, then the way back into the atlas. */
export function StoryConclusion({ section, index, total }: Props) {
  const { t, lang } = useI18n();
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="relative overflow-hidden">
      <div className="story-stars" aria-hidden="true" />
      <div className="story-comet" aria-hidden="true" style={{ top: "8%", animationDelay: "2s" }} />
      <div className="story-aurora top-[20%] left-[-15%] h-[50vh] w-[45vw] bg-[#3d7eff]/20" aria-hidden="true" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[46vw] max-h-[26rem] items-end justify-center gap-[6vw] opacity-90">
        <div className="relative aspect-square w-[22vw] max-w-[13rem] translate-y-1/3" data-story-parallax="-0.06">
          <div className="story-moon-disc absolute inset-0" />
          <div className="story-orbit -inset-[14%]" style={{ "--orbit-speed": "30s" } as CSSProperties} />
        </div>
        <div className="relative aspect-square w-[34vw] max-w-[20rem] translate-y-1/2" data-story-parallax="-0.1">
          <div className="story-mars-disc absolute inset-0" />
          <div className="story-orbit -inset-[10%] rotate-[-20deg]" style={{ "--orbit-speed": "44s", animationDirection: "reverse" } as CSSProperties} />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pt-28 pb-[38vw] sm:px-10 sm:pt-36 lg:pb-72">
        <div className="max-w-3xl">
          <p className="story-kicker story-accent" data-story-reveal>
            {t.story.chapter} {chapterNumber(index, lang)} <span className="text-[#93a6c9]">/ {chapterNumber(total - 1, lang)}</span>
          </p>
          <h3 id={`${section.id}-title`} className="story-display mt-4 text-5xl text-[#f4f7ff] sm:text-7xl lg:text-8xl">
            <Words text={section.title[lang]} />
          </h3>
          <div className="story-highlight mt-8 font-display text-2xl leading-snug text-[#f4f7ff] sm:text-3xl lg:text-4xl">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.en} className="mt-6 first:mt-0">
                <Words text={paragraph[lang]} highlight />
              </p>
            ))}
          </div>
        </div>

        <nav aria-label={t.story.conclusionKicker} className="mt-14 max-w-3xl" data-story-reveal>
          <p className="story-kicker story-accent">{t.story.conclusionKicker}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-xs font-medium tracking-[0.18em] text-[#f4f7ff] uppercase transition hover:border-white/60 hover:bg-white/10"
            >
              <LuCompass aria-hidden="true" />
              {t.story.returnExplore}
            </Link>
            <a
              href="#finale"
              className="story-cta-glow inline-flex min-h-12 items-center gap-2 rounded-full bg-[#f4f7ff] px-6 py-3 text-xs font-semibold tracking-[0.18em] text-[#07101f] uppercase transition hover:bg-white"
            >
              {t.story.exploreSurface}
              <LuArrowDown aria-hidden="true" />
            </a>
          </div>
        </nav>
      </div>
    </section>
  );
}
