import { useEffect, useState } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const INTRO_KEY = "abnf-intro";

function seen() {
  try {
    return localStorage.getItem(INTRO_KEY) === "seen";
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_KEY, "seen");
  } catch {
    /* The intro can still close for this visit. */
  }
}

export function ArchiveIntro() {
  const { t } = useI18n();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(() => !seen());

  const close = () => {
    markIntroSeen();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-[#070d1c]/78 px-6 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div className={`max-w-xl text-center ${reduced ? "" : "motion-safe:animate-none"}`}>
        <p id="intro-title" className="font-display text-3xl leading-tight text-[#f4f7ff] sm:text-5xl">
          {t.introLine}
        </p>
        <p className="mt-4 text-sm text-[#c5d2ea]">{t.introCue}</p>
        <button type="button" autoFocus className="mt-6 min-h-11 rounded-full border border-white/20 bg-[#070d1c]/80 px-5 py-2 text-sm text-[#f4f7ff]" onClick={close}>
          {t.skipIntro}
        </button>
      </div>
    </div>
  );
}
