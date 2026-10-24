import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuArrowDown, LuArrowLeft, LuArrowUp, LuChevronLeft, LuChevronRight, LuGlobe, LuRefreshCw, LuScanSearch, LuShrink, LuX } from "react-icons/lu";
import { TopBar } from "../components/layout/TopBar";
import { RelicStage } from "../components/relics/RelicStage";
import { preloadRelic } from "../components/relics/RelicModel";
import { artifactModels, modelsInGroup, relicGroups } from "../data/artifactModels";
import { catalog } from "../data/catalog";
import { useI18n } from "../features/localization/LanguageContext";
import { fillCopy } from "../features/localization/strings";
import { useMinWidth, usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSound } from "../hooks/useSound";
import { soundscape } from "../lib/audio";

const STEP_LOCK_MS = 950;
const WHEEL_THRESHOLD = 70;
const INTRO_KEY = "abnf-hall-intro";

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "seen";
  } catch {
    return true;
  }
}

export function RelicsPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduced = usePrefersReducedMotion();
  const desktop = useMinWidth(1024);
  const tablet = useMinWidth(768);
  const coarse = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  const sound = useSound();
  const from = searchParams.get("from");
  const fromObject = from ? catalog.objects.find((object) => object.id === from) ?? null : null;

  const initial = useMemo(() => {
    const requested = artifactModels.find((model) => model.id === searchParams.get("model"));
    const groupIndex = Math.max(0, relicGroups.findIndex((group) => group.id === (requested?.group ?? relicGroups[0].id)));
    const pieces = modelsInGroup(relicGroups[groupIndex].id);
    const pieceIndex = Math.max(0, pieces.findIndex((model) => model.id === requested?.id));
    return { groupIndex, pieceIndex };
    // Only the first render reads the URL; afterwards the page owns the state and writes it back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [groupIndex, setGroupIndex] = useState(initial.groupIndex);
  const [pieceIndex, setPieceIndex] = useState(initial.pieceIndex);
  const [focus, setFocus] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [intro, setIntro] = useState(() => !introSeen());
  const [hintVisible, setHintVisible] = useState(true);
  const lock = useRef(0);
  const wheelAccumulator = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const group = relicGroups[groupIndex];
  const pieces = useMemo(() => modelsInGroup(group.id), [group.id]);
  const piece = pieces[Math.min(pieceIndex, pieces.length - 1)];
  const angleSeed = groupIndex * 7 + pieceIndex;
  const loading = readyUrl !== piece.file;
  const provisional = Boolean(group.provisional || piece.provisional);
  // Honour the piece's own ordering so the first listed object wins, not the first in catalog order.
  const linkedObject = piece.objectIds.map((id) => catalog.objects.find((object) => object.id === id)).find(Boolean) ?? null;

  usePageTitle(`${t.hallOfRelics} · ${piece.name[lang]}`);

  useEffect(() => {
    soundscape.setPlanet("moon");
    return () => soundscape.setPlanet(null);
  }, []);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("model", piece.id);
    if (next.get("model") !== searchParams.get("model")) setSearchParams(next, { replace: true });
  }, [piece.id, searchParams, setSearchParams]);

  // Keep the neighbours warm so a step never shows an empty stage.
  useEffect(() => {
    const neighbours = [
      pieces[pieceIndex + 1],
      pieces[pieceIndex - 1],
      modelsInGroup(relicGroups[(groupIndex + 1) % relicGroups.length].id)[0],
      modelsInGroup(relicGroups[(groupIndex - 1 + relicGroups.length) % relicGroups.length].id)[0],
    ];
    neighbours.forEach((model) => model && preloadRelic(model.file));
  }, [groupIndex, pieceIndex, pieces]);

  const dismissIntro = useCallback(() => {
    setIntro(false);
    try {
      sessionStorage.setItem(INTRO_KEY, "seen");
    } catch {
      /* The intro simply shows again next visit. */
    }
  }, []);

  const goToGroup = useCallback((target: number) => {
    if (target < 0 || target >= relicGroups.length) return;
    lock.current = performance.now() + STEP_LOCK_MS;
    setGroupIndex(target);
    setPieceIndex(0);
    setFocus(false);
    setHintVisible(false);
    soundscape.effect("ui");
  }, []);

  const stepGroup = useCallback(
    (direction: 1 | -1) => {
      const now = performance.now();
      if (now < lock.current) return;
      setGroupIndex((current) => {
        const next = current + direction;
        if (next < 0 || next >= relicGroups.length) return current;
        lock.current = now + STEP_LOCK_MS;
        setPieceIndex(0);
        setFocus(false);
        soundscape.effect("ui");
        return next;
      });
      setHintVisible(false);
    },
    [],
  );

  const stepPiece = useCallback(
    (direction: 1 | -1) => {
      setPieceIndex((current) => {
        const next = current + direction;
        if (next < 0 || next >= pieces.length) return current;
        soundscape.effect("ui");
        return next;
      });
    },
    [pieces.length],
  );

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (intro) return;
      wheelAccumulator.current += event.deltaY;
      if (Math.abs(wheelAccumulator.current) < WHEEL_THRESHOLD) return;
      stepGroup(wheelAccumulator.current > 0 ? 1 : -1);
      wheelAccumulator.current = 0;
    };
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (intro) {
        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") dismissIntro();
        return;
      }
      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          event.preventDefault();
          stepGroup(1);
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          stepGroup(-1);
          break;
        case "ArrowRight":
          stepPiece(1);
          break;
        case "ArrowLeft":
          stepPiece(-1);
          break;
        case "f":
          setFocus((value) => !value);
          break;
        case "Escape":
          if (focus) setFocus(false);
          else navigate(fromObject ? `/explore/${fromObject.planet}?object=${fromObject.id}` : "/");
          break;
        default:
      }
    };
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const origin = touchStart.current;
      const touch = event.changedTouches[0];
      touchStart.current = null;
      if (!origin || !touch || intro) return;
      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      if (Math.abs(dy) > 70 && Math.abs(dy) > Math.abs(dx) * 1.6) stepGroup(dy < 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [intro, focus, stepGroup, stepPiece, dismissIntro, navigate, fromObject]);

  const index = groupIndex + 1;
  const total = relicGroups.length;
  const numberLocale = lang === "bn" ? "bn-BD" : "en-GB";
  const counter = fillCopy(t.relicOf, { index: index.toLocaleString(numberLocale), total: total.toLocaleString(numberLocale) });
  const fade = reduced ? { duration: 0 } : { duration: 0.5, ease: "easeOut" as const };
  const frame = useMemo<[number, number]>(() => (desktop ? [0.2, 0.02] : tablet ? [0.22, 0.08] : [0, 0.18]), [desktop, tablet]);
  const fit = desktop ? 2.05 : tablet ? 1.7 : 1.5;

  return (
    <div className="relative h-dvh overflow-hidden bg-[#05091a] text-[#f4f7ff]">
      <div className="absolute inset-0 z-0">
        <RelicStage url={piece.file} angleSeed={angleSeed} focus={focus} spinning={spinning} reducedMotion={reduced} frame={frame} fit={fit} onReady={setReadyUrl} onUserDrag={() => setHintVisible(false)} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,9,26,0.55)_75%,rgba(5,9,26,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-72 bg-gradient-to-t from-[#05091a] via-[#05091a]/70 to-transparent" />

      <div className="relative z-30">
        <TopBar sound={{ enabled: sound.enabled, failed: sound.failed, volume: sound.volume, onToggle: sound.toggle, onVolume: sound.setVolume }} />
      </div>

      {/* Exhibit counter and leave button */}
      <div className="pointer-events-none absolute top-20 right-4 left-4 z-20 flex items-start justify-between sm:top-24 sm:right-8 sm:left-8">
        <div className="hidden lg:block">
          <p className="story-kicker text-history">{t.hallOfRelics}</p>
          <p className="mt-1 font-mono text-xs text-[#93a6c9]">{counter}</p>
        </div>
        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          {fromObject && (
            <Link to={`/explore/${fromObject.planet}?object=${fromObject.id}`} className="hidden min-h-10 items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 text-xs text-[#f4f7ff] backdrop-blur-md transition hover:border-present sm:inline-flex">
              <LuArrowLeft aria-hidden="true" /> {t.backToStory}
            </Link>
          )}
          <button type="button" onClick={() => navigate(fromObject ? `/explore/${fromObject.planet}?object=${fromObject.id}` : "/")} aria-label={t.leaveHall} title={t.leaveHall} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 text-[#f4f7ff] backdrop-blur-md transition hover:border-loss/60 hover:text-loss">
            <LuX aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Progress rail */}
      <ol className="pointer-events-auto absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 flex-col gap-3 sm:flex" aria-label={t.hallOfRelics}>
        {relicGroups.map((item, itemIndex) => {
          const active = itemIndex === groupIndex;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-label={item.title[lang]}
                aria-current={active ? "step" : undefined}
                onClick={() => goToGroup(itemIndex)}
                className="group flex items-center gap-3"
              >
                <span className={`font-mono text-[10px] transition ${active ? "text-history" : "text-[#4d5c7d] group-hover:text-[#93a6c9]"}`}>{String(itemIndex + 1).padStart(2, "0")}</span>
                <span className={`block h-px transition-all ${active ? "w-8 bg-history" : "w-4 bg-white/25 group-hover:bg-white/50"}`} />
              </button>
            </li>
          );
        })}
      </ol>

      {/* Plate */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-5 sm:px-8 sm:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <AnimatePresence mode="wait">
            <motion.div key={group.id} initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -10, transition: { duration: 0.25 } }} transition={fade} className="pointer-events-auto max-w-xl">
              <p className="story-kicker text-history">
                <span className="lg:hidden">{counter} · </span>
                {group.tagline[lang]}
              </p>
              <h1 className="mt-1.5 font-display text-xl leading-[1.05] tracking-tight text-[#f4f7ff] sm:mt-2 sm:text-3xl lg:text-5xl">{group.title[lang]}</h1>
              <p className={`mt-2 max-w-lg text-sm leading-6 text-[#c5d2ea] lg:mt-3 lg:text-base lg:leading-7 ${desktop ? "" : "line-clamp-2"}`}>{group.blurb[lang]}</p>
              {pieces.length > 1 && (
                <div className="mt-3 lg:mt-4">
                  <p className="story-kicker hidden text-[#93a6c9] lg:block">{t.exhibitPieces}</p>
                  <div className="no-scrollbar mt-0 flex gap-1.5 overflow-x-auto pb-1 lg:mt-2">
                    {pieces.map((item, itemIndex) => {
                      const active = itemIndex === pieceIndex;
                      return (
                        <button key={item.id} type="button" aria-pressed={active} onClick={() => { setPieceIndex(itemIndex); soundscape.effect("ui"); }} className={`shrink-0 rounded-full border px-3 py-1 text-xs transition ${active ? "border-present/70 bg-present/15 text-[#f4f7ff]" : "border-white/10 text-[#93a6c9] hover:border-white/30 hover:text-[#c5d2ea]"}`}>
                          {pieces.length > 6 ? String(itemIndex + 1).padStart(2, "0") : item.name[lang]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className={`mt-3 border-l-2 border-white/10 pl-3 lg:mt-4 ${pieces.length === 1 ? "hidden sm:block" : ""}`}>
                <p className="text-sm font-medium text-[#f4f7ff]">{piece.name[lang]}</p>
                <p className="mt-0.5 text-xs text-[#93a6c9]">
                  {piece.mission[lang]} · {piece.kind[lang]}
                  {provisional && <span className="lg:hidden"> · <span className="text-history/80">{t.precisionLabels.estimated}</span></span>}
                </p>
                {desktop && <p className="mt-2 max-w-md text-xs leading-5 text-[#93a6c9]">{piece.description[lang]}</p>}
                {desktop && provisional && <p className="mt-2 max-w-md text-[11px] leading-4 text-history/80">{t.provisionalIdentity}</p>}
                <p className="mt-1 hidden text-[11px] text-[#6b7a99] lg:mt-2 lg:block">
                  {t.relicSource}:{" "}
                  <a href={piece.sourceUrl} target="_blank" rel="noreferrer noopener" className="text-[#9ec0ff] underline decoration-white/20 underline-offset-2">
                    {piece.sourceLabel[lang]}
                  </a>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-auto flex flex-row flex-wrap items-center gap-3 lg:flex-col lg:items-end">
            {linkedObject && (
              <Link to={`/explore/${linkedObject.planet}?object=${linkedObject.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-history/50 bg-history/10 px-4 text-xs tracking-[0.08em] text-history uppercase transition hover:bg-history/20">
                <LuGlobe aria-hidden="true" /> <span className="hidden sm:inline">{t.seeOnGlobe}</span><span className="sm:hidden">{t.viewArtifact}</span>
              </Link>
            )}
            <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-[#070d1c]/80 p-1 shadow-xl backdrop-blur-md">
              <StageButton label={t.previousRelic} onClick={() => stepGroup(-1)} disabled={groupIndex === 0}>
                <LuArrowUp aria-hidden="true" />
              </StageButton>
              <StageButton label={t.nextRelic} onClick={() => stepGroup(1)} disabled={groupIndex === total - 1}>
                <LuArrowDown aria-hidden="true" />
              </StageButton>
              <span className="mx-1 h-6 w-px bg-white/10" />
              {pieces.length > 1 && (
                <>
                  <StageButton label={t.previousObject} onClick={() => stepPiece(-1)} disabled={pieceIndex === 0}>
                    <LuChevronLeft aria-hidden="true" />
                  </StageButton>
                  <StageButton label={t.nextObject} onClick={() => stepPiece(1)} disabled={pieceIndex === pieces.length - 1}>
                    <LuChevronRight aria-hidden="true" />
                  </StageButton>
                  <span className="mx-1 h-6 w-px bg-white/10" />
                </>
              )}
              <StageButton label={focus ? t.unfocusRelic : t.focusRelic} pressed={focus} onClick={() => setFocus((value) => !value)}>
                {focus ? <LuShrink aria-hidden="true" /> : <LuScanSearch aria-hidden="true" />}
              </StageButton>
              <StageButton label={t.spinRelic} pressed={spinning} onClick={() => setSpinning((value) => !value)}>
                <LuRefreshCw aria-hidden="true" className={spinning ? "" : "opacity-50"} />
              </StageButton>
            </div>
            <p className={`w-full text-[11px] text-[#6b7a99] transition-opacity duration-700 lg:w-auto ${hintVisible ? "opacity-100" : "opacity-0"}`}>{coarse ? t.hallHintTouch : t.hallHint}</p>
          </div>
        </div>
      </div>

      {loading && (
        <p className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] tracking-[0.2em] text-[#c5d2ea] uppercase backdrop-blur-md" role="status">
          {t.modelLoading}
        </p>
      )}

      <AnimatePresence>
        {intro && (
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.6 } }}
            className="absolute inset-0 z-40 grid place-items-center bg-[#05091a]/80 px-6 backdrop-blur-[3px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hall-intro-title"
            onClick={dismissIntro}
          >
            <div className="max-w-2xl text-center">
              <p className="story-kicker text-history">{t.hallKicker}</p>
              <h2 id="hall-intro-title" className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-[#f4f7ff] sm:text-6xl">
                {t.hallOfRelics}
              </h2>
              <p className="mt-5 font-display text-xl leading-snug text-[#e8edf8] sm:text-2xl">{t.hallIntroLine}</p>
              <p className="mt-3 text-sm text-[#93a6c9]">{t.hallIntroCue}</p>
              <button type="button" autoFocus onClick={dismissIntro} className="mt-8 min-h-11 rounded-full bg-[#3d7eff] px-6 text-sm font-medium tracking-wider text-[#f4f7ff] uppercase shadow-[0_0_24px_rgba(61,126,255,0.4)] transition hover:bg-[#528eff]">
                {t.hallEnter}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageButton({ label, onClick, pressed, disabled, children }: { label: string; onClick: () => void; pressed?: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <span className="group relative">
      <button type="button" aria-label={label} title={label} aria-pressed={pressed} disabled={disabled} onClick={onClick} className={`grid h-10 w-10 place-items-center rounded-xl text-sm transition hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent ${pressed ? "bg-present/20 text-present" : "text-[#f4f7ff]"}`}>
        {children}
      </button>
      <span role="tooltip" className="pointer-events-none absolute right-0 bottom-[calc(100%+0.45rem)] z-20 whitespace-nowrap rounded-full border border-white/10 bg-[#070d1c]/95 px-2.5 py-1 text-[11px] text-[#f4f7ff] opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </span>
  );
}
