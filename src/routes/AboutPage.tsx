import { Link } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar";
import { catalog } from "../data/catalog";
import { useI18n } from "../features/localization/LanguageContext";
import { TEXTURE_LON_OFFSET_DEG } from "../lib/coordinates/latLon";

export function AboutPage() {
  const { t, lang } = useI18n();
  const texture = catalog.sources.find((source) => source.id === "texture-credit");
  const factual = catalog.sources.filter((source) => source.id !== "texture-credit");

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-[11px] tracking-[0.22em] text-[#e39a62] uppercase">{t.about}</p>
        <h1 className="font-display mt-3 text-5xl">{t.appTitle}</h1>
        <p className="mt-4 text-lg leading-8">{t.landingLead}</p>
        <p className="mt-3 text-sm leading-6 text-[#d9d2c6]">{t.landingBody}</p>
        <section className="mt-8 space-y-3 text-sm leading-6">
          <h2 className="font-display text-2xl">{t.howToTitle}</h2>
          <p>{t.howToBody}</p>
          <p>{t.coordinateNote}</p>
          <p>
            {t.notLive} Texture longitude offset: {TEXTURE_LON_OFFSET_DEG}°.
          </p>
          <p>{t.offlineNote}</p>
        </section>
        {texture && (
          <section className="mt-8">
            <h2 className="font-display text-2xl">{t.textureCredit}</h2>
            <p className="mt-2 text-sm leading-6">
              <a className="text-[#e7d3b0] underline" href={texture.url} target="_blank" rel="noreferrer noopener">
                {texture.publisher}
              </a>
              . {texture.notes} {t.externalLink}.
            </p>
          </section>
        )}
        <section className="mt-8">
          <h2 className="font-display text-2xl">{t.sources}</h2>
          <ul className="mt-3 space-y-3">
            {factual.map((source) => (
              <li key={source.id} className="rounded-2xl border border-white/10 px-4 py-3 text-sm">
                <a className="text-[#e7d3b0] underline" href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.title}
                </a>
                <p className="mt-1 text-xs text-[#b7b0a4]">
                  {source.publisher} · {source.accessedDate}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-8 text-sm text-[#b7b0a4]">
          {catalog.objects.length} {t.objects.toLowerCase()} · {catalog.missions.length} {t.mission.toLowerCase()} · {lang === "bn" ? "ইংরেজি ও বাংলা" : "English and Bangla"}
        </p>
        <Link to="/explore/moon" className="mt-6 inline-block rounded-full bg-[#f3efe6] px-5 py-3 text-sm text-[#1a140f]">
          {t.enterMoon}
        </Link>
      </main>
    </div>
  );
}
