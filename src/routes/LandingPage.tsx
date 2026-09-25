import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef } from "react";
import { PlanetViewport, type SceneHandle } from "../components/planet/PlanetScene";
import { TopBar } from "../components/layout/TopBar";
import { useI18n } from "../features/localization/LanguageContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export function LandingPage() {
  const { t, lang } = useI18n();
  const reduced = usePrefersReducedMotion();
  const sceneRef = useRef<SceneHandle | null>(null);

  return (
    <div className="relative h-dvh overflow-hidden">
      <PlanetViewport
        planet="moon"
        objects={[]}
        selectedId={null}
        focusNonce={0}
        emphasisNonce={0}
        intro
        autoRotate
        reducedMotion={reduced}
        errorMessage={t.sceneError}
        loadingLabel={t.loadingSurface}
        clusterHint={t.clusterChoose}
        labelFor={(object) => object.name[lang]}
        onSelect={() => undefined}
        onEmptyClick={() => undefined}
        sceneRef={sceneRef}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,transparent_0%,rgba(9,11,16,0.2)_42%,rgba(9,11,16,0.88)_78%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="pointer-events-auto">
          <TopBar />
        </div>
        <main className="pointer-events-none flex flex-1 items-end px-5 pb-10 sm:px-10 sm:pb-16">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.85 }}
            className="max-w-xl"
          >
            <p className="text-[11px] tracking-[0.28em] text-[#e39a62] uppercase">{t.appKicker}</p>
            <h1 className="font-display mt-3 text-5xl leading-[0.95] text-[#f3efe6] sm:text-7xl">{t.appTitle}</h1>
            <p className="mt-5 text-lg text-[#f3efe6]">{t.landingLead}</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#d9d2c6]">{t.landingBody}</p>
            <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
              <Link to="/explore/moon" className="rounded-full bg-[#f3efe6] px-5 py-3 text-sm text-[#1a140f]">
                {t.enterMoon}
              </Link>
              <Link to="/explore/mars" className="rounded-full border border-[#e39a62] px-5 py-3 text-sm text-[#f3efe6]">
                {t.enterMars}
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#b7b0a4]">{t.dragHint}</p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
