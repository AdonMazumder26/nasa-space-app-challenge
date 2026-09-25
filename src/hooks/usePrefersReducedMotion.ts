import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function useMinWidth(pixels: number): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(`(min-width: ${pixels}px)`).matches);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${pixels}px)`);
    const onChange = () => setMatches(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [pixels]);

  return matches;
}
