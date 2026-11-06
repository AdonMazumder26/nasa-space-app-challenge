import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { buildPanelTimeline } from "../lib/storyChoreography";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export type StoryMode = "pinned" | "native";

type Options = {
  /**
   * "pinned": the story container is pinned and vertical scrolling drives the track
   * sideways (desktop, fine pointer, motion allowed). "native": the container is a real
   * horizontal scroller with scroll snapping (touch devices and reduced motion).
   */
  mode: StoryMode;
  reduced: boolean;
  lang: string;
  panelCount: number;
  onIndex: (index: number) => void;
};

/**
 * Horizontal story controller. Measures the real track width (never a fixed translate),
 * pins the container for exactly that distance, snaps to panel starts (and to each extra
 * viewport inside a wide panel), plays each panel's entrance choreography once as it
 * arrives, and scrubs `data-ps-depth` layers for parallax. Everything lives in one
 * gsap.context so route changes and StrictMode double-mounts revert cleanly.
 */
export function useHorizontalStory(rootRef: RefObject<HTMLElement | null>, trackRef: RefObject<HTMLElement | null>, barRef: RefObject<HTMLElement | null>, { mode, reduced, lang, panelCount, onIndex }: Options) {
  const indexRef = useRef(onIndex);
  indexRef.current = onIndex;
  const goToRef = useRef<(index: number) => void>(() => undefined);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    const panels = Array.from(track.querySelectorAll<HTMLElement>(":scope > [data-ps-panel]"));
    if (panels.length === 0) return;
    const bar = barRef.current;
    const cleanups: Array<() => void> = [];

    let current = -1;
    const setIndex = (index: number) => {
      const next = Math.max(0, Math.min(panels.length - 1, index));
      if (next !== current) {
        current = next;
        indexRef.current(next);
      }
    };
    const setProgress = (progress: number) => bar?.style.setProperty("--ps-progress", Math.max(0, Math.min(1, progress)).toFixed(4));
    /** The panel whose left edge is at or before the centre of the viewport. */
    const activeAt = (x: number) => {
      const centre = x + root.clientWidth / 2;
      let index = 0;
      panels.forEach((panel, i) => {
        if (panel.offsetLeft <= centre) index = i;
      });
      return index;
    };

    const ctx = gsap.context(() => {
      const timelines = reduced ? [] : panels.map((panel) => buildPanelTimeline(panel, panel.dataset.psPreset ?? ""));
      const played = new Set<number>();
      const play = (index: number) => {
        if (played.has(index)) return;
        played.add(index);
        timelines[index]?.play();
      };

      if (mode === "pinned") {
        const distance = () => Math.max(1, track.scrollWidth - root.clientWidth);
        const starts = () => panels.map((panel) => Math.min(1, panel.offsetLeft / distance()));
        const snapPoints = () => {
          const d = distance();
          const width = root.clientWidth;
          const points = new Set<number>([0, 1]);
          panels.forEach((panel) => {
            for (let x = panel.offsetLeft; x < panel.offsetLeft + panel.offsetWidth - 2; x += width) points.add(Math.min(1, x / d));
          });
          return [...points].sort((a, b) => a - b);
        };

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo: (value) => snapPoints().reduce((best, point) => (Math.abs(point - value) < Math.abs(best - value) ? point : best)),
              duration: { min: 0.25, max: 0.8 },
              delay: 0.12,
              ease: "power2.inOut",
              directional: true,
            },
            onUpdate: (self) => {
              setProgress(self.progress);
              setIndex(activeAt(self.progress * distance()));
            },
          },
        });

        panels.forEach((panel, index) => {
          if (index === 0) return;
          ScrollTrigger.create({ trigger: panel, containerAnimation: tween, start: "left 78%", once: true, onEnter: () => play(index) });
        });

        if (!reduced) {
          panels.forEach((panel) => {
            panel.querySelectorAll<HTMLElement>("[data-ps-depth]").forEach((el) => {
              const depth = Number(el.dataset.psDepth ?? 0);
              if (!depth) return;
              gsap.fromTo(el, { xPercent: depth * 60 }, { xPercent: -depth * 60, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
            });
            panel.querySelectorAll<HTMLElement>("[data-ps-drift]").forEach((el) => {
              const dir = Number(el.dataset.psDrift ?? 1) || 1;
              gsap.fromTo(el, { yPercent: dir * 3 }, { yPercent: -dir * 3, ease: "none", scrollTrigger: { trigger: el, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
            });
          });
        }

        let flight: gsap.core.Tween | null = null;
        goToRef.current = (index) => {
          const st = tween.scrollTrigger;
          if (!st) return;
          const target = st.start + (starts()[index] ?? 0) * (st.end - st.start);
          flight?.kill();
          const distancePx = Math.abs(target - window.scrollY);
          flight = gsap.to(window, { scrollTo: { y: target, autoKill: false }, duration: gsap.utils.clamp(0.4, 1.1, distancePx / 2400), ease: "power2.inOut", overwrite: true });
        };
        cleanups.push(() => flight?.kill());

        const settle = () => {
          const st = tween.scrollTrigger;
          if (!st) return;
          setProgress(st.progress);
          const index = activeAt(st.progress * distance());
          setIndex(index);
          play(index);
        };
        ScrollTrigger.refresh();
        settle();
      } else {
        const onScroll = () => {
          const max = root.scrollWidth - root.clientWidth;
          setProgress(max > 0 ? root.scrollLeft / max : 0);
          setIndex(activeAt(root.scrollLeft));
        };
        root.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => root.removeEventListener("scroll", onScroll));

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) play(panels.indexOf(entry.target as HTMLElement));
            });
          },
          { root, threshold: 0.3 },
        );
        panels.forEach((panel, index) => index > 0 && observer.observe(panel));
        cleanups.push(() => observer.disconnect());

        goToRef.current = (index) => root.scrollTo({ left: panels[index]?.offsetLeft ?? 0, behavior: reduced ? "auto" : "smooth" });
        onScroll();
        play(activeAt(root.scrollLeft));
      }
      play(0);
    }, root);

    const onFonts = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onFonts).catch(() => undefined);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
      goToRef.current = () => undefined;
    };
  }, [rootRef, trackRef, barRef, mode, reduced, lang, panelCount]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [lang]);

  return useCallback((index: number) => goToRef.current(index), []);
}
