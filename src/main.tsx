import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-600.css";
import "@fontsource/fraunces/latin-500.css";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/hind-siliguri/bengali-400.css";
import "@fontsource/hind-siliguri/bengali-600.css";
import "@fontsource/hind-siliguri/latin-400.css";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is optional until the worker installs */
    });
  });
}
