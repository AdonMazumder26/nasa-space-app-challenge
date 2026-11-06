import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { catalogIssues } from "./data/catalog";
import { LanguageProvider, useI18n } from "./features/localization/LanguageContext";
import { AboutPage } from "./routes/AboutPage";
import { ExplorePage } from "./routes/ExplorePage";
import { LandingPage } from "./routes/LandingPage";
import { RelicsPage } from "./routes/RelicsPage";

// Story Mode carries GSAP and its own long-form layout; load it only when the reader enters.
const StoryModePage = lazy(() => import("./routes/StoryModePage"));
const StorySelectPage = lazy(() => import("./routes/StorySelectPage"));
const PlanetStoryPage = lazy(() => import("./routes/PlanetStoryPage"));

function StoryFallback() {
  const { t } = useI18n();
  return (
    <main className="grid min-h-dvh place-items-center bg-[#05080f]" aria-busy="true">
      <p className="story-kicker text-[#93a6c9]">{t.story.title}</p>
    </main>
  );
}

function DataGate() {
  const { t } = useI18n();
  if (catalogIssues.length > 0) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="font-display text-4xl">{t.dataError}</h1>
        <ul className="mt-4 space-y-2 text-sm">
          {catalogIssues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </main>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/story"
        element={
          <Suspense fallback={<StoryFallback />}>
            <StorySelectPage />
          </Suspense>
        }
      />
      <Route
        path="/story/chronicle"
        element={
          <Suspense fallback={<StoryFallback />}>
            <StoryModePage />
          </Suspense>
        }
      />
      <Route
        path="/story/:planet"
        element={
          <Suspense fallback={<StoryFallback />}>
            <PlanetStoryPage />
          </Suspense>
        }
      />
      <Route path="/explore/:planet" element={<ExplorePage />} />
      <Route path="/relics" element={<RelicsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <DataGate />
      </BrowserRouter>
    </LanguageProvider>
  );
}
