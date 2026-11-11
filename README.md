# BEYOND THE SIGNAL

## Mapping the machines humanity left behind on the Moon and Mars.

### NASA Space Apps Challenge 2026

**Challenge 1 — Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars**

**Live demo:** <https://nasa-space-app-challenge-nine.vercel.app/> · **Source:** <https://github.com/AdonMazumder26/nasa-space-app-challenge>

---

## Project Overview

**Beyond the Signal** is an interactive 3D historical atlas and a cinematic Story Mode about the spacecraft, rovers, instruments, and experiments that humanity has left on the Moon and Mars. Instead of treating abandoned hardware as isolated technical records, the experience connects each object to its geographic location, mission context, timeline, final communication or mission ending, present status, and documented evidence — and tells those stories in English and Bangla.

The landing page offers two ways in:

- **Explore Freely** — the interactive 3D atlas: `/explore/moon`, `/explore/mars`, and the `/relics` Hall of Relics of scanned hardware.
- **Story Mode** — `/story` lets a visitor choose a world:
  - **Moon · _Echoes of the First Footsteps_** (`/story/moon`) — seven horizontal sections: The Distant World → The First Arrivals (Surveyor) → One Giant Leap (Apollo) → The Science Left Behind → Silence on the Surface → What Remains → The Echoes Continue.
  - **Mars · _The Long Red Silence_** (`/story/mars`) — Another World → The First Robotic Explorers (Viking, Pathfinder) → Machines That Kept Moving (Spirit, Opportunity) → The Search for Ancient Life (Phoenix, Curiosity, InSight, Perseverance) → When Machines Fall Silent → What Remains on Mars → The Journey Continues.
  - **The Chronicle** (`/story/chronicle`) — one continuous scroll-driven documentary across both worlds, with pinned “assembly” scenes built from NASA archive photography and a Moon/Mars finale that drops the reader onto the surface in Explore mode.

Every story ends by inviting the visitor to explore the real coordinates on the globe.

Users can:

- explore interactive 3D globes of the Moon and Mars
- discover documented hardware across both worlds
- select artifacts at their surveyed geographic locations
- read mission stories and understand what the objects were and what happened to them
- inspect coordinates and coordinate precision ratings (surveyed, approximate, estimated)
- follow chronological historical timelines and event sequences
- understand final communication records and recorded mission endings
- examine what remains today and why hardware was left in place — distinguishing hardware left by design, hardware that was stranded or fell silent, missions that ended, and machines still operating
- inspect authoritative supporting sources and evidence for every record

## Challenge

Built for the **NASA Space Apps Challenge 2026** under **Challenge 1: “Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars”**.

The challenge calls for innovative storytelling that brings to life the silent machines humanity has placed on celestial bodies, preserving their historical significance, technical achievements, and lasting footprint on other worlds.

### How the project answers the challenge

| Judging lens | What Beyond the Signal does |
| --- | --- |
| **Impact** | Turns a list of “abandoned” objects into two guided stories and an explorable atlas aimed at school and college audiences; fully bilingual (English / Bangla) so it reaches learners who are rarely served by space-history material. |
| **Creativity** | A 3D globe where sites stay hidden until you approach them, a Hall of Relics of real hardware scans, and a Story Mode whose viewport pins while NASA photographs gather from every edge around a single statement. |
| **Validity** | Every date, coordinate, status, photograph, and source is resolved from one Zod-validated catalog; the story scripts only reference IDs. Tests fail if a story names an unknown mission, a non-NASA mission, a photograph that doesn’t exist, or a status label the record doesn’t support. |
| **Relevance** | NASA-only mission scope in Story Mode; coordinates from NSSDCA and LROC; status from NASA Science mission pages; photographs from the NASA Image and Video Library with IDs and credits on screen. |
| **Presentation** | Cinematic typography and motion built on GSAP ScrollTrigger and Framer Motion, with keyboard control, reduced-motion support, and offline caching. |

## Key Features

