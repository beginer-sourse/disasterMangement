import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';

const resources = {
  en: {
    translation: en
  },
  hi: {
    translation: hi
  },
  ta: {
    translation: ta
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // Set default language explicitly
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })
  .then(() => {
    console.log('i18n initialized successfully');
    console.log('Available languages:', Object.keys(resources));
    console.log('Current language:', i18n.language);
  })
  .catch((error) => {
    console.error('i18n initialization failed:', error);
  });

export default i18n;
