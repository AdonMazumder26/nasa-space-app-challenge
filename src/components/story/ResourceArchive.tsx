import type { ReactNode } from "react";
import { LuBox, LuCamera, LuDatabase, LuFileText, LuGraduationCap, LuHistory, LuNotebookText } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import type { ResourcesSection } from "../../lib/storyMode";

type ResourceKey = keyof ReturnType<typeof useI18n>["t"]["story"]["resourceItems"];

/**
 * A future resource. `href` stays undefined until a real file or page exists; the card
 * never renders a download control it cannot honour.
 */
export type StoryResource = {
  key: ResourceKey;
  icon: ReactNode;
  href?: string;
};

export const storyResources: StoryResource[] = [
  { key: "factSheets", icon: <LuFileText aria-hidden="true" /> },
  { key: "pdfs", icon: <LuNotebookText aria-hidden="true" /> },
  { key: "photos", icon: <LuCamera aria-hidden="true" /> },
  { key: "timelines", icon: <LuHistory aria-hidden="true" /> },
  { key: "datasets", icon: <LuDatabase aria-hidden="true" /> },
  { key: "models", icon: <LuBox aria-hidden="true" /> },
  { key: "classroom", icon: <LuGraduationCap aria-hidden="true" /> },
];

type Props = { section: ResourcesSection; resources?: StoryResource[] };

export function ResourceArchive({ section, resources = storyResources }: Props) {
  const { t } = useI18n();
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="relative mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24">
      <div className="max-w-2xl" data-story-reveal>
        <p className="story-kicker story-accent">{t.story.resourcesKicker}</p>
        <h3 id={`${section.id}-title`} className="font-display mt-3 text-3xl leading-tight text-[#f4f7ff] sm:text-4xl">
          {t.story.resourcesTitle}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#93a6c9] sm:text-base">{t.story.resourcesBody}</p>
      </div>
      <ul className="story-perspective mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-story-stagger="flip">
        {resources.map((resource) => {
          const label = t.story.resourceItems[resource.key];
          const body = (
            <>
              <span className="story-accent grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/30 text-lg">{resource.icon}</span>
              <span className="mt-5 block font-display text-lg leading-tight text-[#f4f7ff]">{label}</span>
              {!resource.href && (
                <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-[#c5d2ea] uppercase">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#93a6c9]" />
                  {t.story.comingSoon}
                </span>
              )}
            </>
          );
          return (
            <li key={resource.key}>
              {resource.href ? (
                <a href={resource.href} className="story-card block h-full rounded-2xl p-5 transition hover:-translate-y-0.5">
                  {body}
                </a>
              ) : (
                <div className="story-card story-coming-soon h-full rounded-2xl p-5" aria-label={`${label}: ${t.story.comingSoon}`}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