- **Interactive 3D Planetary Globes**: Full orbital navigation, rotation, and zoom across scientifically mapped Moon and Mars spheres.
- **Geographic Artifact Markers**: Precisely mapped landing sites, impact coordinates, and experiment stations with spherical coordinate transformations.
- **Story & Evidence Engine**: Detailed records covering what each machine was, what happened, why it remains, its recorded ending, and why it matters.
- **Historical Timeline**: Filterable chronological event stream connecting mission milestones and arrivals across decades.
- **Search & Filters**: Comprehensive filtering by planetary body, equipment type (landers, rovers, instruments, descent stages, etc.), operational status, and arrival era.
- **Bilingual Interface**: Full localization in English and Bangla (বাংলা), with language switching preserved across the app.
- **3D Hardware Archive**: Interactive inspection of 3D models representing historical lunar and martian hardware.
- **Guided Surface Expedition (ARIA)**: An interactive surface guide introducing catalogued artifacts and mission briefs.
- **Composed Soundscape**: Optional ambient audio interpretation with full mute and volume controls.
- **Story Mode**: Two horizontal planet stories (Moon and Mars) plus a continuous chronicle, with NASA archive photography, GSAP ScrollTrigger pinned scenes, word-by-word reveals, count-up mission statistics derived from catalog dates, a reading-progress indicator, and “Explore this location” links back into the atlas. A Coming Soon resource archive is reserved for classroom materials.

## Story Mode Architecture

Story Mode never duplicates the mission database. `src/data/planetStories.ts` (Moon and Mars stories) and `src/data/storyChapters.ts` (the chronicle) are presentation scripts: they list sections, layouts, and short bilingual narrative framing, and reference existing mission and artifact IDs. Everything factual — dates, coordinates, status, photographs, sources, 3D-scan associations — is resolved from `catalog.ts` and `artifactModels.ts` at render time by `src/lib/planetStory.ts` and `src/lib/storyMode.ts`.

