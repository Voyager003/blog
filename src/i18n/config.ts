export const defaultLocale = 'ko' as const;
export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

export function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale);
}
