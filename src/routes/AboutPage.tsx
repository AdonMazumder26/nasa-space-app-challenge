import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar";
import { Footer } from "../components/layout/Footer";
import { BRAND } from "../constants/branding";
import { catalog } from "../data/catalog";
import { storyImages, storyImageUrl } from "../data/storyImages";
import { useI18n } from "../features/localization/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { TEXTURE_LON_OFFSET_DEG } from "../lib/coordinates/latLon";

export function AboutPage() {
  const { t, lang } = useI18n();
  const location = useLocation();
  const [pageSection, setPageSection] = useState(() =>
    location.hash === "#sources" ? t.sourcesAndEvidence : t.about,
  );

  useEffect(() => {
    if (location.hash === "#sources") {
      setPageSection(t.sourcesAndEvidence);
    } else {
      setPageSection(t.about);
    }
  }, [location.hash, t.sourcesAndEvidence, t.about]);

  usePageTitle(pageSection);

  const texture = catalog.sources.find((source) => source.id === "texture-credit");
  const sky = catalog.sources.find((source) => source.id === "sky-credit");
  const factual = catalog.sources.filter((source) => source.id !== "texture-credit" && source.id !== "sky-credit");

  return (
    <div className="min-h-dvh flex flex-col justify-between">
      <div>
        <TopBar />
        <main className="mx-auto max-w-3xl px-5 py-10">
          <p className="text-[11px] tracking-[0.22em] text-[#f2a64a] uppercase font-mono">{BRAND.CHALLENGE_LABEL}</p>
          <h1 className="font-display mt-3 text-4xl sm:text-5xl uppercase tracking-tight text-[#f4f7ff]">
            {BRAND.PROJECT_DISPLAY_NAME}
          </h1>
          <p className="mt-4 text-lg sm:text-xl leading-8 text-[#f4f7ff]">{BRAND.PROJECT_SUBTITLE}</p>

          <section className="mt-6 rounded-2xl border border-[#f2a64a]/30 bg-[#f2a64a]/10 p-5 text-sm">
            <p className="text-[11px] font-mono tracking-widest text-[#f2a64a] uppercase">
              Built for NASA Space Apps Challenge 2026 — Challenge 1:
            </p>
            <p className="mt-1.5 text-base font-medium text-[#f4f7ff]">
              “{BRAND.CHALLENGE_NAME}”
            </p>
          </section>

          <section className="mt-8 space-y-4 text-sm leading-relaxed text-[#c5d2ea]">
            <p className="text-base leading-7 text-[#f4f7ff] font-normal">
              {BRAND.CONCEPTUAL_DESCRIPTION}
            </p>
            <p>{t.landingBody}</p>
          </section>

          <section className="mt-10 space-y-3 text-sm leading-6 border-t border-white/10 pt-8">
            <h2 className="font-display text-2xl text-[#f4f7ff]">{t.howToTitle}</h2>
            <p className="text-[#c5d2ea]">{t.howToBody}</p>
            <p className="text-[#c5d2ea]">{t.coordinateNote}</p>
            <p className="text-[#c5d2ea]">
              {t.notLive} Texture longitude offset: {TEXTURE_LON_OFFSET_DEG}°.
            </p>
            <p className="text-[#c5d2ea]">{t.offlineNote}</p>
            <p className="text-[#c5d2ea]">{t.skyNote}</p>
          </section>

          {sky && (
            <section id="credits" className="mt-8 border-t border-white/10 pt-6">
              <h2 className="font-display text-2xl text-[#f4f7ff]">{t.skyCredit}</h2>
              <p className="mt-2 text-sm leading-6 text-[#c5d2ea]">
                <a className="text-[#9ec0ff] underline" href={sky.url} target="_blank" rel="noreferrer noopener">
                  {sky.publisher}
                </a>
                . {sky.notes} {t.externalLink}.
              </p>
            </section>
          )}

          {texture && (
            <section className="mt-8 border-t border-white/10 pt-6">
              <h2 className="font-display text-2xl text-[#f4f7ff]">{t.textureCredit}</h2>
              <p className="mt-2 text-sm leading-6 text-[#c5d2ea]">
                <a className="text-[#9ec0ff] underline" href={texture.url} target="_blank" rel="noreferrer noopener">
                  {texture.publisher}
                </a>
                . {texture.notes} {t.externalLink}.
              </p>
            </section>
          )}

          <section id="story-photos" className="mt-8 border-t border-white/10 pt-6">
            <h2 className="font-display text-2xl text-[#f4f7ff]">{t.aboutStoryTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[#c5d2ea]">{t.aboutStoryBody}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {storyImages.map((image) => (
                <li key={image.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs">
                  <a className="text-[#9ec0ff] underline" href={storyImageUrl(image)} target="_blank" rel="noreferrer noopener">
                    {image.title}
                  </a>
                  <p className="mt-0.5 font-mono text-[10px] tracking-wide text-[#93a6c9]">{image.credit}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="sources" className="mt-8 border-t border-white/10 pt-6">
            <h2 className="font-display text-2xl text-[#f4f7ff]">{t.sourcesAndEvidence}</h2>
            <p className="mt-2 text-xs text-[#93a6c9]">{t.sourcesIntro}</p>
            <ul className="mt-4 space-y-3">
              {factual.map((source) => (
                <li key={source.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                  <a className="text-[#9ec0ff] underline" href={source.url} target="_blank" rel="noreferrer noopener">
                    {source.title}
                  </a>
                  <p className="mt-1 text-xs text-[#93a6c9]">
                    {source.publisher} · {source.accessedDate}
                  </p>
                  {source.notes && <p className="mt-1.5 text-xs text-[#c5d2ea] leading-5">{source.notes}</p>}
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-8 text-sm text-[#93a6c9]">
            {catalog.objects.length} {t.objects.toLowerCase()} · {catalog.missions.length} {t.missions.toLowerCase()} · {lang === "bn" ? "ইংরেজি ও বাংলা" : "English and Bangla"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/explore/moon" className="inline-block rounded-full bg-[#3d7eff] px-6 py-3 text-sm font-medium tracking-wide uppercase text-[#f4f7ff] shadow-[0_0_20px_rgba(61,126,255,0.4)] hover:bg-[#528eff] transition">
              {t.exploreArchive}
            </Link>
            <Link to="/story" className="inline-block rounded-full border border-[#f2a64a]/70 px-6 py-3 text-sm font-medium tracking-wide uppercase text-[#f4f7ff] hover:bg-[#f2a64a]/15 transition">
              {t.aboutStoryCta}
            </Link>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
