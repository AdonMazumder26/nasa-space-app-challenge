import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { storyImageUrl, type StoryImage } from "../../data/storyImages";
import type { FinaleSection } from "../../lib/storyMode";
import { Words } from "./StoryPrimitives";

type Props = { section: FinaleSection; moon: StoryImage | undefined; mars: StoryImage | undefined };

/**
 * The last scene. On desktop the viewport pins while the title lifts away and two
 * panels, the Moon and Mars, slide in from either side to fill the screen. Each panel is
 * a door into the interactive atlas. On small screens the panels simply stack.
 */
export function StoryFinale({ section, moon, mars }: Props) {
  const { t, lang } = useI18n();
  const panels = [
    { id: "moon", to: "/explore/moon", image: moon, title: t.story.finaleMoon, line: t.story.finaleMoonLine, accent: "#e2c57a" },
    { id: "mars", to: "/explore/mars", image: mars, title: t.story.finaleMars, line: t.story.finaleMarsLine, accent: "#e07a5f" },
  ] as const;

  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="story-finale relative overflow-hidden" data-story-finale>
      <div className="story-stars" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-dvh max-w-[96rem] flex-col justify-center px-5 pt-24 pb-16 sm:px-8 lg:pt-20 lg:pb-10">
        <div className="relative z-10 mx-auto max-w-2xl text-center" data-story-finale-copy>
          <p className="story-kicker story-accent">{section.kicker[lang]}</p>
          <h3 id={`${section.id}-title`} className="story-display mt-4 text-5xl text-[#f4f7ff] sm:text-6xl lg:text-[clamp(2.5rem,6.5vh,4.5rem)]">
            <Words text={section.title[lang]} plain />
          </h3>
          <p className="mt-5 text-base leading-7 text-[#c5d2ea] sm:text-lg lg:text-[clamp(0.9rem,1.9vh,1.125rem)]">{section.body[lang]}</p>
        </div>

        <div className="story-finale-panels mt-10 grid gap-4 lg:mt-6 lg:flex lg:h-[56vh] lg:min-h-[22rem] lg:gap-4">
          {panels.map((panel) => (
            <Link
              key={panel.id}
              to={panel.to}
              className="story-finale-panel group relative block min-h-[16rem] overflow-hidden rounded-3xl border border-white/10 sm:min-h-[20rem] lg:min-h-0"
              data-story-finale-panel={panel.id}
              style={{ "--panel-accent": panel.accent } as CSSProperties}
              aria-label={`${panel.title}: ${t.story.exploreSurface}`}
            >
              {panel.image && (
                <img
                  src={panel.image.file}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={panel.image.width}
                  height={panel.image.height}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:transition-none"
                />
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,15,0.15),rgba(5,8,15,0.35)_45%,rgba(5,8,15,0.92))]" />
              <div aria-hidden="true" className="story-finale-ring" />
              <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10">
                <p className="story-kicker" style={{ color: panel.accent }}>
                  {t.explore}
                </p>
                <p className="story-display mt-2 text-5xl text-[#f4f7ff] sm:text-6xl lg:text-[clamp(2.5rem,6vh,4rem)]">{panel.title}</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#c5d2ea]">{panel.line}</p>
                <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#f4f7ff] px-5 py-2.5 text-xs font-semibold tracking-[0.18em] text-[#07101f] uppercase transition group-hover:gap-3">
                  {t.story.exploreSurface}
                  <LuArrowRight aria-hidden="true" />
                </span>
                {panel.image && <span className="mt-4 block text-[10px] text-white/50">{panel.image.credit}</span>}
              </div>
            </Link>
          ))}
        </div>

        <p className="relative z-10 mt-8 text-center text-xs text-[#93a6c9]" data-story-finale-foot>
          <Link to="/" className="underline decoration-white/20 underline-offset-4 transition hover:text-[#f4f7ff]">
            {t.story.finaleReturn}
          </Link>
          {moon && mars && (
            <>
              {" · "}
              <a href={storyImageUrl(moon)} target="_blank" rel="noreferrer noopener" className="hover:text-[#f4f7ff]">
                {moon.nasaId}
              </a>
              {" · "}
              <a href={storyImageUrl(mars)} target="_blank" rel="noreferrer noopener" className="hover:text-[#f4f7ff]">
                {mars.nasaId}
              </a>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
