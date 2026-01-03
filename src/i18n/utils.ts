import { ui, type TranslationKey } from './ui';
import { defaultLocale, type Locale, isValidLocale } from './config';

export function useTranslations(lang: Locale) {
  return function t(key: TranslationKey): string {
    return ui[lang][key] || ui[defaultLocale][key] || key;
  };
}

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  // Only 'en' has a prefix, everything else is Korean (default)
  if (lang === 'en') return 'en';
  return defaultLocale;
}

export function getLocalizedPath(path: string, lang: Locale): string {
  // Remove existing lang prefix if present
  const cleanPath = path.replace(/^\/(ko|en)/, '') || '/';
  // Korean (default): no prefix, English: /en prefix
  if (lang === defaultLocale) {
    return cleanPath;
  }
  return `/en${cleanPath}`;
}

export function getAlternateUrl(currentPath: string, targetLang: Locale): string {
  return getLocalizedPath(currentPath, targetLang);
}

export function formatDate(date: Date, lang: Locale): string {
  return date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: Date, lang: Locale): string {
  return date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
