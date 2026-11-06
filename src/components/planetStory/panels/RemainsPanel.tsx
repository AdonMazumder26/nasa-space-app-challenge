import { useMemo } from "react";
import { useI18n } from "../../../features/localization/LanguageContext";
import { planetStoryCatalog } from "../../../data/planetStories";
import { resolveRemains, type RemainsPanel as RemainsPanelData, type ResolvedRemainsCard } from "../../../lib/planetStory";
import { formatDisplayDate } from "../../../lib/presentation";
import { lastContactFor } from "../../../lib/story";
import type { RemainCategory } from "../../../lib/storyMode";
import { CoordinateLine, StatusPill } from "../../story/StoryPrimitives";
import { DateLine, ExploreIcon, Narrative, Photo } from "../PlanetStoryPrimitives";

type Props = { panel: RemainsPanelData };

const categoryTone: Record<RemainCategory, string> = {
  active: "text-[#9ec0ff]",
  ended: "text-[#f2c58a]",
  stranded: "text-[#f5a39c]",
  left: "text-[color:var(--ps-accent)]",
};

/** Section 06: the inventory. A wide panel on desktop so the shelf of cards pans past; a vertical list on small screens. */
export function RemainsPanel({ panel }: Props) {
  const { t, lang } = useI18n();
  const cards = useMemo(() => resolveRemains(panel, planetStoryCatalog), [panel]);
  const byCategory = useMemo(() => {
    const map = new Map<RemainCategory, ResolvedRemainsCard[]>();
    for (const card of cards) map.set(card.category, [...(map.get(card.category) ?? []), card]);
    return [...map.entries()];
  }, [cards]);
  const objectCount = cards.reduce((sum, card) => sum + card.items.length, 0);

  return (
    <div className="ps-panel-inner">
      <div className="flex h-full flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="shrink-0 lg:w-[min(28vw,24rem)]">
          <Narrative kicker={panel.kicker} title={panel.title} paragraphs={panel.narrative} titleId={`${panel.id}-title`} />
          <dl className="mt-4 flex gap-8">
            <div>
              <dt className="story-kicker text-[color:var(--ps-paper)]/60">{panel.groupBy === "mission" ? t.story.twoWorlds.sitesCount : t.story.twoWorlds.objectsCount}</dt>
              <dd className="story-big-date ps-date mt-1">{(panel.groupBy === "mission" ? cards.length : objectCount).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB")}</dd>
            </div>
            {panel.groupBy === "mission" && (
              <div>
                <dt className="story-kicker text-[color:var(--ps-paper)]/60">{t.story.twoWorlds.objectsCount}</dt>
                <dd className="story-big-date ps-date mt-1">{objectCount.toLocaleString(lang === "bn" ? "bn-BD" : "en-GB")}</dd>
              </div>
            )}
          </dl>
          <p className="ps-note mt-3 text-[color:var(--ps-paper)]/60">{t.story.twoWorlds.notLive}</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          {byCategory.map(([category, group]) => (
            <section key={category} aria-labelledby={`${panel.id}-${category}`} className="shrink-0 lg:flex lg:items-center lg:gap-4">
              {panel.groupBy === "artifact" && (
                <header data-ps-group className="mb-3 max-w-xs lg:mb-0 lg:w-36 lg:shrink-0">
                  <h3 id={`${panel.id}-${category}`} className={`font-display text-lg leading-tight ${categoryTone[category]}`}>
                    {t.story.remainLabels[category]}
                  </h3>
                  <p className="ps-note mt-1 text-[color:var(--ps-paper)]/75">{t.story.remainBlurbs[category]}</p>
                </header>
              )}
              {panel.groupBy === "mission" && (
                <h3 id={`${panel.id}-${category}`} className="sr-only">
                  {t.story.remainLabels[category]}
                </h3>
              )}
              <ul className="grid gap-3 sm:grid-cols-2 lg:flex lg:gap-4">
                {group.map((card, index) => (panel.groupBy === "mission" ? <SiteCard key={card.key} card={card} index={index} /> : <ObjectCard key={card.key} card={card} />))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Moon · one landing site per card, every object listed with its own link. */
function SiteCard({ card, index }: { card: ResolvedRemainsCard; index: number }) {
  const { t, lang } = useI18n();
  const first = card.items[0];
  if (!first) return null;
  return (
    <li data-ps-card data-ps-drift={index % 2 ? "-1" : "1"} className="flex lg:w-[18rem] lg:shrink-0">
      <div className="story-card flex w-full flex-col rounded-2xl p-3.5">
      <p className="story-kicker text-[color:var(--ps-accent)]">{card.mission?.name[lang]}</p>
      <h4 className="font-display mt-1 text-base leading-tight text-[#f4f7ff]">{first.artifact.location.region ?? first.artifact.location.locationName}</h4>
      <DateLine label={t.story.landed} iso={card.mission?.arrivalDate} className="mt-0.5" />
      {card.image && <Photo image={card.image} fallback={card.mission?.name[lang] ?? ""} className="mt-2.5 aspect-[16/9] max-h-[16vh]" credit={false} />}
      <ul className="mt-2.5 divide-y divide-white/10 border-t border-white/10" aria-label={t.story.twoWorlds.hardwareAtSite}>
        {card.items.map(({ artifact }) => (
          <li key={artifact.id} data-ps-item className="flex items-center justify-between gap-3 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-[13px] text-[#f4f7ff]">{artifact.name[lang]}</p>
              <p className="truncate text-[10px] text-[color:var(--ps-paper)]/60">
                {t.typeLabels[artifact.type]} · <CoordinateLine artifact={artifact} />
              </p>
            </div>
            <ExploreIcon artifact={artifact} />
          </li>
        ))}
      </ul>
      </div>
    </li>
  );
}

/* Mars · one object per card with its photograph, status, and final recorded event. */
function ObjectCard({ card }: { card: ResolvedRemainsCard }) {
  const { t, lang } = useI18n();
  const item = card.items[0];
  if (!item) return null;
  const { artifact, mission } = item;
  const ending = lastContactFor(artifact.id, planetStoryCatalog.events);
  return (
    <li data-ps-card className="flex lg:w-[15.5rem] lg:shrink-0">
      <div className="story-card flex w-full flex-col rounded-2xl p-3">
      <Photo image={card.image} fallback={artifact.name[lang]} className="aspect-[4/3] max-h-[18vh]" frameAttrs={{ "data-ps-mask": "" }} credit={false} />
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <StatusPill status={artifact.status} />
        <ExploreIcon artifact={artifact} />
      </div>
      <h4 className="font-display mt-1.5 text-base leading-tight text-[#f4f7ff]">{artifact.name[lang]}</h4>
      <p className="text-[10px] text-[color:var(--ps-paper)]/70">
        {t.story.twoWorlds.missionLabel} · {mission?.name[lang]}
      </p>
      <p className="mt-1.5 text-[10px] leading-4 text-[color:var(--ps-paper)]/80">
        {artifact.status === "active" ? (
          <>
            <span className="font-mono tracking-[0.14em] uppercase">{t.story.landed}</span> · {mission?.arrivalDate ? formatDisplayDate(mission.arrivalDate, lang) : ""}
          </>
        ) : ending ? (
          <>
            <span className="font-mono tracking-[0.14em] uppercase">{t.story.twoWorlds.lastEvent}</span> · {formatDisplayDate(ending.date, lang)}
          </>
        ) : mission?.endDate ? (
          <>
            <span className="font-mono tracking-[0.14em] uppercase">{t.story.missionEnded}</span> · {formatDisplayDate(mission.endDate, lang)}
          </>
        ) : null}
      </p>
      <p className="mt-0.5 text-[10px]">
        <CoordinateLine artifact={artifact} />
      </p>
      <p className="mt-0.5 truncate text-[10px] text-[color:var(--ps-paper)]/60">{artifact.location.locationName}</p>
      </div>
    </li>
  );
}
