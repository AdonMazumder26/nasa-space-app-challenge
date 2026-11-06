import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { LuArrowRight, LuBookOpen } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { planetStoryHref, type PlanetStory } from "../../lib/planetStory";
import { storyImageById } from "../../data/storyImages";

type Props = {
  stories: PlanetStory[];
  reducedMotion: boolean;
};

/**
 * The cinematic fork between the two planet stories. Each door carries its own theme as
 * CSS custom properties; GSAP handles the entrance, pointer parallax, and the hand-off
 * into the chosen world. Everything is readable and clickable before any of that runs.
 */
export function StorySelect({ stories, reducedMotion }: Props) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const leavingRef = useRef(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    const ctx = gsap.context(() => {
      const doors = gsap.utils.toArray<HTMLElement>("[data-select-door]");
      gsap.set("[data-select-label]", { perspective: 600 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-select-heading] > *", { autoAlpha: 0, y: 18, stagger: 0.12, duration: 0.9 }, 0.1);
      doors.forEach((door, index) => {
        const dir = index === 0 ? -1 : 1;
        tl.fromTo(door, { clipPath: `inset(0 ${dir > 0 ? "100%" : "0"} 0 ${dir < 0 ? "100%" : "0"})` }, { clipPath: "inset(0 0% 0 0%)", duration: 1.3, ease: "power4.inOut" }, 0.2 + index * 0.12)
          .from(door.querySelectorAll("[data-select-poster]"), { scale: 1.18, xPercent: dir * 6, duration: 2.2, ease: "power2.out" }, 0.2 + index * 0.12)
          .from(door.querySelectorAll("[data-select-disc]"), { autoAlpha: 0, scale: 0.7, yPercent: 30, duration: 1.6 }, 0.6 + index * 0.12)
          .from(door.querySelectorAll("[data-select-label] span"), { autoAlpha: 0, yPercent: 80, rotateX: -40, transformOrigin: "50% 100%", stagger: 0.05, duration: 0.9 }, 0.8 + index * 0.12)
          .from(door.querySelectorAll("[data-select-copy] > *"), { autoAlpha: 0, y: 16, stagger: 0.1, duration: 0.8 }, 1.1 + index * 0.12);
      });
      tl.from("[data-select-foot]", { autoAlpha: 0, y: 10, duration: 0.6 }, 1.6);

      // Pointer parallax: each layer drifts a little against the cursor, nothing re-renders.
      const movers = doors.map((door) => ({
        poster: gsap.quickTo(door.querySelector("[data-select-poster]"), "x", { duration: 0.9, ease: "power2.out" }),
        disc: gsap.quickTo(door.querySelector("[data-select-disc]"), "x", { duration: 1.2, ease: "power2.out" }),
        discY: gsap.quickTo(door.querySelector("[data-select-disc]"), "y", { duration: 1.2, ease: "power2.out" }),
        glow: gsap.quickTo(door.querySelector("[data-select-glow]"), "x", { duration: 1.4, ease: "power2.out" }),
      }));
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const nx = (event.clientX / window.innerWidth - 0.5) * 2;
        const ny = (event.clientY / window.innerHeight - 0.5) * 2;
        movers.forEach((m) => {
          m.poster(nx * -10);
          m.disc(nx * 22);
          m.discY(ny * 14);
          m.glow(nx * 60);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }, root);
    return () => ctx.revert();
  }, [reducedMotion]);

  const choose = (event: MouseEvent<HTMLAnchorElement>, story: PlanetStory) => {
    if (reducedMotion || leavingRef.current || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    leavingRef.current = true;
    const root = rootRef.current;
    const chosen = root?.querySelector<HTMLElement>(`[data-select-door="${story.planet}"]`);
    const others = Array.from(root?.querySelectorAll<HTMLElement>("[data-select-door]") ?? []).filter((door) => door !== chosen);
    const href = planetStoryHref(story.planet);
    if (!chosen) {
      navigate(href);
      return;
    }
    // The doors' CSS hover transitions would fight the hand-off tween; GSAP drives everything from here.
    root?.classList.add("is-leaving");
    gsap
      .timeline({ defaults: { ease: "power3.inOut" }, onComplete: () => navigate(href) })
      .to(others, { autoAlpha: 0, scale: 0.96, duration: 0.6 }, 0)
      .to("[data-select-heading], [data-select-foot]", { autoAlpha: 0, y: -12, duration: 0.5 }, 0)
      .to(chosen, { flexGrow: 6, duration: 1.1 }, 0.05)
      .to(chosen.querySelector("[data-select-poster]"), { scale: 1.12, duration: 1.4, ease: "power2.inOut" }, 0)
      .to(chosen.querySelector("[data-select-copy]"), { autoAlpha: 0, y: -20, duration: 0.5 }, 0.2)
      .to(chosen.querySelector("[data-select-label]"), { scale: 1.08, autoAlpha: 0, duration: 0.8 }, 0.5)
      .to(chosen.querySelector("[data-select-veil]"), { autoAlpha: 1, duration: 0.7 }, 0.7);
  };

  return (
    <div ref={rootRef} className="ps-select relative flex flex-col bg-[#05070c] text-[#f4f7ff]">
      <div className="pointer-events-none absolute inset-0 story-stars opacity-70" aria-hidden="true" />
      <header data-select-heading className="ps-select-head relative z-10 mx-auto w-full max-w-7xl shrink-0 px-5 pt-[4.5rem] pb-3 text-center sm:px-10 sm:pt-20 sm:pb-4">
        <p className="story-kicker text-[#93a6c9]">{t.story.twoWorlds.kicker}</p>
        <h1 className="story-display ps-title mt-2 text-[#f4f7ff]">{t.story.twoWorlds.title}</h1>
        <p className="ps-note ps-select-intro mx-auto mt-2 max-w-xl text-[#c5d2ea]">{t.story.twoWorlds.intro}</p>
      </header>

      <div className="ps-select-doors relative z-10 flex min-h-0 flex-1 gap-2.5 px-3 sm:px-5 lg:gap-4 lg:px-6" role="list" aria-label={t.story.twoWorlds.chooseLabel}>
        {stories.map((story, index) => {
          const poster = storyImageById(story.posterImageId);
          const label = story.label[lang].toUpperCase();
          return (
            <Link
              key={story.planet}
              role="listitem"
              to={planetStoryHref(story.planet)}
              onClick={(event) => choose(event, story)}
              data-select-door={story.planet}
              className="ps-door group relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden rounded-3xl border border-white/10 p-5 outline-offset-4 sm:p-7 lg:p-9"
              style={
                {
                  "--ps-accent": story.theme.accent,
                  "--ps-accent-soft": story.theme.accentSoft,
                  "--ps-bg": story.theme.bg,
                  "--ps-glow-a": story.theme.glowA,
                  "--ps-glow-b": story.theme.glowB,
                } as CSSProperties
              }
              aria-label={`${story.label[lang]} · ${story.title[lang]}`}
            >
              {poster && (
                <div className="ps-door-poster pointer-events-none absolute inset-0" aria-hidden="true">
                  <img
                    data-select-poster
                    src={poster.file}
                    alt=""
                    width={poster.width}
                    height={poster.height}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div aria-hidden="true" className="ps-door-shade pointer-events-none absolute inset-0" />
              <div aria-hidden="true" data-select-glow className="ps-door-glow pointer-events-none absolute inset-0" />
              {story.theme.dust && <div aria-hidden="true" className="story-dust pointer-events-none" />}
              <div aria-hidden="true" className="ps-door-disc pointer-events-none absolute">
                <div data-select-disc className={`h-full w-full ${story.theme.disc === "moon" ? "story-moon-disc" : "story-mars-disc"}`} />
              </div>
              <div aria-hidden="true" data-select-veil className="pointer-events-none absolute inset-0 opacity-0" style={{ background: story.theme.bgDeep }} />

              <div className="relative">
                <p data-select-label className="ps-door-label font-display text-[clamp(2.75rem,min(10vw,15vh),8.5rem)] leading-[0.85] tracking-[-0.04em] text-[#f4f7ff]" aria-hidden="true">
                  {Array.from(label).map((char, i) => (
                    <span key={i} className="inline-block">
                      {char}
                    </span>
                  ))}
                </p>
                <div data-select-copy className="ps-door-copy mt-3 max-w-xl lg:mt-4">
                  <p className="story-kicker ps-door-kicker" style={{ color: "var(--ps-accent)" }}>
                    {t.story.twoWorlds.storyLabel}
                  </p>
                  <h2 className="font-display ps-door-title mt-1.5 text-xl leading-tight text-[#f4f7ff] sm:text-2xl lg:text-[clamp(1.375rem,2.6vh,1.875rem)]">{story.title[lang]}</h2>
                  <p className="ps-prose ps-door-desc mt-2 hidden text-[#e4e9f3] md:block">{story.description[lang]}</p>
                  <span className="ps-door-cta mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 bg-black/35 px-5 py-2 text-[11px] font-semibold tracking-[0.18em] text-[#f4f7ff] uppercase backdrop-blur-sm sm:text-xs">
                    {story.cta[lang]}
                    <LuArrowRight aria-hidden="true" className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <footer data-select-foot className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-2.5 text-[11px] leading-4 text-[#93a6c9] sm:px-10">
        <p className="ps-select-note min-w-0 flex-1 truncate">{t.story.nasaOnly}</p>
        <Link to="/story/chronicle" className="inline-flex min-h-8 shrink-0 items-center gap-2 underline-offset-4 transition-colors hover:text-[#f4f7ff] hover:underline">
          <LuBookOpen aria-hidden="true" />
          <span>{t.story.twoWorlds.chronicleCta}</span>
          <span className="sr-only">: {t.story.twoWorlds.chronicleLink}</span>
        </Link>
      </footer>
    </div>
  );
}
