import gsap from "gsap";

/**
 * One entrance timeline per story panel. Each preset choreographs the `data-ps-*`
 * elements its panel component renders; the names are shared vocabulary between the
 * markup and this file:
 *
 *  data-ps-kicker / data-ps-title / data-ps-para   the narrative column
 *  data-ps-disc / data-ps-stars / data-ps-haze     planetary backdrop layers
 *  data-ps-bg / data-ps-shade                      full-bleed photograph and its darkening veil
 *  data-ps-hero / data-ps-mask / data-ps-pan       photographs revealed through a clip-path
 *  data-ps-rail / data-ps-line / data-ps-bar       rules that draw themselves
 *  data-ps-node / data-ps-date / data-ps-beat      timeline markers, large dates, mission notes
 *  data-ps-card / data-ps-item / data-ps-chip      hardware cards and their rows
 *  data-ps-wave / data-ps-dot / data-ps-event      the signal-loss scene
 *  data-ps-cta / data-ps-resource                  the closing calls to action
 *
 * Timelines are returned paused; the horizontal controller decides when they play.
 * With reduced motion no timeline is built, so every element simply renders in place.
 */
export function buildPanelTimeline(panel: HTMLElement, preset: string): gsap.core.Timeline {
  const q = gsap.utils.selector(panel);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out", duration: 0.9 } });

  const copyRise = (at = 0.3) => {
    tl.from(q("[data-ps-kicker]"), { autoAlpha: 0, y: 14, duration: 0.7 }, at)
      .from(q("[data-ps-title] .story-word"), { autoAlpha: 0, yPercent: 70, rotateX: -35, transformOrigin: "50% 100%", stagger: 0.07, duration: 1 }, at + 0.15)
      .from(q("[data-ps-para]"), { autoAlpha: 0, y: 18, stagger: 0.25, duration: 0.9 }, at + 0.6);
  };
  const copySlide = (at = 0.3) => {
    tl.from(q("[data-ps-kicker]"), { autoAlpha: 0, x: -20, duration: 0.7 }, at)
      .from(q("[data-ps-title] .story-word"), { autoAlpha: 0, xPercent: -40, skewX: 6, stagger: 0.08, duration: 0.9 }, at + 0.15)
      .from(q("[data-ps-para]"), { autoAlpha: 0, x: -26, stagger: 0.25, duration: 0.8 }, at + 0.6);
  };
  const ctas = (at: number, fromX = 0) => {
    tl.from(q("[data-ps-cta]"), { autoAlpha: 0, y: fromX ? 0 : 16, x: fromX, stagger: 0.14, duration: 0.7 }, at).from(q("[data-ps-resource]"), { autoAlpha: 0, y: 12, stagger: 0.06, duration: 0.5 }, at + 0.4);
  };

  switch (preset) {
    /* Moon 01: the Moon rises out of the dark; Earth drifts in from the right. */
    case "lunar-rise":
      tl.from(q("[data-ps-stars]"), { autoAlpha: 0, duration: 2.2, ease: "power1.out" }, 0)
        .from(q("[data-ps-disc]"), { autoAlpha: 0, scale: 0.86, y: 90, duration: 2.6, ease: "power2.out" }, 0)
        .from(q("[data-ps-print]"), { autoAlpha: 0, x: 140, rotate: 9, duration: 1.5 }, 0.9)
        .from(q("[data-ps-cue]"), { autoAlpha: 0, y: 10, duration: 0.6 }, 2.6);
      copyRise(0.5);
      break;

    /* Mars 01: the planet climbs from below the horizon while two haze layers slide at different speeds. */
    case "red-dawn":
      tl.from(q("[data-ps-disc]"), { autoAlpha: 0, yPercent: 45, scale: 1.15, duration: 2.8, ease: "power2.out" }, 0)
        .from(q('[data-ps-haze="a"]'), { autoAlpha: 0, xPercent: -18, duration: 3, ease: "sine.out" }, 0.2)
        .from(q('[data-ps-haze="b"]'), { autoAlpha: 0, xPercent: 22, duration: 3.6, ease: "sine.out" }, 0.4)
        .from(q("[data-ps-print]"), { autoAlpha: 0, scale: 0.7, rotate: -8, duration: 1.3, ease: "back.out(1.4)" }, 1.2)
        .from(q("[data-ps-cue]"), { autoAlpha: 0, y: 10, duration: 0.6 }, 2.6);
      copySlide(0.6);
      break;

    /* Moon 02: a photograph wipes in, then a timeline rail draws and the Surveyors land on it one by one. */
    case "arrivals":
      copyRise(0.2);
      tl.fromTo(q("[data-ps-hero]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power3.inOut" }, 0.3)
        .from(q("[data-ps-hero] img"), { scale: 1.15, duration: 2.2, ease: "power2.out" }, 0.3)
        .from(q("[data-ps-rail]"), { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "power2.inOut" }, 1)
        .from(q("[data-ps-node]"), { scale: 0, stagger: 0.3, duration: 0.5, ease: "back.out(2)" }, 1.2)
        .from(q("[data-ps-date]"), { autoAlpha: 0, y: 24, stagger: 0.3, duration: 0.7 }, 1.3)
        .from(q("[data-ps-beat]"), { autoAlpha: 0, y: 16, stagger: 0.3, duration: 0.7 }, 1.5);
      break;

    /* Moon 03: six years slide into a filmstrip; each photograph opens like an iris. */
    case "apollo":
      copyRise(0.2);
      tl.from(q("[data-ps-rail]"), { scaleX: 0, transformOrigin: "left center", duration: 2, ease: "power2.inOut" }, 0.5)
        .from(q("[data-ps-date]"), { autoAlpha: 0, x: 60, stagger: 0.14, duration: 0.9 }, 0.4)
        .fromTo(q("[data-ps-mask]"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", stagger: 0.16, duration: 1.3, ease: "power3.inOut" }, 0.6)
        .from(q("[data-ps-mask] img"), { scale: 1.2, stagger: 0.16, duration: 1.8, ease: "power2.out" }, 0.6)
        .from(q("[data-ps-beat]"), { autoAlpha: 0, y: 16, stagger: 0.14, duration: 0.7 }, 1.1);
      break;

    /* Mars 02: the ground reveals from the bottom up; labels drop in from above; discovery lines draw. */
    case "landers":
      copySlide(0.2);
      tl.fromTo(q("[data-ps-mask]"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", stagger: 0.25, duration: 1.3, ease: "power3.inOut" }, 0.4)
        .from(q("[data-ps-mask] img"), { yPercent: 12, scale: 1.1, stagger: 0.25, duration: 1.8, ease: "power2.out" }, 0.4)
        .from(q("[data-ps-chip]"), { autoAlpha: 0, y: -30, stagger: 0.25, duration: 0.7 }, 0.9)
        .from(q("[data-ps-date]"), { autoAlpha: 0, y: 14, stagger: 0.25, duration: 0.6 }, 1.1)
        .from(q("[data-ps-line]"), { scaleX: 0, transformOrigin: "left center", stagger: 0.25, duration: 0.8 }, 1.3)
        .from(q("[data-ps-beat]"), { autoAlpha: 0, y: 12, stagger: 0.25, duration: 0.7 }, 1.5);
      break;

    /* Mars 03: panoramas pan open; duration bars grow to each rover's real span; endings arrive last. */
    case "rovers":
      copySlide(0.2);
      tl.fromTo(q("[data-ps-pan]"), { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", stagger: 0.5, duration: 1.5, ease: "power3.inOut" }, 0.3)
        .fromTo(q("[data-ps-pan] img"), { xPercent: -8, scale: 1.12 }, { xPercent: 0, scale: 1, stagger: 0.5, duration: 4, ease: "sine.out" }, 0.3)
        .from(q("[data-ps-portrait]"), { autoAlpha: 0, scale: 0.4, stagger: 0.5, duration: 0.8, ease: "back.out(1.8)" }, 1)
        .from(q("[data-ps-bar]"), { scaleX: 0, transformOrigin: "left center", stagger: 0.5, duration: 1.6, ease: "power2.inOut" }, 1.2)
        .from(q("[data-ps-date]"), { autoAlpha: 0, x: -16, stagger: 0.5, duration: 0.6 }, 1.3)
        .from(q("[data-ps-beat]"), { autoAlpha: 0, y: 12, stagger: 0.5, duration: 0.7 }, 1.5)
        .from(q("[data-ps-end]"), { autoAlpha: 0, x: 16, stagger: 0.5, duration: 0.6 }, 2.4);
      break;

    /* Mars 04: terrain settles behind; instrument cards slide in from the right; annotation chips pop. */
    case "habitability":
      tl.from(q("[data-ps-bg]"), { scale: 1.18, autoAlpha: 0.2, duration: 5, ease: "power1.out" }, 0);
      copySlide(0.3);
      tl.from(q("[data-ps-card]"), { autoAlpha: 0, x: 90, rotateY: -10, transformOrigin: "left center", stagger: 0.22, duration: 1 }, 0.6)
        .fromTo(q("[data-ps-mask]"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", stagger: 0.22, duration: 1.1, ease: "power3.inOut" }, 0.8)
        .from(q("[data-ps-chip]"), { autoAlpha: 0, scale: 0, stagger: 0.12, duration: 0.5, ease: "back.out(2)" }, 1.3);
      break;

    /* Moon 04: the photograph recedes to make room for the scan; callout lines draw toward it. */
    case "instrument-bench":
      tl.fromTo(q("[data-ps-bg]"), { autoAlpha: 0.85, scale: 1.08 }, { autoAlpha: 0.28, scale: 1, duration: 3, ease: "power2.out" }, 0);
      copyRise(0.3);
      tl.from(q("[data-ps-ring]"), { autoAlpha: 0, scale: 0.6, duration: 1.2 }, 0.6)
        .from(q("[data-ps-model]"), { autoAlpha: 0, y: 40, duration: 1.2 }, 0.8)
        .from(q("[data-ps-callout]"), { autoAlpha: 0, x: -24, stagger: 0.25, duration: 0.7 }, 1.2)
        .from(q("[data-ps-callout] [data-ps-line]"), { scaleX: 0, transformOrigin: "left center", stagger: 0.25, duration: 0.6 }, 1.3)
        .from(q("[data-ps-item]"), { autoAlpha: 0, y: 14, stagger: 0.08, duration: 0.6 }, 1.6)
        .from(q("[data-ps-meta]"), { autoAlpha: 0, y: 10, stagger: 0.15, duration: 0.6 }, 2);
      break;

    /* Moon 05: a slow push-in while the light fades; sentences arrive one at a time. */
    case "lunar-dusk":
      tl.fromTo(q("[data-ps-bg]"), { scale: 1.14 }, { scale: 1, duration: 10, ease: "none" }, 0)
        .fromTo(q("[data-ps-shade]"), { autoAlpha: 0.25 }, { autoAlpha: 0.72, duration: 6, ease: "power1.inOut" }, 0.5)
        .from(q("[data-ps-kicker]"), { autoAlpha: 0, duration: 1 }, 0.4)
        .from(q("[data-ps-title] .story-word"), { autoAlpha: 0, y: 20, stagger: 0.12, duration: 1.2, ease: "power2.out" }, 0.8)
        .from(q("[data-ps-para]"), { autoAlpha: 0, y: 14, stagger: 1.1, duration: 1.4, ease: "power2.out" }, 1.6)
        .from(q("[data-ps-col]"), { autoAlpha: 0, y: 30, stagger: 0.4, duration: 1.2 }, 3.4)
        .from(q("[data-ps-event]"), { autoAlpha: 0, duration: 0.8 }, 4.4);
      break;

    /* Mars 05: the waveform appears, each mission's light goes out in turn, the trace flattens. */
    case "signal-loss":
      copySlide(0.2);
      tl.fromTo(q("[data-ps-shade]"), { autoAlpha: 0.3 }, { autoAlpha: 0.78, duration: 7, ease: "power1.inOut" }, 1)
        .from(q("[data-ps-wave] > span"), { scaleY: 0.05, transformOrigin: "center", stagger: { each: 0.03, from: "center" }, duration: 0.6 }, 0.3)
        .from(q("[data-ps-event]"), { autoAlpha: 0, x: 30, stagger: 0.45, duration: 0.8 }, 1)
        .to(q("[data-ps-dot]"), { backgroundColor: "#3a2622", boxShadow: "0 0 0 rgba(0,0,0,0)", stagger: 0.45, duration: 0.5, ease: "power1.inOut" }, 1.4)
        .to(q("[data-ps-wave] > span"), { scaleY: 0.06, stagger: { each: 0.05, from: "random" }, duration: 1.8, ease: "power2.inOut" }, 3.4)
        .from(q("[data-ps-still]"), { autoAlpha: 0, y: 12, duration: 0.9 }, 5.4);
      break;

    /* Moon 06: cards tilt up onto the shelf; their rows follow. */
    case "archive-shelf":
      copyRise(0.2);
      tl.from(q("[data-ps-card]"), { autoAlpha: 0, y: 50, rotateY: -14, transformOrigin: "left center", stagger: 0.08, duration: 0.9 }, 0.4).from(q("[data-ps-card] [data-ps-item]"), { autoAlpha: 0, x: -10, stagger: 0.03, duration: 0.5 }, 0.9);
      break;

    /* Mars 06: category headers lead, cards follow from the right, photographs wipe open. */
    case "red-ledger":
      copySlide(0.2);
      tl.from(q("[data-ps-group]"), { autoAlpha: 0, x: 40, stagger: 0.2, duration: 0.8 }, 0.3)
        .from(q("[data-ps-card]"), { autoAlpha: 0, x: 80, stagger: 0.07, duration: 0.9 }, 0.5)
        .fromTo(q("[data-ps-mask]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", stagger: 0.07, duration: 1, ease: "power3.inOut" }, 0.7);
      break;

    /* Moon 07: the final photograph brightens and settles; the choice appears. */
    case "lunar-dawn":
      tl.fromTo(q("[data-ps-bg]"), { scale: 1.25, autoAlpha: 0.35 }, { scale: 1, autoAlpha: 1, duration: 3.5, ease: "power2.out" }, 0);
      copyRise(0.6);
      ctas(1.8);
      break;

    /* Mars 07: a slow pan across the panorama; the choice slides in. */
    case "red-horizon":
      tl.fromTo(q("[data-ps-bg]"), { xPercent: 6, scale: 1.2, autoAlpha: 0.4 }, { xPercent: 0, scale: 1, autoAlpha: 1, duration: 4, ease: "power2.out" }, 0).from(q('[data-ps-haze="a"]'), { autoAlpha: 0, xPercent: -20, duration: 3 }, 0.3);
      copySlide(0.6);
      ctas(1.8, 24);
      break;

    default:
      copyRise(0.2);
      tl.from(q("[data-ps-card], [data-ps-beat], [data-ps-item]"), { autoAlpha: 0, y: 16, stagger: 0.08, duration: 0.7 }, 0.6);
  }

  return tl;
}
