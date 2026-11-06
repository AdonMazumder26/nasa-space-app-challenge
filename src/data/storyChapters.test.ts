import { describe, expect, it } from "vitest";
import { artifactModels } from "./artifactModels";
import { catalog } from "./catalog";
import { storyChapters, storyIssues } from "./storyChapters";
import { storyImages } from "./storyImages";
import { artifactsInStory, categoryAllowsStatus, exploreHref, missionsInStory, storyStatusFor, validateStoryChapters } from "../lib/storyMode";

const storyCatalog = { missions: catalog.missions, objects: catalog.objects, sources: catalog.sources, events: catalog.events, models: artifactModels, images: storyImages };
// Files that actually exist under public/images/story, resolved at build time.
const shippedFiles = new Set(Object.keys(import.meta.glob("../../public/images/story/*.jpg")).map((path) => path.replace("../../public", "")));

describe("story chapters", () => {
  it("reference only existing NASA missions and artifacts", () => {
    expect(storyIssues).toEqual([]);
    for (const id of missionsInStory(storyChapters)) {
      expect(catalog.missions.find((mission) => mission.id === id)?.agency).toBe("NASA");
    }
    for (const id of artifactsInStory(storyChapters)) {
      expect(catalog.objects.some((object) => object.id === id)).toBe(true);
    }
  });

  it("follow the agreed order: intro, Moon, transition, Mars, remains, legacy", () => {
    expect(storyChapters.map((chapter) => chapter.theme)).toEqual(["intro", "moon", "transition", "mars", "remains", "legacy"]);
    const lastTypes = storyChapters.at(-1)?.sections.map((section) => section.type) ?? [];
    expect(lastTypes).toContain("resources");
    expect(lastTypes.at(-1)).toBe("finale");
  });

  it("ship every NASA archive photograph they reference, with ids and credits", () => {
    const ids = new Set<string>();
    for (const image of storyImages) {
      expect(ids.has(image.id)).toBe(false);
      ids.add(image.id);
      expect(image.nasaId.length).toBeGreaterThan(3);
      expect(image.credit).toContain(image.nasaId);
      expect(image.alt.en.length).toBeGreaterThan(10);
      expect(image.alt.bn.length).toBeGreaterThan(5);
      expect(shippedFiles.has(image.file)).toBe(true);
    }
    expect(shippedFiles.size).toBeGreaterThanOrEqual(storyImages.length);
  });

  it("keep hardware categories honest against catalog status", () => {
    expect(categoryAllowsStatus("active", "active")).toBe(true);
    expect(categoryAllowsStatus("active", "communication_lost")).toBe(false);
    expect(categoryAllowsStatus("stranded", "mission_complete")).toBe(false);
    expect(storyStatusFor("active")).toBe("active");
    expect(storyStatusFor("communication_lost")).toBe("lost");
    expect(storyStatusFor("mission_complete")).toBe("ended");
    expect(storyStatusFor("unknown")).toBe("unconfirmed");
  });

  it("build Explore links in the format ExplorePage reads", () => {
    expect(exploreHref({ planet: "mars", id: "curiosity" })).toBe("/explore/mars?object=curiosity");
  });

  it("flag bad references instead of rendering them", () => {
    const issues = validateStoryChapters(
      [
        {
          id: "bad",
          theme: "moon",
          title: { en: "x", bn: "x" },
          subtitle: { en: "x", bn: "x" },
          sections: [
            { id: "m", type: "mission", missionId: "luna-17", layout: "split", artifactIds: ["lunokhod-1", "nope"], lead: { en: "x", bn: "x" } },
            { id: "h", type: "hardware", heading: { en: "x", bn: "x" }, groups: [{ category: "active", artifactIds: ["spirit"] }] },
            { id: "a", type: "assembly", title: { en: "x", bn: "x" }, imageIds: ["earthrise", "not-a-photo"] },
          ],
        },
      ],
      storyCatalog,
    );
    expect(issues.some((issue) => issue.includes("not NASA"))).toBe(true);
    expect(issues.some((issue) => issue.includes('unknown artifact "nope"'))).toBe(true);
    expect(issues.some((issue) => issue.includes('"spirit" is communication_lost'))).toBe(true);
    expect(issues.some((issue) => issue.includes('unknown story image "not-a-photo"'))).toBe(true);
    expect(issues.some((issue) => issue.includes("no Mars chapter"))).toBe(true);
  });
});
