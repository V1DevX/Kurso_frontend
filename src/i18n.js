import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ru from './locales/ru.json'
import ky from './locales/ky.json'
import en from './locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      ky: { translation: ky },
      en: { translation: en },
    },
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'ky', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng) => lng.split('-')[0],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
