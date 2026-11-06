import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";
import { marsStory, moonStory, planetStories, planetStoryCatalog, planetStoryIssues } from "./planetStories";
import { storyImages } from "./storyImages";
import { artifactsInPlanetStory, missionsInPlanetStory, resolveBeats, resolveHardware, resolveRemains, resolveSilenceEvents, validatePlanetStory, type PlanetStory } from "../lib/planetStory";

const shippedFiles = new Set(Object.keys(import.meta.glob("../../public/images/story/*.jpg")).map((path) => path.replace("../../public", "")));

describe("planet stories", () => {
  it("validate cleanly against the catalog", () => {
    expect(planetStoryIssues).toEqual([]);
  });

  it("each have seven panels, opening with an intro and closing with a finale", () => {
    for (const story of Object.values(planetStories)) {
      expect(story.panels).toHaveLength(7);
      expect(story.panels[0]?.layout).toBe("intro");
      expect(story.panels.at(-1)?.layout).toBe("finale");
      expect(new Set(story.panels.map((panel) => panel.animationPreset)).size).toBe(story.panels.length);
    }
    // The two stories must not share choreography either.
    const presets = [...moonStory.panels, ...marsStory.panels].map((panel) => panel.animationPreset);
    expect(new Set(presets).size).toBe(presets.length);
  });

  it("reference only NASA missions and artifacts on their own planet", () => {
    for (const story of Object.values(planetStories)) {
      for (const id of missionsInPlanetStory(story)) {
        const mission = catalog.missions.find((item) => item.id === id);
        expect(mission?.agency).toBe("NASA");
        expect(mission?.planet).toBe(story.planet);
      }
      for (const id of artifactsInPlanetStory(story)) {
        const object = catalog.objects.find((item) => item.id === id);
        expect(object?.planet).toBe(story.planet);
      }
    }
  });

  it("ship every scene photograph they use", () => {
    const used = new Set<string>();
    for (const story of Object.values(planetStories)) {
      used.add(story.posterImageId);
      for (const panel of story.panels) {
        if ("imageId" in panel && panel.imageId) used.add(panel.imageId);
        if (panel.layout === "missions") panel.beats.forEach((beat) => beat.imageId && used.add(beat.imageId));
      }
    }
    for (const id of used) {
      const image = storyImages.find((item) => item.id === id);
      expect(image, id).toBeDefined();
      expect(shippedFiles.has(image!.file)).toBe(true);
    }
  });

  it("resolve every beat, hardware item, event, and remains card", () => {
    for (const story of Object.values(planetStories)) {
      for (const panel of story.panels) {
        if (panel.layout === "missions") expect(resolveBeats(panel, planetStoryCatalog)).toHaveLength(panel.beats.length);
        if (panel.layout === "hardware") {
          const { items, relic } = resolveHardware(panel, planetStoryCatalog);
          expect(items).toHaveLength(panel.artifactIds.length);
          if (panel.relicModelId) expect(relic?.id).toBe(panel.relicModelId);
        }
        if (panel.layout === "silence") expect(resolveSilenceEvents(panel, planetStoryCatalog)).toHaveLength(panel.eventIds.length);
        if (panel.layout === "remains") {
          const cards = resolveRemains(panel, planetStoryCatalog);
          const total = panel.groups.reduce((sum, group) => sum + group.artifactIds.length, 0);
          expect(cards.reduce((sum, card) => sum + card.items.length, 0)).toBe(total);
        }
      }
    }
  });

  it("keep Mars statuses honest: active rovers are not listed as stranded or ended", () => {
    const remains = marsStory.panels.find((panel) => panel.layout === "remains");
    expect(remains?.layout).toBe("remains");
    if (remains?.layout !== "remains") return;
    const active = remains.groups.find((group) => group.category === "active");
    expect(active?.artifactIds.sort()).toEqual(["curiosity", "perseverance"]);
    for (const group of remains.groups) {
      for (const id of group.artifactIds) {
        const object = catalog.objects.find((item) => item.id === id);
        expect(group.category === "active" ? object?.status === "active" : object?.status !== "active").toBe(true);
      }
    }
  });

  it("flag bad references instead of rendering them", () => {
    const broken: PlanetStory = {
      ...moonStory,
      panels: [
        { ...moonStory.panels[0]!, imageId: "nope" } as PlanetStory["panels"][number],
        { id: "x", layout: "missions", animationPreset: "p", kicker: { en: "", bn: "" }, title: { en: "", bn: "" }, narrative: [{ en: "a", bn: "a" }], beats: [{ missionId: "viking-1", note: { en: "", bn: "" } }] },
        { id: "y", layout: "remains", animationPreset: "q", groupBy: "artifact", kicker: { en: "", bn: "" }, title: { en: "", bn: "" }, narrative: [{ en: "a", bn: "a" }], groups: [{ category: "active", artifactIds: ["apollo-11-easep", "ghost"] }] },
      ],
    };
    const issues = validatePlanetStory(broken, planetStoryCatalog);
    expect(issues.some((issue) => issue.includes('unknown story image "nope"'))).toBe(true);
    expect(issues.some((issue) => issue.includes("is not a moon mission"))).toBe(true);
    expect(issues.some((issue) => issue.includes('unknown artifact "ghost"'))).toBe(true);
    expect(issues.some((issue) => issue.includes('does not fit "active"'))).toBe(true);
    expect(issues.some((issue) => issue.includes("must close with a finale"))).toBe(true);
  });
});
