import { useI18n } from "../../features/localization/LanguageContext";
import type { GallerySection } from "../../lib/storyMode";
import type { Artifact, Mission } from "../../types/catalog";
import { ExploreLink, StoryImage, Words } from "./StoryPrimitives";

type Props = {
  section: GallerySection;
  items: { artifact: Artifact; mission: Mission | undefined }[];
};

/** A full-width strip of catalog photographs. Artifacts without a photograph are skipped. */
export function MissionGallery({ section, items }: Props) {
  const { t, lang } = useI18n();
  const pictured = items.filter((item) => item.artifact.images.length > 0);
  if (pictured.length === 0) return null;
  const strip = section.layout === "strip";
  return (
    <section id={section.id} aria-labelledby={`${section.id}-heading`} className={`relative py-16 sm:py-24 ${strip ? "story-strip lg:min-h-dvh lg:py-0" : ""}`} data-story-strip={strip ? "" : undefined}>
      <div className={`mx-auto max-w-6xl px-5 sm:px-10 ${strip ? "lg:absolute lg:top-24 lg:right-0 lg:left-0 lg:z-10" : ""}`}>
        <h3 id={`${section.id}-heading`} className="font-display text-3xl leading-tight text-[#f4f7ff] sm:text-4xl">
          <Words text={section.heading[lang]} />
        </h3>
        <div data-story-reveal className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          {section.intro && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#93a6c9] sm:text-base">{section.intro[lang]}</p>}
          {strip && <p className="story-kicker mt-3 hidden text-[#93a6c9] lg:block">{t.story.scrollSideways} →</p>}
        </div>
      </div>
      <ul
        className={`mt-10 grid grid-cols-1 gap-4 px-5 sm:grid-cols-2 sm:px-10 lg:gap-5 xl:px-16 ${strip ? "story-strip-track lg:mt-0 lg:flex lg:h-dvh lg:w-max lg:items-end lg:gap-6 lg:px-[8vw] lg:pb-16" : "lg:grid-cols-3"}`}
        data-story-stagger={strip ? undefined : "flip"}
        data-story-track={strip ? "" : undefined}
      >
        {pictured.map(({ artifact, mission }, index) => (
          <li
            key={artifact.id}
            className={`group relative ${strip ? `lg:shrink-0 ${index % 3 === 0 ? "lg:w-[52vw]" : "lg:w-[34vw]"} ${index % 2 === 1 ? "lg:mb-[10vh]" : ""}` : index % 5 === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
            data-story-strip-item={strip ? "" : undefined}
          >
            <StoryImage image={artifact.images[0]} fallback={{ title: artifact.name[lang] }} aspect={index % 5 === 0 && !strip ? "aspect-[16/9]" : index % 3 === 0 && strip ? "aspect-[16/9]" : "aspect-[4/3]"} showCredit={false} parallax={strip ? undefined : 0.08 + (index % 3) * 0.03} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-[linear-gradient(180deg,transparent,rgba(5,8,15,0.9))] p-4 pt-14 transition-transform duration-500 group-hover:-translate-y-1 motion-reduce:transition-none">
              <p className="font-display text-lg leading-tight text-[#f4f7ff]">{artifact.name[lang]}</p>
              <p className="mt-0.5 text-xs text-[#c5d2ea]">
                {mission?.name[lang]}
                {mission?.arrivalDate ? ` · ${mission.arrivalDate.slice(0, 4)}` : ""}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[#93a6c9]">{artifact.images[0].credit}</p>
            </div>
            <div className="absolute top-3 right-3 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:opacity-100">
              <ExploreLink artifact={artifact} compact />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
