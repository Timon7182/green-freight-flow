import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang } from "@/lib/i18n";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  tStatus: (status: string) => string;
  tService: (service: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ru",
  setLang: () => {},
  t: (key) => key,
  tStatus: (s) => s,
  tService: (s) => s,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ru";
    return (localStorage.getItem("lang") as Lang) || "ru";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["ru"]?.[key] || key;
  };

  const tStatus = (status: string): string => t(`status.${status}`);
  const tService = (service: string): string => t(`service.${service}`);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tStatus, tService }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
