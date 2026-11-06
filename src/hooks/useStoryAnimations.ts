import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

type Options = {
  /** From usePrefersReducedMotion. When true no motion is added; tracking still runs. */
  reduced: boolean;
  lang: string;
  onChapter: (index: number) => void;
  onPastOpening: (past: boolean) => void;
};

/**
 * Scroll choreography for Story Mode, driven entirely by data attributes:
 *
 *  data-story-chapter / data-chapter-index   chapter tracking, progress, atmosphere colour
 *  data-story-reveal                         single block fades up once
 *  data-story-stagger[="flip"]               direct children fade up (or flip in) in sequence once
 *  data-story-words                          each .story-word rises in turn once
 *  data-story-count                          number counts up to its value once
 *  data-story-line[="y"]                     rule draws itself (scaleX, or scaleY scrubbed)
 *  data-story-image                          photograph wipes in with a clip-path once
 *  data-story-zoom                           full-bleed photograph settles from 1.12 → 1 (scrubbed)
 *  data-story-parallax="0.12"                background drifts with scroll (scrubbed)
 *  data-story-float                          decorative element bobs gently
 *  data-story-pin                            opening and transition scenes pin on desktop
 *
 * Everything lives in one gsap.context + gsap.matchMedia, so a route change, a
 * StrictMode double-mount, or a breakpoint change reverts cleanly with no leaks.
 * The progress bar is updated through a CSS custom property, never React state.
 */
