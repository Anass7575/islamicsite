import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ALL_LANGUAGES } from './languages';

// Export the complete language list
export const supportedLanguages = ALL_LANGUAGES;

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false, // Disable debug in production
    load: 'languageOnly', // Only load 'fr', not 'fr-FR'
    
    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
      crossDomain: false,
      withCredentials: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage',
      convertDetectedLanguage: (lng) => {
        // Convert full locale codes to simple ones (fr-FR -> fr)
        const simpleLang = lng.split('-')[0];
        // Check if we support this language
        if (supportedLanguages.find(l => l.code === simpleLang)) {
          return simpleLang;
        }
        return 'en'; // Fallback to English if not supported
      },
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },

    // Supported languages list
    supportedLngs: supportedLanguages.map(l => l.code),
    
    ns: ['common', 'quran', 'hadith', 'prayer', 'prayers', 'navigation', 'calendar', 'zakat', 'settings'],
    defaultNS: 'common',
    
    // Load namespace on initialization
    preload: isClient ? [localStorage.getItem('preferredLanguage') || 'en'] : ['en'],
  });

export default i18n;

// Helper functions
export const getCurrentLanguage = () => i18n.language;

export const changeLanguage = async (lang: string) => {
  try {
    await i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = supportedLanguages.find(l => l.code === lang)?.dir || 'ltr';
  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};

export const isRTL = (lang?: string) => {
  const language = lang || i18n.language;
  return supportedLanguages.find(l => l.code === language)?.dir === 'rtl';
};