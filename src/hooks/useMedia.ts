import { useEffect, useState } from "react";

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export function usePrefersReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)");
}

export function useMinWidth(width: number) {
  return useMedia(`(min-width: ${width}px)`);
}
