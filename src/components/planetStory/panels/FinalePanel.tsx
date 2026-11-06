import { Link } from "react-router-dom";
import { LuArrowLeft, LuCompass } from "react-icons/lu";
import { useI18n } from "../../../features/localization/LanguageContext";
import { storyImageById } from "../../../data/storyImages";
import { explorePlanetHref, type FinalePanel as FinalePanelData, type PlanetStory } from "../../../lib/planetStory";
import { storyResources } from "../../story/ResourceArchive";
import { Narrative } from "../PlanetStoryPrimitives";

type Props = { story: PlanetStory; panel: FinalePanelData };

/** Section 07: a wide closing photograph, the two doors onward, and the resource archive (coming soon). */
export function FinalePanel({ story, panel }: Props) {
  const { t } = useI18n();
  const image = storyImageById(panel.imageId) ?? null;
  const exploreLabel = story.planet === "moon" ? t.story.twoWorlds.exploreMoon3d : t.story.twoWorlds.exploreMars3d;
  return (
    <>
      {image && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img data-ps-bg src={image.file} alt="" width={image.width} height={image.height} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          {story.theme.disc === "mars" && <div data-ps-haze="a" className="ps-haze ps-haze-a absolute" />}
          <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${story.theme.bgDeep} 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)` }} />
        </div>
      )}
      <div className="ps-panel-inner">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-end gap-5 pb-1">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
            <div>
              <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} titleClassName="ps-title-lg" proseClassName="ps-prose-lg max-w-2xl" />
              <div className="mt-5 flex flex-wrap gap-3">
                <Link data-ps-cta to={explorePlanetHref(story.planet)} className="story-cta-glow inline-flex min-h-12 items-center gap-2 rounded-full bg-[#f4f7ff] px-6 py-3 text-xs font-semibold tracking-[0.18em] text-[#07101f] uppercase transition-colors hover:bg-white">
                  <LuCompass aria-hidden="true" />
                  {exploreLabel}
                </Link>
                <Link data-ps-cta to="/story" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-black/35 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-[#f4f7ff] uppercase backdrop-blur-sm transition-colors hover:border-[color:var(--ps-accent)]">
                  <LuArrowLeft aria-hidden="true" />
                  {t.story.twoWorlds.returnToSelection}
                </Link>
              </div>
            </div>

            <section aria-labelledby={`${panel.id}-resources`} className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
              <p data-ps-resource className="story-kicker text-[color:var(--ps-accent)]">
                {t.story.resourcesKicker}
              </p>
              <h3 id={`${panel.id}-resources`} data-ps-resource className="font-display mt-1.5 text-xl text-[#f4f7ff]">
                {t.story.resourcesTitle}
              </h3>
              <p data-ps-resource className="ps-note mt-1.5 text-[color:var(--ps-paper)]/80">
                {t.story.resourcesBody}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {storyResources.map((resource) => {
                  const label = t.story.resourceItems[resource.key];
                  return (
                    <li key={resource.key} data-ps-resource>
                      {resource.href ? (
                        <a href={resource.href} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-[#f4f7ff] transition hover:border-[color:var(--ps-accent)]">
                          <span className="text-[color:var(--ps-accent)]">{resource.icon}</span>
                          {label}
                        </a>
                      ) : (
                        <span className="story-coming-soon inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-[color:var(--ps-paper)]" aria-label={`${label}: ${t.story.comingSoon}`}>
                          <span className="text-[color:var(--ps-accent)]/80">{resource.icon}</span>
                          {label}
                          <span className="font-mono text-[9px] tracking-[0.16em] text-[color:var(--ps-paper)]/60 uppercase">{t.story.comingSoon}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
          <p className="text-[10px] leading-4 text-[color:var(--ps-paper)]/60">
            {t.story.nasaOnly}
            {image && <span className="ml-2">· {image.credit}</span>}
          </p>
        </div>
      </div>
    </>
  );
}
