// One-off fetch of NASA Image and Video Library photographs for Story Mode.
// Usage: node scripts/fetch-story-images.mjs
// Downloads the "large" rendition of each listed nasa_id into public/images/story/
// and writes the API metadata to scripts/story-images.manifest.json, which is the
// source for the credits in src/data/storyImages.ts. NASA imagery is not copyrighted;
// see https://www.nasa.gov/nasa-brand-center/images-and-media/.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const wanted = [
  ["earthrise", "as08-14-2383"],
  ["saturn-v-apollo-11", "6900556"],
  ["aldrin-on-moon", "as11-40-5903"],
  ["bootprint", "as11-40-5878"],
  ["surveyor-3-apollo-12", "as12-48-7134"],
  ["bean-alsep", "as12-46-6807"],
  ["apollo-15-rover", "as15-86-11603"],
  ["apollo-16-salute", "as16-113-18339"],
  ["apollo-17-rover-cernan", "as17-134-20476"],
  ["apollo-17-schmitt-boulder", "as17-140-21496"],
  ["blue-marble", "as17-148-22727"],
  ["sojourner-terrain", "PIA00632"],
  ["spirit-husband-hill", "PIA03610"],
  ["opportunity-burns-cliff", "PIA07039"],
  ["phoenix-sun", "PIA10665"],
  ["curiosity-murray-buttes", "PIA20844"],
  ["insight-seis", "PIA22977"],
  ["perseverance-descent", "PIA24430"],
  ["ingenuity-flight", "PIA24624"],
  ["earth-from-mars", "PIA17936"],
  ["jezero-panorama", "PIA24264"],
];

const outDir = join(process.cwd(), "public", "images", "story");
mkdirSync(outDir, { recursive: true });
const manifest = {};

for (const [key, id] of wanted) {
  try {
    const res = await fetch(`https://images-api.nasa.gov/search?nasa_id=${encodeURIComponent(id)}&media_type=image`);
    const json = await res.json();
    const item = json.collection.items[0];
    if (!item) {
      console.log(`MISSING ${key} (${id})`);
      continue;
    }
    const data = item.data[0];
    const byName = (suffix) => item.links.find((l) => l.href.endsWith(`~${suffix}.jpg`));
    const orig = byName("orig");
    const large = byName("large") ?? (orig && orig.width && orig.width <= 2600 ? orig : null) ?? byName("medium");
    if (!large || !large.width || large.width < 1200) {
      console.log(`TOO SMALL ${key} (${id}) ${large?.width ?? "?"}px`);
      continue;
    }
    const file = `${key}.jpg`;
    const target = join(outDir, file);
    if (!existsSync(target)) {
      const img = await fetch(large.href);
      writeFileSync(target, Buffer.from(await img.arrayBuffer()));
    }
    manifest[key] = {
      nasaId: data.nasa_id,
      title: data.title,
      dateCreated: data.date_created,
      center: data.center,
      secondaryCreator: data.secondary_creator ?? null,
      description: (data.description ?? "").slice(0, 400),
      width: large.width ?? null,
      height: large.height ?? null,
      file: `/images/story/${file}`,
      detailsUrl: `https://images.nasa.gov/details/${data.nasa_id}`,
    };
    console.log(`OK ${key} ${data.nasa_id} ${large.width}x${large.height} — ${data.title}`);
  } catch (error) {
    console.log(`ERROR ${key} (${id}): ${error.message}`);
  }
}

writeFileSync(join(process.cwd(), "scripts", "story-images.manifest.json"), JSON.stringify(manifest, null, 2));
