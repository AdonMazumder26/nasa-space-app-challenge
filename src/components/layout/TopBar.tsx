import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LuBookOpen, LuExpand, LuInfo, LuMaximize, LuMoon, LuShrink, LuVolume2, LuVolumeX } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { BRAND } from "../../constants/branding";
import type { PlanetId } from "../../types/catalog";

type Props = {
  planet?: PlanetId;
  onPlanet?: (planet: PlanetId) => void;
  dimmed?: boolean;
  onHelp?: () => void;
  onFullscreen?: () => void;
  focus?: { active: boolean; onToggle: () => void };
  search?: ReactNode;
  sound?: { enabled: boolean; failed: boolean; volume: number; onToggle: () => void; onVolume: (volume: number) => void };
};

export function TopBar({ planet, onPlanet, dimmed = false, onHelp, onFullscreen, focus, search, sound }: Props) {
  const { t, lang, setLang } = useI18n();
  const exitRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (focus?.active) exitRef.current?.focus();
  }, [focus?.active]);
  const focused = Boolean(focus?.active);
  return (
    <header className={`relative z-30 flex h-16 items-center px-2 transition-colors duration-300 sm:px-5 ${dimmed ? "border-b border-white/10 bg-[#070d1c]/38 backdrop-blur-md" : "bg-transparent"}`}>
      <Link to="/" className="flex w-fit flex-col justify-center shrink-0" aria-label={BRAND.PROJECT_NAME}>
        <span className="font-display text-sm font-semibold tracking-wider text-[#f4f7ff] uppercase sm:text-base leading-none">
          {BRAND.PROJECT_DISPLAY_NAME}
        </span>
        <span className="hidden text-[9px] font-mono tracking-[0.2em] text-[#f2a64a] uppercase md:block mt-1">
          {BRAND.CHALLENGE_SHORT}
        </span>
      </Link>
      {planet && onPlanet && (
        <div className="absolute top-[4.25rem] left-3 flex items-center rounded-full border border-white/15 bg-black/45 p-1 shadow-lg backdrop-blur-sm sm:top-auto sm:left-1/2 sm:-translate-x-1/2" role="group" aria-label={t.explore}>
          {(["moon", "mars"] as PlanetId[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={planet === id}
              aria-label={t[id]}
              onClick={() => onPlanet(id)}
              className={`group relative grid h-11 w-11 place-items-center rounded-full transition duration-300 ${planet === id ? "bg-[#3d7eff] text-[#f4f7ff]" : "text-[#c5d2ea] hover:text-[#f4f7ff]"}`}
            >
              {id === "moon" ? <LuMoon aria-hidden="true" /> : <MarsMark />}
              <Tip label={t[id]} />
            </button>
          ))}
        </div>
      )}
      <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
        {search}
        {sound && (
          <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-black/25 p-0.5 backdrop-blur-sm sm:gap-1">
            <NavIcon label={sound.failed ? t.audioUnavailable : sound.enabled ? t.soundOn : t.soundOff} pressed={sound.enabled} onClick={sound.onToggle}>
              {sound.enabled ? <LuVolume2 aria-hidden="true" /> : <LuVolumeX aria-hidden="true" />}
            </NavIcon>
            {sound.enabled && !sound.failed && (
              <input
                type="range"
                className="h-1 w-12 accent-[#6aa4ff] sm:w-20"
                min={0}
                max={1}
                step={0.05}
                value={sound.volume}
                aria-label={t.volume}
                onChange={(event) => sound.onVolume(Number(event.target.value))}
              />
            )}
          </div>
        )}
        {focus && (
          <button
            ref={exitRef}
            type="button"
            aria-pressed={focused}
            aria-label={focused ? t.exitFocus : t.focusMode}
            onClick={focus.onToggle}
            className="group relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/20 text-[#f4f7ff] backdrop-blur-sm"
          >
            {focused ? <LuShrink aria-hidden="true" /> : <LuExpand aria-hidden="true" />}
            <Tip label={focused ? t.exitFocus : t.focusMode} align="end" />
          </button>
        )}
        {!focused && (
          <button
            type="button"
            className="group relative grid h-11 min-w-11 place-items-center rounded-full border border-white/15 bg-black/20 px-2 text-[11px] tracking-wide text-[#f4f7ff] backdrop-blur-sm transition duration-300 hover:border-[#6aa4ff]/60"
            aria-label={t.language}
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
          >
            {lang === "en" ? "বাং" : "EN"}
            <Tip label={t.language} align="end" />
          </button>
        )}
        {!focused && (
          <span className="hidden sm:contents">
            <NavIcon href="/about" label={t.about}>
              <LuBookOpen aria-hidden="true" />
            </NavIcon>
          </span>
        )}
        {!focused && onFullscreen && (
          <span className="hidden sm:contents">
            <NavIcon label={t.fullscreen} onClick={onFullscreen}>
              <LuMaximize aria-hidden="true" />
            </NavIcon>
          </span>
        )}
        {!focused && onHelp && (
          <NavIcon label={t.help} onClick={onHelp}>
            <LuInfo aria-hidden="true" />
          </NavIcon>
        )}
      </div>
    </header>
  );
}

function NavIcon({
  label,
  href,
  onClick,
  pressed,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  const className = `group relative grid h-11 w-11 place-items-center rounded-full border bg-black/20 text-[#f4f7ff] backdrop-blur-sm transition duration-300 hover:border-[#6aa4ff]/60 hover:bg-black/40 ${pressed ? "border-[#6aa4ff]" : "border-white/15"}`;
  const body = (
    <>
      {children}
      <Tip label={label} align="end" />
    </>
  );
  if (href) {
    return (
      <Link to={href} aria-label={label} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick} className={className}>
      {body}
    </button>
  );
}

function Tip({ label, align = "center" }: { label: string; align?: "center" | "end" }) {
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute top-[calc(100%+0.45rem)] z-40 whitespace-nowrap rounded-full border border-white/10 bg-[#070d1c]/92 px-2.5 py-1 text-[11px] tracking-normal text-[#f4f7ff] opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 ${align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"}`}
    >
      {label}
    </span>
  );
}

function MarsMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9.5c1.4-1 3.1-1.4 5-.4 1.6.8 2.8.6 4.2-.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
