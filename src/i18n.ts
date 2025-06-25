import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Only initialize on client side
if (typeof window !== 'undefined') {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: false, // Disable debug to reduce console noise
      interpolation: {
        escapeValue: false, // react already escapes by default
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      react: {
        useSuspense: false, // Disable suspense to prevent SSR issues
      },
    })
    .catch(err => {
      console.warn('i18n initialization failed:', err);
    });
}

export default i18n;

