import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowRight, LuBox, LuClapperboard, LuGlobe } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";

type Props = {
  reducedMotion: boolean;
  /** Fired when the visitor commits to either mode, so the archive intro does not replay. */
  onEnter?: () => void;
};

/**
 * The two doors on the landing page: the interactive atlas and Story Mode.
 * Kept separate from the hero so a future animated introduction can wrap or precede it.
 */
export function ExperienceModes({ reducedMotion, onEnter }: Props) {
  const { t } = useI18n();
  return (
    <motion.section
      aria-label={t.story.landingKicker}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 1.05 }}
      className="pointer-events-auto mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2"
    >
      <ModeCard
        tone="present"
        icon={<LuGlobe aria-hidden="true" />}
        index="01"
        title={t.story.exploreTitle}
        body={t.story.exploreBody}
        cta={t.story.startExploring}
        to="/explore/moon"
        onEnter={onEnter}
        secondary={[
          { label: t.moon, to: "/explore/moon" },
          { label: t.mars, to: "/explore/mars" },
          { label: t.hallOfRelics, to: "/relics", icon: <LuBox aria-hidden="true" />, hideOnLarge: true },
        ]}
      />
      <ModeCard
        tone="history"
        icon={<LuClapperboard aria-hidden="true" />}
        index="02"
        title={t.story.experienceTitle}
        body={t.story.experienceBody}
        cta={t.story.enter}
        to="/story"
        onEnter={onEnter}
      />
    </motion.section>
  );
}

type Secondary = { label: string; to: string; icon?: ReactNode; hideOnLarge?: boolean };

const tones = {
  present: {
    ring: "hover:border-[#6aa4ff]/60 focus-within:border-[#6aa4ff]/60",
    glow: "bg-[radial-gradient(circle_at_20%_0%,rgba(106,164,255,0.22),transparent_55%)]",
    kicker: "text-[#9ec0ff]",
    button: "bg-[#3d7eff] text-[#f4f7ff] shadow-[0_0_24px_rgba(61,126,255,0.4)] hover:bg-[#528eff]",
  },
  history: {
    ring: "hover:border-[#f2a64a]/60 focus-within:border-[#f2a64a]/60",
    glow: "bg-[radial-gradient(circle_at_20%_0%,rgba(242,166,74,0.2),transparent_55%)]",
    kicker: "text-[#f2a64a]",
    button: "bg-[#f4f7ff] text-[#07101f] hover:bg-white",
  },
} as const;

function ModeCard({
  tone,
  icon,
  index,
  title,
  body,
  cta,
  to,
  onEnter,
  secondary = [],
}: {
  tone: keyof typeof tones;
  icon: ReactNode;
  index: string;
  title: string;
  body: string;
  cta: string;
  to: string;
  onEnter?: () => void;
  secondary?: Secondary[];
}) {
  const style = tones[tone];
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#070d1c]/60 p-4 backdrop-blur-md transition duration-300 sm:p-5 ${style.ring}`}>
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 ${style.glow}`} />
      <div className="relative flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase ${style.kicker}`}>
          <span className="text-base">{icon}</span>
          {index}
        </span>
      </div>
      <h2 className="font-display relative mt-2 text-xl leading-tight text-[#f4f7ff] sm:text-2xl">{title}</h2>
      <p className="relative mt-2 text-xs leading-5 text-[#c5d2ea] sm:text-sm sm:leading-6">{body}</p>
      <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link to={to} onClick={onEnter} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition sm:text-xs ${style.button}`}>
          {cta}
          <LuArrowRight aria-hidden="true" className="transition group-hover:translate-x-0.5" />
        </Link>
        {secondary.length > 0 && (
          <ul className="flex items-center gap-3 text-[11px] tracking-wider text-[#93a6c9] uppercase">
            {secondary.map((item) => (
              <li key={item.to} className={item.hideOnLarge ? "lg:hidden" : ""}>
                <Link to={item.to} onClick={onEnter} className="inline-flex min-h-8 items-center gap-1 underline-offset-4 transition hover:text-[#f4f7ff] hover:underline">
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