- Validation fails loudly in development (console warning + on-page notice) and in `npm test` if a story references an unknown or non-NASA mission, an artifact that does not belong to its mission, a photograph that does not exist, or a hardware "remain" category that the catalog status does not support.
- Status labels (Mission active / Mission ended / Contact lost / Status unconfirmed) are derived from the catalog's `ObjectStatus`; nothing is hand-labelled.
- Animations live in `src/hooks/useHorizontalStory.ts` and `src/hooks/useStoryAnimations.ts`, keyed off `data-*` attributes, scoped with `gsap.context()` + `gsap.matchMedia()`, reverted on unmount, and skipped under `prefers-reduced-motion`. Content is fully readable with animation disabled; arrow keys, Home, and End move between sections.
- Pinned scenes only pin on large pointer-driven screens; touch devices and smaller screens get the same content as a native swipe or flowing layout.
- Scene photography in `public/images/story/` comes from the [NASA Image and Video Library](https://images.nasa.gov) via `scripts/fetch-story-images.mjs`; `src/data/storyImages.ts` records each NASA ID, title, and credit, and every use links back to the original record. Run `node scripts/fetch-story-images.mjs` to refetch.
- Story Mode is lazy-loaded, so GSAP is not part of the main bundle.

## NASA Data & Source Usage

Object coordinates, mission metadata, and historical records are derived from official space agency repositories and published planetary science datasets:

- **NASA NSSDCA** (National Space Science Data Center): Landing site coordinates, mission summaries, and catalog records.
- **LROC** (Lunar Reconnaissance Orbiter Camera): Mean observed coordinates for Apollo surface hardware and robotic anthropogenic targets.
- **NASA Science & Jet Propulsion Laboratory (JPL)**: Mission timelines, rover status records, and landing site fixes for Mars missions.
- **CNSA / NSSDC China & ISRO**: Verified landing coordinates for Far-side lunar and South Pole missions (Chang'e-3/4, Chandrayaan-3). These international missions appear in the atlas but are deliberately excluded from the NASA-focused Story Mode.
- **NASA Image and Video Library** (images.nasa.gov): Historic mission photographs stored locally at reduced size, each with its NASA ID, title, credit, and a link back to the original record.

*Note on Active Rovers*: Active rovers (such as Curiosity and Perseverance) are marked at their documented landing sites, not a real-time tracking position. Mission status is quoted from NASA Science mission pages as of the catalog's access date and is labelled "unconfirmed" where no record asserts it.

## Data Methodology

- **Coordinate System**: Markers utilize a standardized planetocentric latitude/longitude conversion. Longitudes are east-positive from −180° to +180°. Published west longitudes are mapped with inverted sign to preserve consistent globe alignment.
- **Precision Classification**: Every object coordinate carries an explicit precision level:
  - `Surveyed` (exact): High-resolution orbital imaging fix (e.g., LROC NAC coordinates).
  - `Approximate`: Verified landing area coordinates from agency summaries.
  - `Estimated`: Best available historical trajectory or entry estimates.
- **Schema Validation**: All catalog entries are validated at runtime and build time using strict Zod schemas to ensure relational integrity across objects, missions, events, and sources.

## Technology Stack

- **Framework**: React 19, TypeScript
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Routing**: React Router 7
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion (UI), GSAP + ScrollTrigger (Story Mode)
- **Typography**: Fraunces, Outfit, Hind Siliguri
- **Validation**: Zod
- **Build Tooling & Testing**: Vite, Vitest

## Accessibility

- **Keyboard Navigation**: Full keyboard control for modal dialogs, drawers, and controls with trapped focus and Escape handlers.
- **Reduced Motion**: Respects `prefers-reduced-motion` across all interfaces; disables automatic globe rotation and transitions smoothly without sudden motion.
- **Screen Reader Support**: Semantic HTML headings, ARIA dialog roles, accessible names on all interactive controls, and meaningful alt text on imagery.
- **Contrast & Legibility**: High-contrast typography on dark archival backgrounds adhering to WCAG standards.

## Offline Capability

The complete catalog, user interface, globe textures, and historical photographs are bundled and cached with the application using a dedicated Service Worker. Once loaded, the atlas operates fully offline without network connectivity (external agency links still require internet access).

## AI Usage

Generative AI (GitHub Copilot) was used during development as an assistive pair-programming tool: scaffolding components, writing tests, refactoring, drafting narrative framing for Story Mode, and checking Bangla translations. All historical facts, coordinates, mission dates, status labels, and photograph attributions were taken from, and verified against, the NASA and planetary-science sources listed in `src/data/sources.ts` and `src/data/storyImages.ts`; no factual content was generated without a source. No AI-generated imagery is used anywhere in the project — every photograph is a NASA record.

## License

The application source code is released under the [MIT License](./LICENSE). NASA photographs and data are in the public domain and are not covered by that license; globe textures are CC BY 4.0 (Solar System Scope). See **Credits & Attributions** below.

## Credits & Attributions

- **Globe Textures**: Moon and Mars color maps are stored in `public/textures` and credited to [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0).
- **Night Sky**: Celestial background sphere of stars brighter than magnitude 5.5 from the HYG compilation of the Hipparcos catalog.
- **Photographs**: NASA, NASA/JPL-Caltech, and the mission imaging teams credited on each image (MSSS, Cornell, University of Arizona, ASU, TAMU). Sourced from <https://images.nasa.gov> and <https://photojournal.jpl.nasa.gov>; NASA media is generally not copyrighted (see [NASA Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)).
- **3D Hardware Scans**: Each relic in the Hall of Relics links to its source record from within the app (`src/data/artifactModels.ts`).
- **Visual Identity**: Logo and archival branding designed for Beyond the Signal.

## References

1. Wagner et al., *Coordinates of Anthropogenic Features on the Moon*, Icarus 283 (2017).
2. Lunar Reconnaissance Orbiter Camera (LROC), *Coordinates of Lunar Anthropogenic Targets*, 2016.
3. NASA National Space Science Data Center (NSSDCA), *Master Catalog of Spacecraft and Landing Sites*.
4. NASA Jet Propulsion Laboratory (JPL), *Mars Exploration Program Landing Coordinates*.

## Run Locally

Requires Node.js 22.

```bash
npm install
npm run dev
```

Additional scripts:

- `npm test`: Runs the Vitest suite (coordinate maths, catalog schema integrity, Story Mode reference validation, filters, audio controller).
- `npm run build`: Typechecks with TypeScript (`tsc --noEmit`) and creates the production build with Vite.
- `npm run preview`: Previews the production build locally with offline Service Worker support.
- `node scripts/fetch-story-images.mjs`: Re-downloads the Story Mode photographs from the NASA Image and Video Library.

### Routes

| Route | What it is |
| --- | --- |
| `/` | Landing page with the two entry points |
| `/explore/moon`, `/explore/mars` | Interactive globes (`?object=<id>` opens a record, `?view=objects` / `?view=timeline` opens a drawer) |
| `/relics` | Hall of Relics (`?model=<id>` opens a scan) |
| `/story` | Story Mode — choose Moon or Mars |
| `/story/moon`, `/story/mars` | Horizontal planet stories |
| `/story/chronicle` | Continuous scroll-driven chronicle |
| `/about` | Methodology, sources, and credits |

## Deploy

Import the repository on [Vercel](https://vercel.com) or any static host. The Vite preset uses `npm run build` and publishes `dist`. `vercel.json` routes single-page navigation to `index.html`. No server-side environment variables are required.

## Team

Built by Adon Mazumder and team for the NASA Space Apps Challenge 2026.