export function useStoryAnimations(rootRef: RefObject<HTMLElement | null>, barRef: RefObject<HTMLElement | null>, { reduced, lang, onChapter, onPastOpening }: Options) {
  const chapterRef = useRef(onChapter);
  const pastRef = useRef(onPastOpening);
  chapterRef.current = onChapter;
  pastRef.current = onPastOpening;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const bar = barRef.current;
    const atmosphere = root.parentElement?.querySelector<HTMLElement>("[data-story-atmosphere]") ?? null;

    // Animations first: pinned scenes add spacer height, and triggers created after them
    // (or sorted below them) measure against the final layout.
    const mm = gsap.matchMedia(root);

    if (!reduced) {
      mm.add({ desktop: "(min-width: 1024px) and (min-height: 700px)", mobile: "(max-width: 1023px), (max-height: 699px)" }, (context) => {
        const desktop = Boolean(context.conditions?.desktop);
        const q = gsap.utils.selector(root);
        const once = (trigger: Element, start = "top 86%") => ({ trigger, start, once: true });

        // --- Opening scene: a timed entrance, then a short pinned settle on desktop. -----
        const hero = q<HTMLElement>("[data-story-pin]")[0];
        if (hero && !hero.hasAttribute("data-story-transition")) {
          const intro = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
          intro
            .from(q("[data-story-hero-moon]"), { autoAlpha: 0, scale: 0.9, yPercent: 8, duration: 2, ease: "power2.out" }, 0)
            .from(q("[data-story-hero-orbit]"), { autoAlpha: 0, duration: 1.6, stagger: 0.2 }, 0.6)
            .from(q('[data-story-hero="kicker"]'), { autoAlpha: 0, y: 14 }, 0.3)
            .from(q('[data-story-hero="title"] .story-word'), { autoAlpha: 0, yPercent: 60, rotateX: -35, transformOrigin: "50% 100%", duration: 1.1, stagger: 0.09 }, 0.45)
            .from(q('[data-story-hero="sub"]'), { autoAlpha: 0, y: 16 }, 1.1)
            .from(q('[data-story-hero="body"] > p'), { autoAlpha: 0, y: 18, stagger: 0.14 }, 1.25)
            .from(q('[data-story-hero="question"] .story-word'), { autoAlpha: 0, yPercent: 40, stagger: 0.05, duration: 0.8 }, 1.8)
            .from(q('[data-story-hero="cta"]'), { autoAlpha: 0, y: 12 }, 2.2);

          if (desktop) {
            gsap
              .timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "+=55%", pin: true, scrub: 0.6, anticipatePin: 1 } })
              .to(q("[data-story-hero-moon]"), { yPercent: -12, scale: 1.06, ease: "none" }, 0)
              .to(q("[data-story-hero-orbit]"), { autoAlpha: 0.3, ease: "none" }, 0)
              .to(q('[data-story-hero="title"], [data-story-hero="sub"], [data-story-hero="body"]'), { y: -28, autoAlpha: 0.3, ease: "none", stagger: 0.02 }, 0)
              .to(q('[data-story-hero="question"]'), { y: -10, ease: "none" }, 0);
          }
        }

        // --- Moon → Mars hand-off: a trajectory draws itself and a probe rides along it. ---
        const transition = q<HTMLElement>("[data-story-transition]")[0];
        if (transition) {
          const from = transition.querySelector("[data-story-transition-from]");
          const to = transition.querySelector("[data-story-transition-to]");
          const glow = transition.querySelector("[data-story-transition-glow]");
          const path = transition.querySelector<SVGPathElement>("[data-story-trajectory]");
          const probe = transition.querySelector("[data-story-probe]");
          // The trajectory stays dotted (CSS dasharray), so it is revealed with a clip rather than a dash offset.
          if (path) gsap.set(path, { clipPath: "inset(-40% 100% -40% 0)" });

          const build = (tl: gsap.core.Timeline) => {
            tl.fromTo(to, { autoAlpha: 0.25, scale: 0.82, xPercent: 12 }, { autoAlpha: 1, scale: 1, xPercent: 0, ease: "none" }, 0)
              .fromTo(from, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0.35, scale: 0.86, xPercent: -10, ease: "none" }, 0)
              .fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none" }, 0);
            if (path) tl.to(path, { clipPath: "inset(-40% 0% -40% 0)", ease: "none" }, 0);
            if (path && probe) tl.fromTo(probe, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0).to(probe, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true }, ease: "none" }, 0);
            return tl;
          };

          if (desktop && from && to) {
            build(gsap.timeline({ scrollTrigger: { trigger: transition, start: "top top", end: "+=80%", pin: true, scrub: 0.7, anticipatePin: 1 } }));
          } else if (to) {
            build(gsap.timeline({ defaults: { duration: 2.4, ease: "power2.inOut" }, scrollTrigger: { trigger: transition, start: "top 60%", once: true } }));
          }
          const print = transition.querySelector("[data-story-transition-print]");
          if (print) {
            const printTl = desktop
              ? gsap.timeline({ scrollTrigger: { trigger: transition, start: "top top", end: "+=80%", scrub: 0.7 } })
              : gsap.timeline({ scrollTrigger: once(transition, "top 60%") });
            printTl.fromTo(print, { autoAlpha: 0, y: 80, rotate: 14, scale: 0.8 }, { autoAlpha: 1, y: 0, rotate: 5, scale: 1, duration: 0.6, ease: "back.out(1.3)" }, desktop ? 0.45 : 0.8);
          }
        }

        // --- Assembly scenes: the viewport holds while prints fly in from every edge. ------
        q<HTMLElement>("[data-story-assembly]").forEach((scene) => {
          const tiles = Array.from(scene.querySelectorAll<HTMLElement>("[data-story-assembly-tile]"));
          const copy = scene.querySelector("[data-story-assembly-copy]");
          const words = copy?.querySelectorAll(".story-word") ?? [];
          const body = scene.querySelector("[data-story-assembly-body]");
          if (!desktop || tiles.length === 0) {
            if (words.length) gsap.from(words, { autoAlpha: 0, yPercent: 60, stagger: 0.05, duration: 0.8, ease: "power3.out", scrollTrigger: once(scene, "top 75%") });
            return;
          }
          // The tiles' own flip stagger would fight the pinned timeline on desktop; see the stagger loop.
          const tl = gsap.timeline({ scrollTrigger: { trigger: scene, start: "top top", end: "+=170%", pin: true, scrub: 0.8, anticipatePin: 1 } });
          tiles.forEach((tile, index) => {
            const s = getComputedStyle(tile);
            const fromX = parseFloat(s.getPropertyValue("--tile-from-x")) * 0.55;
            const fromY = parseFloat(s.getPropertyValue("--tile-from-y")) * 0.55;
            tl.fromTo(
              tile,
              { x: `${fromX}vw`, y: `${fromY}vh`, rotate: s.getPropertyValue("--tile-from-r").trim(), autoAlpha: 0.15, scale: 0.75 },
              { x: 0, y: 0, rotate: s.getPropertyValue("--tile-r").trim(), autoAlpha: 1, scale: 1, ease: "power2.out", duration: 1 },
              index * 0.1,
            );
          });
          if (words.length) tl.from(words, { autoAlpha: 0, yPercent: 60, scale: 1.15, stagger: 0.04, duration: 0.6, ease: "power3.out" }, 0.45);
          if (body) tl.from(body, { autoAlpha: 0, y: 20, duration: 0.5 }, 1.05);
          // A beat of stillness, then the prints breathe apart so the statement sits alone.
          tl.to(tiles, { scale: 0.94, autoAlpha: 0.45, x: (i) => (i % 2 === 0 ? -40 : 40), duration: 0.6, ease: "power1.inOut", stagger: 0.02 }, 2.1);
        });

        // --- Strip gallery: pinned sideways pan on desktop. ---------------------------------
        q<HTMLElement>("[data-story-strip]").forEach((section) => {
          const track = section.querySelector<HTMLElement>("[data-story-track]");
          if (!desktop || !track) return;
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
          });
          section.querySelectorAll<HTMLElement>("[data-story-strip-item]").forEach((item, index) => {
            gsap.fromTo(item, { yPercent: index % 2 ? 6 : -6 }, { yPercent: index % 2 ? -6 : 6, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, scrub: true } });
          });
        });

        // --- Finale: the title lifts, two worlds slide in from the sides. -------------------
        q<HTMLElement>("[data-story-finale]").forEach((scene) => {
          const copy = scene.querySelector("[data-story-finale-copy]");
          const words = copy?.querySelectorAll(".story-word") ?? [];
          const moon = scene.querySelector('[data-story-finale-panel="moon"]');
          const mars = scene.querySelector('[data-story-finale-panel="mars"]');
          const foot = scene.querySelector("[data-story-finale-foot]");
          if (!desktop) {
            if (words.length) gsap.from(words, { autoAlpha: 0, yPercent: 60, stagger: 0.05, duration: 0.8, ease: "power3.out", scrollTrigger: once(scene, "top 75%") });
            gsap.from([moon, mars].filter(Boolean), { autoAlpha: 0, y: 60, stagger: 0.15, duration: 1, ease: "power3.out", scrollTrigger: once(scene, "top 60%") });
            return;
          }
          const tl = gsap.timeline({ scrollTrigger: { trigger: scene, start: "top top", end: "+=120%", pin: true, scrub: 0.8, anticipatePin: 1 } });
          if (words.length) tl.from(words, { autoAlpha: 0, yPercent: 80, rotateX: -40, stagger: 0.05, duration: 0.6, ease: "power3.out" }, 0);
          tl.fromTo(moon, { xPercent: -70, rotate: -6, autoAlpha: 0, scale: 0.85 }, { xPercent: 0, rotate: 0, autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out" }, 0.5)
            .fromTo(mars, { xPercent: 70, rotate: 6, autoAlpha: 0, scale: 0.85 }, { xPercent: 0, rotate: 0, autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out" }, 0.6)
            .to(copy, { y: -16, scale: 0.92, autoAlpha: 0.9, transformOrigin: "50% 0%", duration: 0.8, ease: "power2.inOut" }, 0.7);
          if (foot) tl.from(foot, { autoAlpha: 0, y: 10, duration: 0.4 }, 1.5);
        });

        // --- Scroll-highlighted statements: each word brightens as it passes mid-screen. ------
        q<HTMLElement>("[data-story-highlight]").forEach((el) => {
          const words = el.querySelectorAll(".story-word");
          if (words.length === 0) return;
          gsap.to(words, { color: "#f4f7ff", stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.3 } });
        });

        // --- Atmosphere: tween the fixed background's colours when a chapter takes over. ----
        if (atmosphere) {
          q<HTMLElement>("[data-story-chapter]").forEach((el) => {
            const vars = { "--story-bg": el.dataset.glowBg, "--story-glow-a": el.dataset.glowA, "--story-glow-b": el.dataset.glowB };
            ScrollTrigger.create({
              trigger: el,
              start: "top 60%",
              end: "bottom 20%",
              onToggle: (self) => {
                if (self.isActive) gsap.to(atmosphere, { ...vars, duration: 1.4, ease: "power2.inOut", overwrite: "auto" });
              },
            });
          });
        }

        // --- Reveals: one-shot triggers that kill themselves after playing. -------------
        q<HTMLElement>("[data-story-reveal]").forEach((el) => {
          gsap.from(el, { autoAlpha: 0, y: desktop ? 28 : 18, duration: 0.9, ease: "power2.out", scrollTrigger: once(el) });
        });

        q<HTMLElement>("[data-story-stagger]").forEach((el) => {
          if (desktop && el.closest("[data-story-assembly]")) return;
          const children = Array.from(el.children).filter((child) => !child.hasAttribute("data-story-words") && !child.querySelector("[data-story-words]"));
          if (children.length === 0) return;
          if (el.dataset.storyStagger === "flip") {
            gsap.set(el, { perspective: 1200 });
            gsap.from(children, { autoAlpha: 0, y: 40, rotateX: -18, transformOrigin: "50% 0%", duration: 1, ease: "power3.out", stagger: 0.1, scrollTrigger: once(el, "top 84%") });
          } else {
            gsap.from(children, { autoAlpha: 0, y: desktop ? 24 : 14, duration: 0.8, ease: "power2.out", stagger: 0.09, scrollTrigger: once(el, "top 84%") });
          }
        });

        q<HTMLElement>("[data-story-words]").forEach((el) => {
          if (el.closest("[data-story-hero]")) return;
          const words = el.querySelectorAll(".story-word");
          if (words.length === 0) return;
          gsap.from(words, { autoAlpha: 0, yPercent: 70, rotateX: -30, transformOrigin: "50% 100%", duration: 0.9, ease: "power3.out", stagger: 0.06, scrollTrigger: once(el, "top 88%") });
        });

        q<HTMLElement>("[data-story-count]").forEach((el) => {
          const value = Number(el.dataset.storyCount);
          const start = Number(el.dataset.storyCountFrom ?? 0);
          const locale = el.dataset.storyCountLocale ?? "en-GB";
          const grouping = el.dataset.storyCountGrouping !== undefined;
          if (!Number.isFinite(value)) return;
          const counter = { n: start };
          // Mutate React's own text node rather than replacing it, so a language switch still re-renders it.
          const node = el.firstChild;
          gsap.to(counter, {
            n: value,
            duration: 1.8,
            ease: "power3.out",
            scrollTrigger: once(el, "top 85%"),
            onUpdate: () => {
              if (node) node.nodeValue = Math.round(counter.n).toLocaleString(locale, { useGrouping: grouping });
            },
          });
        });

        q<HTMLElement>("[data-story-line]").forEach((el) => {
          if (el.dataset.storyLine === "y") {
            gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top 70%", end: "bottom 60%", scrub: 0.4 } });
          } else {
            gsap.from(el, { scaleX: 0, duration: 1.2, ease: "power3.inOut", scrollTrigger: once(el) });
          }
        });

        q<HTMLElement>("[data-story-image]").forEach((el) => {
          const img = el.querySelector("img");
          const tl = gsap.timeline({ scrollTrigger: once(el, "top 82%") });
          tl.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power3.inOut" }, 0);
          if (img && !img.hasAttribute("data-story-parallax")) tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.6, ease: "power2.out" }, 0);
        });

        q<HTMLElement>("[data-story-zoom]").forEach((el) => {
          gsap.fromTo(el, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "top top", scrub: 0.5 } });
        });

        // --- Parallax and floating ornaments: scrubbed, softened on small screens. --------
        q<HTMLElement>("[data-story-parallax]").forEach((el) => {
          const speed = Number(el.dataset.storyParallax ?? 0) * (desktop ? 1 : 0.4);
          if (!speed) return;
          const scope = el.closest("figure") ?? el.parentElement ?? el;
          gsap.fromTo(el, { yPercent: -speed * 50 }, { yPercent: speed * 50, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: true } });
        });

        q<HTMLElement>("[data-story-float]").forEach((el, index) => {
          gsap.to(el, { y: desktop ? 14 : 8, duration: 3.6 + (index % 3) * 0.7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: index * 0.4 });
        });
      });
    } else if (atmosphere) {
      // Reduced motion: still colour the atmosphere per chapter, just without the tween.
      mm.add("all", () => {
        gsap.utils.toArray<HTMLElement>("[data-story-chapter]", root).forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 60%",
            end: "bottom 20%",
            onToggle: (self) => {
              if (self.isActive) gsap.set(atmosphere, { "--story-bg": el.dataset.glowBg, "--story-glow-a": el.dataset.glowA, "--story-glow-b": el.dataset.glowB });
            },
          });
        });
      });
    }

    const ctx = gsap.context(() => {
      // --- Tracking: always on, even with reduced motion. ---------------------------
      const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-story-chapter]"));
      chapters.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          end: "bottom 45%",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) chapterRef.current(Number(el.dataset.chapterIndex ?? 0));
          },
        });
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        refreshPriority: -1,
        onUpdate: (self) => bar?.style.setProperty("--story-progress", self.progress.toFixed(4)),
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top+=480 top",
        end: "max",
        refreshPriority: -1,
        onToggle: (self) => pastRef.current(self.isActive),
      });
    }, root);

    // Pinned scenes must be measured before anything that sits below them.
    ScrollTrigger.sort();

    const onFonts = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onFonts).catch(() => undefined);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [rootRef, barRef, reduced]);

  // Switching language reflows every heading, so measurements must be redone.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [lang]);
}
