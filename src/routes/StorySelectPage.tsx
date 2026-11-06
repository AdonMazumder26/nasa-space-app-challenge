import { useEffect } from "react";
import { TopBar } from "../components/layout/TopBar";
import { StorySelect } from "../components/planetStory/StorySelect";
import { marsStory, moonStory, planetStoryIssues } from "../data/planetStories";
import { useI18n } from "../features/localization/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useSound } from "../hooks/useSound";
import { soundscape } from "../lib/audio";

export default function StorySelectPage() {
  const { t } = useI18n();
  const reduced = usePrefersReducedMotion();
  const sound = useSound();

  usePageTitle(`${t.story.title} · ${t.story.twoWorlds.title}`);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    soundscape.setPlanet("moon");
    return () => soundscape.setPlanet(null);
  }, []);

  return (
    <div className="ps-select-page relative bg-[#05070c]">
      <div className="fixed inset-x-0 top-0 z-50">
        <TopBar sound={{ enabled: sound.enabled, failed: sound.failed, volume: sound.volume, onToggle: sound.toggle, onVolume: sound.setVolume }} />
      </div>
      {import.meta.env.DEV && planetStoryIssues.length > 0 && (
        <div role="alert" className="fixed inset-x-4 top-20 z-50 mx-auto max-w-3xl rounded-xl border border-[#f07167]/60 bg-[#1a0b0b]/95 p-4 text-sm text-[#f4f7ff]">
          <p className="font-semibold">Story data issues</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs">
            {planetStoryIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      <main>
        <StorySelect stories={[moonStory, marsStory]} reducedMotion={reduced} />
      </main>
      {sound.failed && <p className="pointer-events-none fixed right-4 bottom-4 z-30 max-w-xs text-xs text-[#c5d2ea]">{t.audioUnavailable}</p>}
    </div>
  );
}
