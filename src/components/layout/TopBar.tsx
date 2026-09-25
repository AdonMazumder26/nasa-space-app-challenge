import { Link } from "react-router-dom";
import { LuInfo, LuMaximize } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import type { PlanetId } from "../../types/catalog";

type Props = {
  planet?: PlanetId;
  onPlanet?: (planet: PlanetId) => void;
  dimmed?: boolean;
  onHelp?: () => void;
  onFullscreen?: () => void;
};

export function TopBar({ planet, onPlanet, dimmed = false, onHelp, onFullscreen }: Props) {
  const { t, lang, setLang } = useI18n();
  return (
    <header className={`relative z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[#090b10]/80 px-3 backdrop-blur-md transition-opacity duration-500 sm:px-5 ${dimmed ? "opacity-60" : ""}`}>
      <Link to="/" className="min-w-0">
        <p className="text-[10px] tracking-[0.22em] text-[#b7b0a4] uppercase">{t.appKicker}</p>
        <p className="font-display truncate text-lg leading-none text-[#f3efe6]">{t.appTitle}</p>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        {planet && onPlanet && (
          <div className="flex rounded-full border border-white/10 p-1" role="group" aria-label={t.explore}>
            {(["moon", "mars"] as PlanetId[]).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={planet === id}
                onClick={() => onPlanet(id)}
                className={`rounded-full px-3 py-1 text-sm ${planet === id ? "bg-[#f3efe6] text-[#1a140f]" : "text-[#f3efe6]"}`}
              >
                {t[id]}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          className="rounded-full border border-white/15 px-3 py-1 text-sm"
          aria-label={t.language}
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
        >
          {lang === "en" ? "বাংলা" : "English"}
        </button>
        <Link to="/about" className="rounded-full border border-white/15 px-3 py-1 text-sm">
          {t.about}
        </Link>
        {onFullscreen && (
          <button type="button" aria-label={t.fullscreen} title={t.fullscreen} onClick={onFullscreen} className="grid h-8 w-8 place-items-center rounded-full border border-white/15">
            <LuMaximize />
          </button>
        )}
        {onHelp && (
          <button type="button" aria-label={t.help} title={t.help} onClick={onHelp} className="grid h-8 w-8 place-items-center rounded-full border border-white/15">
            <LuInfo />
          </button>
        )}
      </div>
    </header>
  );
}
