# BEYOND THE SIGNAL

## Mapping the machines humanity left behind on the Moon and Mars.

### NASA Space Apps Challenge 2026

**Challenge 1 — Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars**

---

## Project Overview

**Beyond the Signal** is an interactive 3D historical atlas of human-made equipment left on the Moon and Mars. Instead of treating abandoned spacecraft, rovers, instruments, experiments, landers, and other hardware as isolated technical records, the experience connects each object to its geographic location, mission context, timeline, final communication or mission ending, present status, and documented evidence.

The landing page offers two ways in:

- **Explore Freely** — the interactive 3D atlas (`/explore/moon`, `/explore/mars`, `/relics`).
- **Story Mode** — a scroll-driven, documentary-style journey through NASA's Moon and Mars missions (`/story`).

Users can:

- explore interactive 3D globes of the Moon and Mars
- discover documented hardware across both worlds
- select artifacts at their surveyed geographic locations
- read mission stories and understand what the objects were and what happened to them
- inspect coordinates and coordinate precision ratings (surveyed, approximate, estimated)
- follow chronological historical timelines and event sequences
- understand final communication records and recorded mission endings
- examine what remains today and why hardware was left in place
- inspect authoritative supporting sources and evidence for every record

## Challenge

Built for the **NASA Space Apps Challenge 2026** under **Challenge 1: “Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars”**.

The challenge calls for innovative storytelling that brings to life the silent machines humanity has placed on celestial bodies, preserving their historical significance, technical achievements, and lasting footprint on other worlds.

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
- **Story Mode**: A six-chapter cinematic documentary (The Beginning → The Moon → The Journey to Mars → The Red Planet → What Remains → The Legacy) with full-bleed mission photography, GSAP ScrollTrigger reveals, a reading-progress indicator, and "Explore this location" links back into the atlas. A Coming Soon resource archive closes the story.

## Story Mode Architecture

Story Mode never duplicates the mission database. `src/data/storyChapters.ts` is a presentation script: it lists chapters, sections, layouts, and short bilingual narrative framing, and references existing mission and artifact IDs. Everything factual — dates, coordinates, status, photographs, sources, 3D-scan associations — is resolved from `catalog.ts` and `artifactModels.ts` at render time by `src/lib/storyMode.ts`.

- `validateStoryChapters()` fails loudly in development (console warning + on-page notice) and in `npm test` if a chapter references an unknown or non-NASA mission, an artifact that does not belong to its mission, a photograph that does not exist, or a hardware "remain" category that the catalog status does not support.
- Status labels (Mission active / Mission ended / Contact lost / Status unconfirmed) are derived from the catalog's `ObjectStatus`; nothing is hand-labelled.
- Animations live in `src/hooks/useStoryAnimations.ts`, keyed off `data-story-*` attributes, scoped with `gsap.context()` + `gsap.matchMedia()`, reverted on unmount, and skipped entirely under `prefers-reduced-motion`. Content is fully readable with animation disabled.
- Pinned "assembly" scenes, the horizontal Mars strip, and the Moon/Mars finale only pin at ≥1024×700; smaller screens get the same content as a normal flowing layout.
- Scene photography in `public/images/story/` comes from the [NASA Image and Video Library](https://images.nasa.gov) via `scripts/fetch-story-images.mjs`; `src/data/storyImages.ts` records each NASA ID, title, and credit, and every use links back to the original record. Run `node scripts/fetch-story-images.mjs` to refetch.
- Story Mode is lazy-loaded, so GSAP is not part of the main bundle.

## NASA Data & Source Usage

Object coordinates, mission metadata, and historical records are derived from official space agency repositories and published planetary science datasets:

- **NASA NSSDCA** (National Space Science Data Center): Landing site coordinates, mission summaries, and catalog records.
- **LROC** (Lunar Reconnaissance Orbiter Camera): Mean observed coordinates for Apollo surface hardware and robotic anthropogenic targets.
- **NASA Science & Jet Propulsion Laboratory (JPL)**: Mission timelines, rover status records, and landing site fixes for Mars missions.
- **CNSA / NSSDC China & ISRO**: Verified landing coordinates for Far-side lunar and South Pole missions (Chang'e-3/4, Chandrayaan-3).
- **NASA Image Archives**: Historic photographs stored locally with full attribution and direct links to original records.

*Note on Active Rovers*: Active rovers (such as Curiosity and Perseverance) are marked at their documented landing sites, not a real-time tracking position.

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

Generative AI was used during development as an assistive pair-programming and refactoring tool for interface structuring, test generation, and bilingual string translation checking. All historical facts, coordinates, mission dates, and scientific attributions were verified against authoritative NASA and planetary science sources.

## Credits & Attributions

- **Globe Textures**: Moon and Mars color maps are stored in `public/textures` and credited to [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0).
- **Night Sky**: Celestial background sphere of stars brighter than magnitude 5.5 from the HYG compilation of the Hipparcos catalog.
- **Photographs**: NASA, JPL-Caltech, and respective mission imaging teams.
- **Visual Identity**: Logo and archival branding designed for Beyond the Signal.

## References

1. Wagner et al., *Coordinates of Anthropogenic Features on the Moon*, Icarus 283 (2017).
2. Lunar Reconnaissance Orbiter Camera (LROC), *Coordinates of Lunar Anthropogenic Targets*, 2016.
3. NASA National Space Science Data Center (NSSDCA), *Master Catalog of Spacecraft and Landing Sites*.
4. NASA Jet Propulsion Laboratory (JPL), *Mars Exploration Program Landing Coordinates*.

## Run Locally

```bash
npm install
npm run dev
```

Additional scripts:

- `npm test`: Runs test suite validating coordinate calculations, catalog schema integrity, Story Mode chapter references, filters, and audio controllers.
- `npm run build`: Typechecks with TypeScript (`tsc --noEmit`) and creates production build with Vite.
- `npm run preview`: Previews the production build locally with offline Service Worker support.

## Deploy

Import the repository on [Vercel](https://vercel.com) or any static host. The Vite preset uses `npm run build` and publishes `dist`. `vercel.json` routes single-page navigation to `index.html`. No server-side environment variables are required.

## Team

Built by the project team for NASA Space Apps Challenge 2026.
