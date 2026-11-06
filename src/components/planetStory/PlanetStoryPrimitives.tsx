import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LuCompass } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import type { StoryImage as SceneImage } from "../../data/storyImages";
import type { Artifact, CatalogImage, Localized } from "../../types/catalog";
import { formatDisplayDate } from "../../lib/presentation";
import { exploreHref } from "../../lib/storyMode";
import { Words } from "../story/StoryPrimitives";

export type AnyImage = SceneImage | CatalogImage;

export const imageSrc = (image: AnyImage) => ("file" in image ? image.file : image.url);

type PhotoProps = {
  image: AnyImage | null;
  /** Placeholder title when there is no photograph. */
  fallback: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  credit?: boolean;
  /** Extra data attributes for the choreography, applied to the clipping frame. */
  frameAttrs?: Record<string, string | undefined>;
  imgAttrs?: Record<string, string | undefined>;
  children?: ReactNode;
};

/** A photograph inside a clipping frame, with an honest placeholder and a one-line credit. */
export function Photo({ image, fallback, className = "", imgClassName = "", priority = false, credit = true, frameAttrs, imgAttrs, children }: PhotoProps) {
  const { lang, t } = useI18n();
  const [failed, setFailed] = useState(false);
  const usable = image && !failed;
  return (
    <figure className={`relative ${className}`}>
      <div className="ps-photo relative h-full w-full overflow-hidden rounded-2xl" {...frameAttrs}>
        {usable ? (
          <img
            src={imageSrc(image)}
            alt={image.alt[lang]}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            width={"width" in image ? image.width : 1600}
            height={"height" in image ? image.height : 1200}
            onError={() => setFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
            {...imgAttrs}
          />
        ) : (
          <div role="img" aria-label={t.story.noPhoto} className="story-placeholder absolute inset-0 grid place-items-center p-5 text-center">
            <div>
              <p className="story-kicker text-[#93a6c9]">{t.story.noPhoto}</p>
              <p className="font-display mt-2 text-lg text-[#f4f7ff]">{fallback}</p>
            </div>
          </div>
        )}
        {children}
      </div>
      {usable && credit && (
        <figcaption className="mt-1.5 truncate text-[10px] leading-4 text-[color:var(--ps-paper)]/70">
          <span className="font-mono tracking-wider uppercase">{t.story.photographLabel}</span> · {image.credit}
        </figcaption>
      )}
    </figure>
  );
}

type NarrativeProps = {
  kicker: Localized;
  title: Localized;
  paragraphs: Localized[];
  titleId: string;
  className?: string;
  titleClassName?: string;
  proseClassName?: string;
};

/** Kicker, title, and paragraphs tagged for the entrance choreography. */
export function Narrative({ kicker, title, paragraphs, titleId, className = "", titleClassName = "", proseClassName = "" }: NarrativeProps) {
  const { lang } = useI18n();
  return (
    <div className={className}>
      <p data-ps-kicker className="story-kicker text-[color:var(--ps-accent)]">
        {kicker[lang]}
      </p>
      <h2 id={titleId} data-ps-title className={`story-display mt-2.5 text-[#f4f7ff] ${titleClassName || "ps-title"}`}>
        <Words text={title[lang]} plain />
      </h2>
      <div className={`mt-3.5 space-y-2.5 text-[color:var(--ps-paper)] ${proseClassName || "ps-prose"}`}>
        {paragraphs.map((paragraph, index) => (
          <p key={index} data-ps-para>
            {paragraph[lang]}
          </p>
        ))}
      </div>
    </div>
  );
}

export function yearOf(iso: string | undefined): string {
  return iso ? iso.slice(0, 4) : "";
}

/** "Landed · 20 Jul 1969" style line from a catalog date. */
export function DateLine({ label, iso, className = "" }: { label: string; iso: string | undefined; className?: string }) {
  const { lang } = useI18n();
  if (!iso) return null;
  return (
    <p className={`plate-date text-[11px] text-[color:var(--ps-paper)]/70 ${className}`}>
      <span className="font-mono tracking-[0.14em] uppercase">{label}</span> · {formatDisplayDate(iso, lang)}
    </p>
  );
}

/** A thin rule that the choreography draws from the left. */
export function Rule({ className = "", attr = "data-ps-line" }: { className?: string; attr?: string }) {
  return <span aria-hidden="true" {...{ [attr]: "" }} className={`block h-px w-full bg-gradient-to-r from-[color:var(--ps-accent)] to-transparent ${className}`} />;
}

/** Icon-only Explore Mode link for dense inventory rows. */
export function ExploreIcon({ artifact }: { artifact: Artifact }) {
  const { t, lang } = useI18n();
  return (
    <Link to={exploreHref(artifact)} aria-label={`${t.story.exploreLocation}: ${artifact.name[lang]}`} title={t.story.exploreLocation} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/30 text-[color:var(--ps-accent)] transition-colors hover:border-[color:var(--ps-accent)] hover:bg-black/50">
      <LuCompass aria-hidden="true" />
    </Link>
  );
}
