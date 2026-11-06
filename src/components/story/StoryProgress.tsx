import { forwardRef } from "react";
import { LuArrowUp } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { fillCopy } from "../../features/localization/strings";
import type { StoryChapter } from "../../lib/storyMode";
import { chapterNumber } from "./StoryChapter";

type Props = {
  chapters: StoryChapter[];
  activeIndex: number;
  /** Shown once the reader has left the opening scene. */
  showTop: boolean;
  onTop: () => void;
};

/**
 * A thin reading-progress line plus the current chapter. The bar's width is driven by
 * useStoryAnimations through the `--story-progress` custom property on the forwarded ref,
 * so scrolling never re-renders React.
 */
export const StoryProgress = forwardRef<HTMLDivElement, Props>(function StoryProgress({ chapters, activeIndex, showTop, onTop }, barRef) {
  const { t, lang } = useI18n();
  const chapter = chapters[activeIndex];
  const label = fillCopy(t.story.chapterOf, { index: chapterNumber(activeIndex, lang), total: chapterNumber(chapters.length - 1, lang) });

  return (
    <>
      <div ref={barRef} className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-white/10" role="progressbar" aria-label={t.story.progress} aria-valuemin={0} aria-valuemax={chapters.length} aria-valuenow={activeIndex + 1} aria-valuetext={label}>
        <div className="story-progress-bar h-full w-full" />
        <span aria-hidden="true" className="story-progress-head" />
      </div>

      <nav aria-label={t.story.chaptersNav} className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] flex items-end justify-between gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
        <a
          href={chapter ? `#${chapter.id}` : "#"}
          className="pointer-events-auto inline-flex max-w-[70vw] items-center gap-3 rounded-full border border-white/12 bg-[#070d1c]/80 px-4 py-2 text-[#f4f7ff] shadow-lg backdrop-blur-md transition hover:border-white/30"
          aria-current="true"
        >
          <span className="font-mono text-[10px] tracking-[0.22em] text-[#93a6c9] uppercase tabular">
            {t.story.chapter} {chapterNumber(activeIndex, lang)}
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-white/20" />
          <span className="truncate text-xs font-medium tracking-wide" aria-live="polite">
            {chapter?.title[lang]}
          </span>
        </a>
        <button
          type="button"
          onClick={onTop}
          aria-label={t.story.backToTop}
          tabIndex={showTop ? 0 : -1}
          className={`pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#070d1c]/80 text-[#f4f7ff] shadow-lg backdrop-blur-md transition duration-300 hover:border-[#6aa4ff]/60 ${showTop ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <LuArrowUp aria-hidden="true" />
        </button>
      </nav>
    </>
  );
});
