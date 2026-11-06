import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LuArrowUpRight, LuBox, LuCompass } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { coordinateParts } from "../../lib/coordinates/latLon";
import { exploreHref, relicHref, storyStatusFor, type StoryStatus } from "../../lib/storyMode";
import type { ArtifactModel } from "../../data/artifactModels";
import type { Artifact, CatalogImage, ObjectStatus, Source } from "../../types/catalog";

const statusTone: Record<StoryStatus, string> = {
  active: "border-[#6aa4ff]/60 bg-[#6aa4ff]/12 text-[#9ec0ff]",
  ended: "border-[#f2a64a]/60 bg-[#f2a64a]/12 text-[#f2c58a]",
  lost: "border-[#f07167]/60 bg-[#f07167]/12 text-[#f5a39c]",
  unconfirmed: "border-white/25 bg-white/5 text-[#c5d2ea]",
};

const statusDot: Record<StoryStatus, string> = {
  active: "bg-[#6aa4ff] shadow-[0_0_10px_#6aa4ff]",
  ended: "bg-[#f2a64a]",
  lost: "bg-[#f07167]",
  unconfirmed: "bg-[#93a6c9]",
};

export function StatusPill({ status, className = "" }: { status: ObjectStatus; className?: string }) {
  const { t } = useI18n();
  const key = storyStatusFor(status);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.14em] uppercase ${statusTone[key]} ${className}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusDot[key]} ${key === "active" ? "story-ping" : ""}`} />
      {t.story.statusLabels[key]}
    </span>
  );
}

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`story-kicker story-accent ${className}`}>{children}</p>;
}

type WordsProps = {
  text: string;
  className?: string;
  /** Words light up one by one as the reader scrolls past (scrubbed) instead of a one-shot reveal. */
  highlight?: boolean;
  /** Split into words but leave the reveal to a parent timeline. */
  plain?: boolean;
};

/** Splits text into words so useStoryAnimations can reveal or highlight them one by one. */
export function Words({ text, className = "", highlight = false, plain = false }: WordsProps) {
  const words = text.split(" ");
  const attrs = highlight ? { "data-story-highlight": "" } : plain ? {} : { "data-story-words": "" };
  return (
    <span {...attrs} className={className}>
      {words.map((word, index) => (
        <span key={`${index}-${word}`}>
          {index > 0 && " "}
          <span className="story-word">{word}</span>
        </span>
      ))}
    </span>
  );
}

type CountProps = {
  value: number;
  /** Starting value for the count-up. Defaults to 0; years usually pass something closer. */
  from?: number;
  grouping?: boolean;
  className?: string;
};

/** Renders the final number immediately; the hook counts up to it when scrolled into view. */
export function CountUp({ value, from = 0, grouping = false, className = "" }: CountProps) {
  const { lang } = useI18n();
  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  return (
    <span className={className} data-story-count={value} data-story-count-from={from} data-story-count-locale={locale} data-story-count-grouping={grouping ? "" : undefined}>
      {value.toLocaleString(locale, { useGrouping: grouping })}
    </span>
  );
}

type ImageProps = {
  image: CatalogImage | null;
  /** Shown when there is no photograph or it fails to load. */
  fallback: { title: string; subtitle?: string };
  className?: string;
  aspect?: string;
  priority?: boolean;
  showCredit?: boolean;
  reveal?: boolean;
  /** Lets the photograph drift inside its frame as the page scrolls. */
  parallax?: number;
};

/** A catalog photograph with lazy loading, fixed aspect ratio, and an honest placeholder. */
export function StoryImage({ image, fallback, className = "", aspect = "aspect-[4/3]", priority = false, showCredit = true, reveal = true, parallax }: ImageProps) {
  const { lang, t } = useI18n();
  const [failed, setFailed] = useState(false);
  const usable = image && !failed;
  return (
    <figure className={`relative ${className}`}>
      <div className={`group/img relative overflow-hidden rounded-2xl ${aspect}`} data-story-image={reveal && usable ? "" : undefined}>
        {usable ? (
          <img
            src={image.url}
            alt={image.alt[lang]}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            width={1600}
            height={1200}
            onError={() => setFailed(true)}
            data-story-parallax={parallax}
            className={`absolute inset-x-0 w-full object-cover transition-[scale] duration-700 ease-out group-hover/img:scale-[1.04] motion-reduce:transition-none ${parallax ? "-top-[8%] h-[116%]" : "inset-y-0 h-full"}`}
          />
        ) : (
          <div role="img" aria-label={t.story.noPhoto} className="story-placeholder absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <p className="story-kicker text-[#93a6c9]">{t.story.noPhoto}</p>
              <p className="mt-3 font-display text-xl text-[#f4f7ff] sm:text-2xl">{fallback.title}</p>
              {fallback.subtitle && <p className="mt-1 font-mono text-xs tracking-wider text-[#93a6c9]">{fallback.subtitle}</p>}
            </div>
          </div>
        )}
      </div>
      {usable && showCredit && (
        <figcaption className="mt-2 text-[11px] leading-5 text-[#93a6c9]">
          <span className="font-mono tracking-wider uppercase">{t.story.photographLabel}</span> · {image.credit}
        </figcaption>
      )}
    </figure>
  );
}

export function CoordinateLine({ artifact }: { artifact: Artifact }) {
  const { t } = useI18n();
  const parts = coordinateParts(artifact.location.latitude, artifact.location.longitude);
  return (
    <span className="plate-value text-[#c5d2ea]">
      {parts.latitude}°{parts.latHemisphere} {parts.longitude}°{parts.lonHemisphere}
      <span className="ml-2 text-[#93a6c9]">· {t.precisionLabels[artifact.location.precision]}</span>
    </span>
  );
}

export function ExploreLink({ artifact, compact = false }: { artifact: Artifact; compact?: boolean }) {
  const { t, lang } = useI18n();
  return (
    <Link
      to={exploreHref(artifact)}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/25 text-[#f4f7ff] backdrop-blur-sm transition hover:border-[var(--story-accent)] hover:bg-black/45 ${compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"}`}
      aria-label={`${t.story.exploreLocation}: ${artifact.name[lang]}`}
    >
      <LuCompass aria-hidden="true" className="story-accent" />
      <span className="font-medium tracking-wide">{t.story.exploreLocation}</span>
      <LuArrowUpRight aria-hidden="true" className="opacity-70" />
    </Link>
  );
}

export function RelicLink({ model }: { model: ArtifactModel }) {
  const { t, lang } = useI18n();
  return (
    <Link
      to={relicHref(model)}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#c5d2ea] transition hover:border-[var(--story-accent)] hover:text-[#f4f7ff]"
      aria-label={`${t.story.viewScan}: ${model.name[lang]}`}
    >
      <LuBox aria-hidden="true" className="story-accent" />
      <span className="font-medium tracking-wide">{t.story.viewScan}</span>
    </Link>
  );
}

export function SourceList({ sources, className = "" }: { sources: Source[]; className?: string }) {
  const { t } = useI18n();
  if (sources.length === 0) return null;
  return (
    <div className={className}>
      <p className="story-kicker text-[#93a6c9]">{t.story.references}</p>
      <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#c5d2ea]">
        {sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer noopener" className="text-[#9ec0ff] underline decoration-[#9ec0ff]/40 underline-offset-2 hover:decoration-[#9ec0ff]">
              {source.title}
            </a>
            <span className="text-[#93a6c9]"> · {source.publisher}</span>
            <span className="sr-only"> ({t.externalLink})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
