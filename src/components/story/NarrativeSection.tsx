import { useI18n } from "../../features/localization/LanguageContext";
import { formatDisplayDate } from "../../lib/presentation";
import type { NarrativeSection as Section } from "../../lib/storyMode";
import type { Artifact, Mission } from "../../types/catalog";
import { CountUp, Words } from "./StoryPrimitives";

type Props = {
  section: Section;
  /** Only needed when `section.stats` is set. */
  missions?: Mission[];
  artifacts?: Artifact[];
};

export function NarrativeSection({ section, missions = [], artifacts = [] }: Props) {
  const { t, lang } = useI18n();
  const arrivals = missions.map((mission) => mission.arrivalDate).filter((date): date is string => Boolean(date)).sort();
  const first = arrivals[0];
  const latest = arrivals.at(-1);

  return (
    <section id={section.id} className="relative mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24" aria-labelledby={section.heading ? `${section.id}-heading` : undefined}>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          {section.kicker && (
            <p className="story-kicker story-accent" data-story-reveal>
              {section.kicker[lang]}
            </p>
          )}
          {section.heading && (
            <h3 id={`${section.id}-heading`} className="font-display mt-3 text-3xl leading-tight text-[#f4f7ff] sm:text-4xl">
              <Words text={section.heading[lang]} />
            </h3>
          )}
          <div className="story-rule mt-6 w-24" aria-hidden="true" data-story-line />
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          {section.highlight ? (
            <div className="story-highlight font-display text-2xl leading-snug text-[#f4f7ff] sm:text-3xl lg:text-4xl">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.en} className="mt-6 first:mt-0">
                  <Words text={paragraph[lang]} highlight />
                </p>
              ))}
            </div>
          ) : (
            <div className="story-prose-lg" data-story-stagger>
              {section.paragraphs.map((paragraph, index) => (
                <p key={paragraph.en} className={index === 0 ? "story-dropcap" : undefined}>
                  {paragraph[lang]}
                </p>
              ))}
            </div>
          )}
          {section.quote && (
            <blockquote className="plate-quote story-accent mt-10 text-3xl sm:text-4xl" data-story-reveal>
              <Words text={section.quote[lang]} />
            </blockquote>
          )}
          {section.stats && missions.length > 0 && (
            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4" data-story-stagger>
              <Stat label={t.story.stats.missions} value={missions.length} />
              <Stat label={t.story.stats.objects} value={artifacts.length} />
              {first && <Stat label={t.story.stats.first} value={Number(first.slice(0, 4))} from={Number(first.slice(0, 4)) - 30} note={formatDisplayDate(first, lang)} />}
              {latest && <Stat label={t.story.stats.latest} value={Number(latest.slice(0, 4))} from={Number(latest.slice(0, 4)) - 30} note={formatDisplayDate(latest, lang)} />}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, from, note }: { label: string; value: number; from?: number; note?: string }) {
  return (
    <div>
      <dt className="story-kicker text-[#93a6c9]">{label}</dt>
      <dd className="story-big-date mt-2 text-4xl sm:text-5xl">
        <CountUp value={value} from={from} />
      </dd>
      {note && <dd className="mt-1 text-xs text-[#93a6c9]">{note}</dd>}
    </div>
  );
}
