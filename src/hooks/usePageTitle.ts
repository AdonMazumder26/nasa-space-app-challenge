import { useEffect } from "react";
import { BRAND } from "../constants/branding";

export function formatPageTitle(pageOrObject?: string | null): string {
  if (!pageOrObject || pageOrObject.trim() === "") {
    return BRAND.DEFAULT_TITLE;
  }
  return `${pageOrObject} | ${BRAND.PROJECT_NAME}`;
}

export function usePageTitle(pageOrObject?: string | null) {
  useEffect(() => {
    document.title = formatPageTitle(pageOrObject);
  }, [pageOrObject]);
}
