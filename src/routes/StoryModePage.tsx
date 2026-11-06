import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar";
import { Footer } from "../components/layout/Footer";
import { ChapterTransition } from "../components/story/ChapterTransition";
import { HardwareShowcase } from "../components/story/HardwareShowcase";
import { MissionGallery } from "../components/story/MissionGallery";
import { MissionStorySection } from "../components/story/MissionStorySection";
import { MissionTimeline } from "../components/story/MissionTimeline";
import { NarrativeSection } from "../components/story/NarrativeSection";
import { ResourceArchive } from "../components/story/ResourceArchive";
import { StoryAssembly } from "../components/story/StoryAssembly";
import { StoryChapter } from "../components/story/StoryChapter";
import { StoryConclusion } from "../components/story/StoryConclusion";
import { StoryFinale } from "../components/story/StoryFinale";
import { StoryHero } from "../components/story/StoryHero";
import { StoryProgress } from "../components/story/StoryProgress";
import { artifactModels } from "../data/artifactModels";
import { catalog } from "../data/catalog";
import { storyChapters, storyIssues } from "../data/storyChapters";
import { storyImageById, storyImages, type StoryImage } from "../data/storyImages";
import { useI18n } from "../features/localization/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useSound } from "../hooks/useSound";
import { useStoryAnimations } from "../hooks/useStoryAnimations";
import { soundscape } from "../lib/audio";
import {
  artifactsInStory,
  missionsInStory,
  resolveGalleryItems,
  resolveHardwareGroups,
  resolveMissionSection,
  resolveTimelineEvents,
  type StoryCatalog,
  type StorySection,
} from "../lib/storyMode";

const storyCatalog: StoryCatalog = {
  missions: catalog.missions,
  objects: catalog.objects,
  sources: catalog.sources,
  events: catalog.events,
  models: artifactModels,
  images: storyImages,
};

const imagesFor = (ids: string[]) => ids.map(storyImageById).filter((image): image is StoryImage => Boolean(image));

export default function StoryModePage() {
  const { t, lang } = useI18n();
  const reduced = usePrefersReducedMotion();
  const sound = useSound();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pastOpening, setPastOpening] = useState(false);

  usePageTitle(t.story.title);

  const storyMissions = useMemo(() => {
    const ids = new Set(missionsInStory(storyChapters));
    return catalog.missions.filter((mission) => ids.has(mission.id));
  }, []);
  const storyArtifacts = useMemo(() => {
    const ids = new Set(artifactsInStory(storyChapters));
    return catalog.objects.filter((object) => ids.has(object.id));
  }, []);

  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.hash]);

  useEffect(() => {
    const theme = storyChapters[activeIndex]?.theme;
    soundscape.setPlanet(theme === "mars" || theme === "remains" || theme === "legacy" ? "mars" : "moon");
  }, [activeIndex]);

  useEffect(() => () => soundscape.setPlanet(null), []);

  const onChapter = useCallback((index: number) => setActiveIndex(index), []);
  const onPastOpening = useCallback((past: boolean) => setPastOpening(past), []);
  useStoryAnimations(rootRef, barRef, { reduced, lang, onChapter, onPastOpening });

  const scrollTop = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

  return (
    <div className="story-root min-h-dvh">
      <div className="story-atmosphere" data-story-atmosphere aria-hidden="true">
        <div className="story-aurora top-[-10%] right-[-5%] h-[55vh] w-[45vw] bg-[#3d7eff]/20" />
        <div className="story-aurora story-aurora-b bottom-[-15%] left-[-10%] h-[50vh] w-[50vw] bg-[#f2a64a]/10" />
      </div>
      <div className="sticky top-0 z-50">
        <TopBar dimmed sound={{ enabled: sound.enabled, failed: sound.failed, volume: sound.volume, onToggle: sound.toggle, onVolume: sound.setVolume }} />
      </div>

      {import.meta.env.DEV && storyIssues.length > 0 && (
        <div role="alert" className="mx-auto my-4 max-w-3xl rounded-xl border border-[#f07167]/60 bg-[#f07167]/10 p-4 text-sm text-[#f4f7ff]">
          <p className="font-semibold">Story Mode data issues</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs">
            {storyIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <main ref={rootRef} className="relative z-10 -mt-16">
        {storyChapters.map((chapter, index) => (
          <StoryChapter key={chapter.id} chapter={chapter} index={index} total={storyChapters.length} opener={chapter.theme !== "intro" && chapter.theme !== "transition" && chapter.theme !== "legacy"}>
            {chapter.sections.map((section) => (
              <Section key={section.id} section={section} index={index} total={storyChapters.length} nextChapterId={storyChapters[index + 1]?.id ?? null} missions={storyMissions} artifacts={storyArtifacts} />
            ))}
          </StoryChapter>
        ))}
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs leading-5 text-[#93a6c9] sm:px-10">{t.story.nasaOnly}</p>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

      <StoryProgress ref={barRef} chapters={storyChapters} activeIndex={activeIndex} showTop={pastOpening} onTop={scrollTop} />
      {sound.failed && <p className="pointer-events-none fixed right-4 bottom-20 z-30 max-w-xs text-xs text-[#c5d2ea]">{t.audioUnavailable}</p>}
    </div>
  );
}

function Section({
  section,
  index,
  total,
  nextChapterId,
  missions,
  artifacts,
}: {
  section: StorySection;
  index: number;
  total: number;
  nextChapterId: string | null;
  missions: typeof catalog.missions;
  artifacts: typeof catalog.objects;
}) {
  const { lang } = useI18n();
  switch (section.type) {
    case "hero":
      return <StoryHero section={section} nextChapterId={nextChapterId} />;
    case "narrative":
      return <NarrativeSection section={section} missions={section.stats ? missions : undefined} artifacts={section.stats ? artifacts : undefined} />;
    case "assembly":
      return <StoryAssembly section={section} images={imagesFor(section.imageIds)} />;
    case "mission": {
      const resolved = resolveMissionSection(section, storyCatalog);
      return resolved ? <MissionStorySection {...resolved} /> : null;
    }
    case "timeline":
      return <MissionTimeline id={section.id} heading={section.heading[lang]} intro={section.intro?.[lang]} events={resolveTimelineEvents(section.missionIds, storyCatalog)} />;
    case "gallery":
      return <MissionGallery section={section} items={resolveGalleryItems(section, storyCatalog)} />;
    case "hardware":
      return <HardwareShowcase section={section} groups={resolveHardwareGroups(section, storyCatalog)} events={catalog.events} />;
    case "transition":
      return <ChapterTransition section={section} image={section.imageId ? storyImageById(section.imageId) : undefined} />;
    case "conclusion":
      return <StoryConclusion section={section} index={index} total={total} />;
    case "resources":
      return <ResourceArchive section={section} />;
    case "finale":
      return <StoryFinale section={section} moon={storyImageById(section.moonImageId)} mars={storyImageById(section.marsImageId)} />;
    default:
      return null;
  }
}
