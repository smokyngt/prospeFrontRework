import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enChat from '../locales/en/chat.json';
import enFiles from '../locales/en/files.json';
import enTranslation from '../locales/en/translation.json';
import frChat from '../locales/fr/chat.json';
import frFiles from '../locales/fr/files.json';
import frTranslation from '../locales/fr/translation.json';

export const defaultNS = 'translation' as const;

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

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'fr',
    fallbackLng: 'en',
    resources,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
