import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { catalogIssues } from "./data/catalog";
import { LanguageProvider, useI18n } from "./features/localization/LanguageContext";
import { AboutPage } from "./routes/AboutPage";
import { ExplorePage } from "./routes/ExplorePage";
import { LandingPage } from "./routes/LandingPage";

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
      <Route path="/explore/:planet" element={<ExplorePage />} />
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
