import type { PlanetStory, StoryPanel as StoryPanelData } from "../../lib/planetStory";
import type { StoryMode } from "../../hooks/useHorizontalStory";
import { FinalePanel } from "./panels/FinalePanel";
import { HardwarePanel } from "./panels/HardwarePanel";
import { IntroPanel } from "./panels/IntroPanel";
import { MissionsPanel } from "./panels/MissionsPanel";
import { RemainsPanel } from "./panels/RemainsPanel";
import { SilencePanel } from "./panels/SilencePanel";

type Props = {
  story: PlanetStory;
  panel: StoryPanelData;
  index: number;
  total: number;
  /** Within one panel of the active one; gates heavy assets such as GLB viewers. */
  near: boolean;
  mode: StoryMode;
  reducedMotion: boolean;
};

/** Panels that need more than one viewport of width on large screens. */
export const isWidePanel = (panel: StoryPanelData) => panel.layout === "remains" || (panel.layout === "missions" && panel.beats.length > 3);

export function StoryPanel({ story, panel, index, total, near, mode, reducedMotion }: Props) {
  const wide = isWidePanel(panel);
  return (
    <section id={panel.id} data-ps-panel data-ps-preset={panel.animationPreset} data-ps-wide={wide ? "" : undefined} data-ps-index={index} aria-labelledby={`${panel.id}-title`} aria-roledescription={`${index + 1} / ${total}`} className="ps-panel">
      {renderPanel(story, panel, { near, mode, reducedMotion })}
    </section>
  );
}

function renderPanel(story: PlanetStory, panel: StoryPanelData, extra: { near: boolean; mode: StoryMode; reducedMotion: boolean }) {
  switch (panel.layout) {
    case "intro":
      return <IntroPanel story={story} panel={panel} mode={extra.mode} />;
    case "missions":
      return <MissionsPanel story={story} panel={panel} />;
    case "hardware":
      return <HardwarePanel story={story} panel={panel} near={extra.near} reducedMotion={extra.reducedMotion} />;
    case "silence":
      return <SilencePanel story={story} panel={panel} />;
    case "remains":
      return <RemainsPanel panel={panel} />;
    case "finale":
      return <FinalePanel story={story} panel={panel} />;
    default:
      return null;
  }
}
