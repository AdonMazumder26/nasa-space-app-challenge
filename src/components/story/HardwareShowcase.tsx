import type { CSSProperties } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { formatDisplayDate } from "../../lib/presentation";
import { lastContactFor } from "../../lib/story";
import type { HardwareSection, RemainCategory, ResolvedHardwareGroup, ResolvedHardwareItem } from "../../lib/storyMode";
import type { TimelineEvent } from "../../types/catalog";
import { CoordinateLine, ExploreLink, RelicLink, SourceList, StatusPill, StoryImage, Words } from "./StoryPrimitives";

type Props = {
  section: HardwareSection;
  groups: ResolvedHardwareGroup[];
  events: TimelineEvent[];
};

const categoryAccent: Record<RemainCategory, string> = {
  left: "#e2c57a",
  stranded: "#f07167",
  ended: "#f2a64a",
  active: "#6aa4ff",
};

/** Hardware that remains, grouped so "left on purpose" is never confused with "stranded" or "still working". */
export function HardwareShowcase({ section, groups, events }: Props) {
  const { t, lang } = useI18n();
  return (
    <section id={section.id} aria-labelledby={`${section.id}-heading`} className="relative mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24">
      <div className="max-w-2xl">
        <h3 id={`${section.id}-heading`} className="font-display text-3xl leading-tight text-[#f4f7ff] sm:text-4xl">
          <Words text={section.heading[lang]} />
        </h3>
        <div data-story-reveal>
          {section.intro && <p className="mt-3 text-sm leading-6 text-[#93a6c9] sm:text-base">{section.intro[lang]}</p>}
          <p className="mt-3 text-xs leading-5 text-[#93a6c9]">{t.story.landingSiteNote}</p>
        </div>
      </div>

      <div className="mt-12 space-y-16">
        {groups.map((group, index) => {
          const accent = group.category ? categoryAccent[group.category] : undefined;
          return (
            <div key={group.category ?? index} style={accent ? ({ "--story-accent": accent } as CSSProperties) : undefined}>
              {group.category && (
                <div className="mb-6 flex flex-col gap-2 border-l-2 pl-4" style={{ borderColor: accent }} data-story-reveal>
                  <h4 className="font-display text-2xl text-[#f4f7ff] sm:text-3xl">{t.story.remainLabels[group.category]}</h4>
                  <p className="max-w-2xl text-sm leading-6 text-[#93a6c9]">{t.story.remainBlurbs[group.category]}</p>
                </div>
              )}
              <ul className="story-perspective grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-story-stagger="flip">
                {group.items.map((item) => (
                  <HardwareCard key={item.artifact.id} item={item} events={events} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HardwareCard({ item, events }: { item: ResolvedHardwareItem; events: TimelineEvent[] }) {
  const { t, lang } = useI18n();
  const { artifact, mission, sources, relic } = item;
  const silence = lastContactFor(artifact.id, events);
  const endDate = silence?.date ?? mission?.endDate;
  return (
    <li className="story-card flex h-full flex-col overflow-hidden rounded-2xl">
      <StoryImage image={artifact.images[0] ?? null} fallback={{ title: artifact.location.locationName, subtitle: artifact.location.region }} aspect="aspect-[16/10]" showCredit={false} className="[&>div]:rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={artifact.status} />
          <span className="text-[11px] tracking-wider text-[#93a6c9] uppercase">{t[artifact.planet]}</span>
        </div>
        <h5 className="font-display mt-3 text-xl leading-tight text-[#f4f7ff]">{artifact.name[lang]}</h5>
        <p className="mt-1 text-xs text-[#93a6c9]">
          {mission?.name[lang]} · {t.typeLabels[artifact.type]}
        </p>
        <p className="mt-3 text-sm leading-6 text-[#e8edf8]">{artifact.story[lang].whyLeft}</p>
        <dl className="mt-4 space-y-1.5 text-xs text-[#c5d2ea]">
          <div className="flex gap-2">
            <dt className="shrink-0 text-[#93a6c9]">{t.story.location}</dt>
            <dd>{artifact.location.locationName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-[#93a6c9]">{t.story.coordinates}</dt>
            <dd>
              <CoordinateLine artifact={artifact} />
            </dd>
          </div>
          {endDate && artifact.status !== "active" && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-[#93a6c9]">{silence ? t.story.lastContact : t.story.missionEnded}</dt>
              <dd>
                <time dateTime={endDate}>{formatDisplayDate(endDate, lang)}</time>
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <ExploreLink artifact={artifact} compact />
          {relic && <RelicLink model={relic} />}
        </div>
        <SourceList sources={sources} className="mt-5 border-t border-white/10 pt-4" />
      </div>
    </li>
  );
}
