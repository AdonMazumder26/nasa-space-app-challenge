# Abandoned but not Forgotten

An interactive 3D museum of documented human-made equipment left on the Moon and Mars. Built for the NASA Space Apps Challenge.

Drag a globe, select a marker, and read the object's story, coordinates, and sources. Search, filters, and the timeline reach the same records. The interface is in English and Bangla.

## Run

```bash
npm install
npm run dev
```

Other commands:

- `npm test` checks coordinate conversion, filtering, and catalog integrity
- `npm run build` typechecks and builds the production app
- `npm run preview` serves that build, including offline caching after one visit

## Notes

Moon and Mars color maps are stored in `public/textures` and credited to [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0). Object coordinates come from the agency sources linked inside the app. Active rovers are marked at their documented landing sites, not a live position.
