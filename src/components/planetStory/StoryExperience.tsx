import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { TopBar } from "../layout/TopBar";
import { useI18n } from "../../features/localization/LanguageContext";
import { useHorizontalStory, type StoryMode } from "../../hooks/useHorizontalStory";
import { useMedia } from "../../hooks/useMedia";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useSound } from "../../hooks/useSound";
import type { PlanetStory } from "../../lib/planetStory";
import { StoryNav } from "./StoryNav";
import { StoryPanel } from "./StoryPanel";

type Props = { story: PlanetStory };

/**
 * One planet's horizontal story. The theme is applied as CSS custom properties on the root;
 * the controller hook decides between the pinned ScrollTrigger track (desktop) and a native
 * snapping scroller (touch, reduced motion) and reports the active panel back here.
 */
export function StoryExperience({ story }: Props) {
  const { t, lang } = useI18n();
  const reduced = usePrefersReducedMotion();
  const sound = useSound();
  const desktop = useMedia("(min-width: 1024px) and (min-height: 600px) and (pointer: fine)");
  const mode: StoryMode = desktop && !reduced ? "pinned" : "native";

  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  // Where a programmatic move is heading, so quick repeated presses accumulate instead of being swallowed mid-scroll.
  const pendingRef = useRef<number | null>(null);
  const pendingTimer = useRef<number | null>(null);
  const onIndex = useCallback((index: number) => {
    activeRef.current = index;
    if (pendingRef.current === index) pendingRef.current = null;
    setActive(index);
  }, []);

  const goTo = useHorizontalStory(rootRef, trackRef, barRef, { mode, reduced, lang, panelCount: story.panels.length, onIndex });
  const total = story.panels.length;
  const jump = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(total - 1, index));
      pendingRef.current = target;
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
      pendingTimer.current = window.setTimeout(() => (pendingRef.current = null), 1500);
      goTo(target);
    },
    [goTo, total],
  );
  const step = useCallback((delta: number) => jump((pendingRef.current ?? activeRef.current) + delta), [jump]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.classList.add("ps-hide-window-scrollbar");
    return () => document.documentElement.classList.remove("ps-hide-window-scrollbar");
  }, []);

  // Arrow keys move between sections unless the reader is typing somewhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          step(-1);
          break;
        case "Home":
          event.preventDefault();
          jump(0);
          break;
        case "End":
          event.preventDefault();
          jump(total - 1);
          break;
        default:
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, step, total]);

  const themeVars = {
    "--ps-accent": story.theme.accent,
    "--ps-accent-soft": story.theme.accentSoft,
    "--ps-bg": story.theme.bg,
    "--ps-bg-deep": story.theme.bgDeep,
    "--ps-glow-a": story.theme.glowA,
    "--ps-glow-b": story.theme.glowB,
    "--ps-paper": story.theme.paper,
  } as CSSProperties;

  return (
    <div className="ps-root" data-planet={story.planet} style={themeVars}>
      <div className="ps-atmosphere" aria-hidden="true" />
      {story.theme.dust && <div className="story-dust fixed inset-0 z-[1]" aria-hidden="true" />}
      <div className="fixed inset-x-0 top-0 z-50">
        <TopBar sound={{ enabled: sound.enabled, failed: sound.failed, volume: sound.volume, onToggle: sound.toggle, onVolume: sound.setVolume }} />
      </div>

      <main ref={rootRef} className="ps-stage" data-mode={mode} aria-label={`${story.label[lang]} · ${story.title[lang]}`}>
        <div ref={trackRef} className="ps-track">
          {story.panels.map((panel, index) => (
            <StoryPanel key={panel.id} story={story} panel={panel} index={index} total={total} near={Math.abs(index - active) <= 1} mode={mode} reducedMotion={reduced} />
          ))}
        </div>
      </main>

      <StoryNav ref={barRef} story={story} active={active} onPrev={() => step(-1)} onNext={() => step(1)} />
      {sound.failed && <p className="pointer-events-none fixed right-4 bottom-20 z-30 max-w-xs text-xs text-[color:var(--ps-paper)]">{t.audioUnavailable}</p>}
    </div>
  );
}
