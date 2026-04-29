import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { resources, supportedLanguages, type AppLanguage } from "./resources";

const isSupportedLanguage = (value: unknown): value is AppLanguage => {
  return typeof value === "string" && supportedLanguages.includes(value as AppLanguage);
};

const normalizeLanguage = (lng?: string): AppLanguage => {
  if (!lng) return "en";
  const base = lng.split("-")[0];
  if (isSupportedLanguage(base)) {
    return base;
  }
  return "en";
};

const languageDetector = new LanguageDetector();
languageDetector.init({
  order: ["localStorage", "en"],
  caches: ["localStorage"],
  lookupLocalStorage: "acadtrak_lang",
});

if (!i18n.isInitialized) {
  i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      supportedLngs: supportedLanguages,
      nonExplicitSupportedLngs: true,
      load: "languageOnly",
      react: {
        useSuspense: false, // ✅ Prevent blocking on language change
      },
    });

  const initial = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
  void i18n.changeLanguage(initial);
}

export const appDirection = (lng?: string) => (normalizeLanguage(lng) === "ar" ? "rtl" : "ltr");

export default i18n;
