'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type Locale, type TranslationKeys } from './translations';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
};

const I18nContext = createContext<I18nContextType>({
  locale: 'az',
  setLocale: () => {},
  t: translations['az'],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('az');

  useEffect(() => {
    const saved = localStorage.getItem('modernferma-locale') as Locale;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('modernferma-locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
