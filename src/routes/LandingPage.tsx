import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArchiveIntro, markIntroSeen } from "../components/layout/ArchiveIntro";
import { PlanetViewport, type SceneHandle } from "../components/planet/PlanetScene";
import { TopBar } from "../components/layout/TopBar";
import { useI18n } from "../features/localization/LanguageContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useSound } from "../hooks/useSound";
import { soundscape } from "../lib/audio";

export function LandingPage() {
  const { t, lang } = useI18n();
  const reduced = usePrefersReducedMotion();
  const sound = useSound();
  const sceneRef = useRef<SceneHandle | null>(null);
  const [surfaceReady, setSurfaceReady] = useState(false);

  useEffect(() => {
    soundscape.setPlanet("moon");
    return () => soundscape.setPlanet(null);
  }, []);

  return (
    <div className="relative h-dvh overflow-hidden">
      <PlanetViewport
        planet="moon"
        objects={[]}
        selectedId={null}
        focusNonce={0}
        emphasisNonce={0}
        intro
        introDelay={250}
        introReady={surfaceReady}
        autoRotate
        reducedMotion={reduced}
        errorMessage={t.sceneError}
        loadingLabel={t.loadingSurface}
        onSurfaceReady={() => setSurfaceReady(true)}
        surfaceError={t.surfaceUnavailable}
        retryLabel={t.retry}
        clusterHint={t.clusterChoose}
        labelFor={(object) => object.name[lang]}
        onSelect={() => undefined}
        onEmptyClick={() => undefined}
        sceneRef={sceneRef}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,transparent_0%,rgba(7,13,28,0.2)_42%,rgba(7,13,28,0.88)_78%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="pointer-events-auto">
          <TopBar sound={{ enabled: sound.enabled, failed: sound.failed, volume: sound.volume, onToggle: sound.toggle, onVolume: sound.setVolume }} />
        </div>
        <main className="pointer-events-none flex flex-1 items-end px-5 pb-10 sm:px-10 sm:pb-16">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.85 }}
            className="max-w-xl"
          >
            <p className="text-[11px] tracking-[0.28em] text-[#f2a64a] uppercase">{t.appKicker}</p>
            <h1 className="font-display mt-3 text-5xl leading-[0.95] text-[#f4f7ff] sm:text-7xl">{t.appTitle}</h1>
            <p className="mt-5 text-lg text-[#f4f7ff]">{t.landingLead}</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#c5d2ea]">{t.landingBody}</p>
            <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
              <Link to="/explore/moon" onClick={markIntroSeen} className="min-h-11 rounded-full bg-[#3d7eff] px-5 py-3 text-sm text-[#f4f7ff]">
                {t.enterMoon}
              </Link>
              <Link to="/explore/mars" onClick={markIntroSeen} className="min-h-11 rounded-full border border-[#f2a64a] px-5 py-3 text-sm text-[#f4f7ff]">
                {t.enterMars}
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#93a6c9]">{t.dragHint}</p>
          </motion.div>
        </main>
      </div>
      <ArchiveIntro />
      {sound.failed && <p className="pointer-events-none absolute right-4 bottom-4 z-30 max-w-xs text-xs text-[#c5d2ea]">{t.audioUnavailable}</p>}
    </div>
  );
}
