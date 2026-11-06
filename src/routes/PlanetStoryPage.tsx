import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { StoryExperience } from "../components/planetStory/StoryExperience";
import { planetStories, planetStoryIssues } from "../data/planetStories";
import { useI18n } from "../features/localization/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { isStoryPlanet } from "../lib/planetStory";
import { soundscape } from "../lib/audio";

export default function PlanetStoryPage() {
  const { planet } = useParams();
  const { lang } = useI18n();
  const story = isStoryPlanet(planet) ? planetStories[planet] : null;

  usePageTitle(story ? `${story.title[lang]} · ${story.label[lang]}` : "Story Mode");

  useEffect(() => {
    if (!story) return;
    soundscape.setPlanet(story.planet);
    return () => soundscape.setPlanet(null);
  }, [story]);

  if (!story) return <Navigate to="/story" replace />;

  return (
    <>
      {import.meta.env.DEV && planetStoryIssues.length > 0 && (
        <div role="alert" className="fixed inset-x-4 top-20 z-[70] mx-auto max-w-3xl rounded-xl border border-[#f07167]/60 bg-[#1a0b0b]/95 p-4 text-sm text-[#f4f7ff]">
          <p className="font-semibold">Story data issues</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs">
            {planetStoryIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Keyed by planet so a Moon → Mars navigation rebuilds every timeline from scratch. */}
      <StoryExperience key={story.planet} story={story} />
    </>
  );
}
