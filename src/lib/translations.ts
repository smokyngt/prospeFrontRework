import enChat from "../locales/en/chat.json";
import enFiles from "../locales/en/files.json";
import enTranslation from "../locales/en/translation.json";
import frChat from "../locales/fr/chat.json";
import frFiles from "../locales/fr/files.json";
import frTranslation from "../locales/fr/translation.json";

export const defaultNS = "translation" as const;

/** `chat` et `files` viennent du workspace : ce sont les libellés de la démo. */
export const resources = {
  fr: {
    translation: frTranslation,
    chat: frChat,
    files: frFiles,
  },
  en: {
    translation: enTranslation,
    chat: enChat,
    files: enFiles,
  },
} as const;

/**
 * Traductions pour les composants et métadonnées côté serveur : mêmes clés que
 * `useTranslation`, sans dépendre de react-i18next (indisponible dans un RSC).
 */
export function getServerTranslation(language?: string) {
  return resources[language === "en" ? "en" : "fr"].translation;
}
