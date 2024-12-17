// useTranslation.ts
import { useLanguage } from '../contexts/LanguageContext';
import { translations, SupportedLanguage } from './translations';

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: string): string {
    return translations[language][key] || key;
  }

  return { t };
}
