import { Link } from "react-router-dom";
import { LuBookOpen, LuInfo, LuMaximize, LuMoon } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import type { PlanetId } from "../../types/catalog";

type Props = {
  planet?: PlanetId;
  onPlanet?: (planet: PlanetId) => void;
  dimmed?: boolean;
  onHelp?: () => void;
  onFullscreen?: () => void;
};

export function TopBar({ planet, onPlanet, onHelp, onFullscreen }: Props) {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="relative z-30 flex h-16 items-center bg-transparent px-3 sm:px-5">
      <Link to="/" className="flex w-fit items-center gap-2" aria-label={t.appTitle}>
        <img src="/cosmoverse-logo.jpg" alt="" className="h-12 w-12 rounded-full object-cover ring-1 ring-white/30 shadow-[0_0_28px_rgb(106_164_255_/_0.45)]" />
      </Link>
      {planet && onPlanet && (
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center rounded-full border border-white/15 bg-black/25 p-1 backdrop-blur-sm" role="group" aria-label={t.explore}>
          {(["moon", "mars"] as PlanetId[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={planet === id}
              aria-label={t[id]}
              onClick={() => onPlanet(id)}
              className={`group relative grid h-9 w-11 place-items-center rounded-full transition duration-300 ${planet === id ? "bg-[#3d7eff] text-[#f4f7ff]" : "text-[#c5d2ea] hover:text-[#f4f7ff]"}`}
            >
              {id === "moon" ? <LuMoon aria-hidden="true" /> : <MarsMark />}
              <Tip label={t[id]} />
            </button>
          ))}
        </div>
      )}
      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          className="group relative grid h-9 min-w-9 place-items-center rounded-full border border-white/15 bg-black/20 px-2 text-[11px] tracking-wide text-[#f4f7ff] backdrop-blur-sm transition duration-300 hover:border-[#6aa4ff]/60"
          aria-label={t.language}
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
        >
          {lang === "en" ? "বাং" : "EN"}
          <Tip label={t.language} align="end" />
        </button>
        <NavIcon href="/about" label={t.about}>
          <LuBookOpen aria-hidden="true" />
        </NavIcon>
        {onFullscreen && (
          <NavIcon label={t.fullscreen} onClick={onFullscreen}>
            <LuMaximize aria-hidden="true" />
          </NavIcon>
        )}
        {onHelp && (
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
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className = "group relative grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/20 text-[#f4f7ff] backdrop-blur-sm transition duration-300 hover:border-[#6aa4ff]/60 hover:bg-black/40";
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
    <button type="button" aria-label={label} onClick={onClick} className={className}>
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
