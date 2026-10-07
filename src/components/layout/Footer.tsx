import { Link } from "react-router-dom";
import { BRAND } from "../../constants/branding";
import { useI18n } from "../../features/localization/LanguageContext";

export function Footer() {
  const { t, lang } = useI18n();

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#070d1c]/90 px-5 py-10 text-sm text-[#93a6c9] sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 text-[#f4f7ff] hover:opacity-90">
              <img
                src="/cosmoverse-logo.jpg"
                alt={BRAND.PROJECT_NAME}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20"
              />
              <span className="font-display text-lg font-semibold tracking-wider uppercase text-[#f4f7ff]">
                {BRAND.PROJECT_DISPLAY_NAME}
              </span>
            </Link>
            <p className="text-sm text-[#c5d2ea] leading-relaxed">
              {BRAND.PROJECT_SUBTITLE}
            </p>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5">
              <p className="font-semibold text-[#f2a64a] uppercase tracking-wider text-[10px]">
                {BRAND.CHALLENGE_LABEL}
              </p>
              <p className="mt-1 text-[#c5d2ea]">
                {BRAND.CHALLENGE_NAME}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 sm:gap-12">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#f4f7ff]">
                {t.explore}
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link to="/explore/moon" className="transition hover:text-[#f4f7ff]">
                    {t.moon}
                  </Link>
                </li>
                <li>
                  <Link to="/explore/mars" className="transition hover:text-[#f4f7ff]">
                    {t.mars}
                  </Link>
                </li>
                <li>
                  <Link to="/explore/moon?view=objects" className="transition hover:text-[#f4f7ff]">
                    {t.objects}
                  </Link>
                </li>
                <li>
                  <Link to="/explore/moon?view=timeline" className="transition hover:text-[#f4f7ff]">
                    {t.timeline}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#f4f7ff]">
                {t.about}
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link to="/about" className="transition hover:text-[#f4f7ff]">
                    {t.about}
                  </Link>
                </li>
                <li>
                  <a href="/about#sources" className="transition hover:text-[#f4f7ff]">
                    {t.sourcesAndEvidence}
                  </a>
                </li>
                <li>
                  <a href="/about#credits" className="transition hover:text-[#f4f7ff]">
                    {lang === "bn" ? "স্বীকৃতি ও উৎস" : "Credits & Attribution"}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs leading-5 text-[#93a6c9] sm:flex sm:items-center sm:justify-between">
          <p>
            Historical atlas connecting human artifacts, missions, and coordinates on extraterrestrial surfaces.
          </p>
          <p className="mt-2 sm:mt-0">
            Data sourced from NASA, NSSDCA, LROC & scientific agencies.
          </p>
        </div>
      </div>
    </footer>
  );
}
