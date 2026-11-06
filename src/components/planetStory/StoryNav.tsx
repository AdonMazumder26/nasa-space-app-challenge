import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { fillCopy } from "../../features/localization/strings";
import type { PlanetStory } from "../../lib/planetStory";
import { chapterNumber } from "../story/StoryChapter";

type Props = {
  story: PlanetStory;
  active: number;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * Minimal chrome for the horizontal story: a progress line along the top (driven by the
 * `--ps-progress` custom property on the forwarded ref, so scrolling never re-renders React),
 * the current section, previous/next controls, and the way out.
 */
export const StoryNav = forwardRef<HTMLDivElement, Props>(function StoryNav({ story, active, onPrev, onNext }, barRef) {
  const { t, lang } = useI18n();
  const total = story.panels.length;
  const panel = story.panels[active];
  const label = fillCopy(t.story.twoWorlds.sectionOf, { index: chapterNumber(active, lang), total: chapterNumber(total - 1, lang) });

  return (
    <>
      <div ref={barRef} className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-white/10" role="progressbar" aria-label={t.story.twoWorlds.progress} aria-valuemin={1} aria-valuemax={total} aria-valuenow={active + 1} aria-valuetext={label}>
        <div className="ps-progress-bar h-full w-full" />
        <span aria-hidden="true" className="ps-progress-head" />
      </div>

      <nav aria-label={t.story.twoWorlds.sectionsNav} className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] flex items-end justify-between gap-3 px-3 pb-3 sm:px-6 sm:pb-5">
        <div className="pointer-events-auto flex max-w-[62vw] items-center gap-3 rounded-full border border-white/12 bg-black/55 px-4 py-2 text-[#f4f7ff] shadow-lg backdrop-blur-md">
          <span className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--ps-paper)]/70 uppercase tabular">
            {t.story.twoWorlds.section} {chapterNumber(active, lang)}
            <span className="text-[color:var(--ps-paper)]/40"> / {chapterNumber(total - 1, lang)}</span>
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-white/20" />
          <span className="truncate text-xs font-medium tracking-wide" aria-live="polite">
            {panel?.title[lang]}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button type="button" onClick={onPrev} disabled={active === 0} aria-label={t.story.twoWorlds.previous} className="ps-nav-button">
            <LuChevronLeft aria-hidden="true" />
          </button>
          <ol className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
            {story.panels.map((item, index) => (
              <li key={item.id} className={`h-1.5 rounded-full transition-all duration-500 ${index === active ? "w-6 bg-[color:var(--ps-accent)]" : index < active ? "w-1.5 bg-[color:var(--ps-accent)]/60" : "w-1.5 bg-white/20"}`} />
            ))}
          </ol>
          <button type="button" onClick={onNext} disabled={active === total - 1} aria-label={t.story.twoWorlds.next} className="ps-nav-button">
            <LuChevronRight aria-hidden="true" />
          </button>
          <Link to="/story" aria-label={t.story.twoWorlds.exit} className="ps-nav-button ml-1">
            <LuX aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </>
  );
});
