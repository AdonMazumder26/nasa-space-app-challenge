import { useI18n } from "../../features/localization/LanguageContext";
import { formatDisplayDate } from "../../lib/presentation";
import type { EventKind, TimelineEvent } from "../../types/catalog";
import { Words } from "./StoryPrimitives";

const kindColor: Record<EventKind, string> = {
  arrival: "var(--color-history)",
  loss: "var(--color-loss)",
  found: "var(--color-present)",
  retired: "var(--color-history)",
  milestone: "#c5d2ea",
};

type Props = {
  events: TimelineEvent[];
  heading?: string;
  intro?: string;
  /** Compact lists sit inside a mission section; the full variant is a chapter section of its own. */
  variant?: "compact" | "full";
  id?: string;
};

export function MissionTimeline({ events, heading, intro, variant = "full", id }: Props) {
  const { lang } = useI18n();
  if (events.length === 0) return null;

  if (variant === "compact") {
    return (
      <ol className="relative space-y-4 border-l border-white/10 pl-5" data-story-stagger aria-label={heading}>
        {events.map((event) => (
          <li key={event.id} className="relative">
            <span aria-hidden="true" className="absolute top-1.5 -left-[1.6rem] h-2.5 w-2.5 rounded-full ring-4 ring-[#05080f]" style={{ background: kindColor[event.kind] }} />
            <time dateTime={event.date} className="plate-date block text-sm text-[#c5d2ea]">
              {formatDisplayDate(event.date, lang)}
            </time>
            <p className="mt-0.5 text-sm font-medium text-[#f4f7ff]">{event.label[lang]}</p>
            <p className="mt-0.5 text-xs leading-5 text-[#93a6c9]">{event.description[lang]}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section id={id} className="relative mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24" aria-labelledby={id ? `${id}-heading` : undefined}>
      <div className="max-w-2xl">
        {heading && (
          <h3 id={id ? `${id}-heading` : undefined} className="font-display text-3xl leading-tight text-[#f4f7ff] sm:text-4xl">
            <Words text={heading} />
          </h3>
        )}
        {intro && (
          <p className="mt-3 text-sm leading-6 text-[#93a6c9] sm:text-base" data-story-reveal>
            {intro}
          </p>
        )}
      </div>
      <div className="relative mt-12">
        <div aria-hidden="true" className="story-timeline-line absolute top-0 bottom-0 left-[7px] w-px sm:left-1/2" data-story-line="y" />
        <ol className="space-y-10 sm:space-y-14">
          {events.map((event, index) => {
            const right = index % 2 === 1;
            return (
              <li key={event.id} className="relative pl-8 sm:grid sm:grid-cols-2 sm:gap-12 sm:pl-0" data-story-reveal>
                <span aria-hidden="true" className="absolute top-2 left-0 h-[15px] w-[15px] rounded-full ring-4 ring-[rgba(5,8,15,0.9)] sm:left-1/2 sm:-translate-x-1/2" style={{ background: kindColor[event.kind], boxShadow: `0 0 16px ${kindColor[event.kind]}` }} />
                <div className={right ? "sm:col-start-2 sm:pl-10" : "sm:pr-10 sm:text-right"}>
                  <time dateTime={event.date} className="plate-date block text-2xl text-[#f4f7ff] sm:text-3xl">
                    {formatDisplayDate(event.date, lang)}
                  </time>
                  <p className="mt-2 text-base font-medium text-[#f4f7ff]">{event.label[lang]}</p>
                  <p className={`mt-1 max-w-md text-sm leading-6 text-[#93a6c9] ${right ? "" : "sm:ml-auto"}`}>{event.description[lang]}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
