import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, type Lang } from "./strings";

type LanguageValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof copy)["en"];
};

const LanguageContext = createContext<LanguageValue | null>(null);

function readLang(): Lang {
  try {
    return localStorage.getItem("abnf-lang") === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.dataset.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem("abnf-lang", next);
    } catch {
      /* private mode can block storage; the choice still applies this session */
    }
  };

  return <LanguageContext.Provider value={{ lang, setLang, t: copy[lang] }}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider is missing");
  return value;
}
