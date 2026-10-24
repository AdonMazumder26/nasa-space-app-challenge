import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { fillCopy } from "../../features/localization/strings";
import { artifactModels, landingRelics, relicGroups } from "../../data/artifactModels";
import { preloadRelic, type RelicPhase } from "./RelicModel";
import { RelicTurntable } from "./RelicTurntable";

type Props = {
  reducedMotion: boolean;
  /** Delay before the vitrine materialises, so the Moon settles first. */
  delayMs?: number;
  onEnter?: () => void;
};

/** How long each relic stays fully materialised before the next one sweeps in. */
const DWELL_MS = 6500;

/**
 * The landing-page doorway into the Hall of Relics: a glass exhibit case, turned slightly
 * away from the viewer, in which featured relics materialise one after another.
 * Hovering swings the case round to face you.
 */
export function LandingRelic({ reducedMotion, delayMs = 1800, onEnter }: Props) {
  const { t, lang } = useI18n();
  const relics = useMemo(() => landingRelics(), []);
  const [show, setShow] = useState(reducedMotion);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<RelicPhase>("in");
  const [sweep, setSweep] = useState(0);
  const dwell = useRef<number | null>(null);

  const relic = relics[shown] ?? artifactModels[0];
  const next = relics[(shown + 1) % relics.length];
  const cycling = !reducedMotion && relics.length > 1;

  useEffect(() => {
    preloadRelic(relic.file);
    if (next) preloadRelic(next.file);
  }, [relic.file, next]);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, reducedMotion]);

  useEffect(() => () => {
    if (dwell.current) window.clearTimeout(dwell.current);
  }, []);

  const handleReady = useCallback(() => {
    setReady(true);
    if (!cycling) return;
    if (dwell.current) window.clearTimeout(dwell.current);
    dwell.current = window.setTimeout(() => setPhase("out"), DWELL_MS);
  }, [cycling]);

  const handleGone = useCallback(() => {
    setShown((current) => (current + 1) % relics.length);
    setPhase("in");
    setSweep((count) => count + 1);
  }, [relics.length]);

  if (!relic) return null;

  const numberLocale = lang === "bn" ? "bn-BD" : "en-GB";
  const exhibit = fillCopy(t.landingVitrineExhibit, {
    index: String(shown + 1).padStart(2, "0"),
    total: String(relics.length).padStart(2, "0"),
  });
  const count = fillCopy(t.landingVitrineCount, {
    groups: relicGroups.length.toLocaleString(numberLocale),
    pieces: artifactModels.length.toLocaleString(numberLocale),
  });

  return (
    <Link
      to={`/relics?model=${relic.id}`}
      onClick={onEnter}
      aria-label={`${t.hallOfRelics}: ${relic.name[lang]}. ${t.landingVitrineEnter}`}
      className={`vitrine group pointer-events-auto absolute right-6 bottom-24 z-20 hidden w-[min(28vw,19.5rem)] lg:block xl:right-10 ${show ? "opacity-100" : "opacity-0"} transition-opacity duration-700`}
    >
      <span className="vitrine-glass relative block overflow-hidden rounded-2xl">
        <span className="vitrine-glint" aria-hidden="true" />

        <span className="relative z-10 flex items-center justify-between gap-3 px-4 pt-3">
          <span className="story-kicker truncate text-history">{t.hallOfRelics}</span>
          <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-[#93a6c9] tabular" aria-label={exhibit}>
            {String(shown + 1).padStart(2, "0")} / {String(relics.length).padStart(2, "0")}
          </span>
        </span>

        <span className="relative block aspect-[5/4]">
          <span className="vitrine-pedestal" aria-hidden="true" />
          <span className="vitrine-pedestal-ring" aria-hidden="true" />
          <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none">
            {show && (
              <RelicTurntable
                url={relic.file}
                reducedMotion={reducedMotion}
                spin={0.3}
                fit={2.15}
                distance={4.1}
                phase={phase}
                className="pointer-events-none"
                onReady={handleReady}
                onGone={handleGone}
              />
            )}
          </span>
          {cycling && show && <span key={sweep} className="vitrine-scanline" aria-hidden="true" />}
        </span>

        <span className={`relative z-10 block border-t border-white/10 px-4 py-3 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>
          <span key={relic.id} className="vitrine-label block">
            <span className="block truncate font-display text-base leading-tight text-[#f4f7ff]">{relic.name[lang]}</span>
            <span className="mt-1 block truncate text-[11px] text-[#93a6c9]">
              {relic.mission[lang]} · {relic.kind[lang]}
            </span>
          </span>
        </span>

        <span className="relative z-10 flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2.5">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            {relics.map((item, index) => (
              <span key={item.id} className={`block h-1 rounded-full transition-all duration-500 ${index === shown ? "w-5 bg-history" : "w-1.5 bg-white/25"}`} />
            ))}
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 text-[11px] font-medium tracking-[0.14em] whitespace-nowrap text-[#f4f7ff] uppercase">
            {t.landingVitrineEnter}
            <span className="grid h-7 w-7 place-items-center rounded-full border border-history/50 text-history transition group-hover:bg-history group-hover:text-[#07101f]">
              <LuArrowRight aria-hidden="true" />
            </span>
          </span>
        </span>
      </span>
      <span className="mt-2 block text-center font-mono text-[10px] tracking-[0.18em] text-[#6b7a99] uppercase">{count}</span>
    </Link>
  );
}
