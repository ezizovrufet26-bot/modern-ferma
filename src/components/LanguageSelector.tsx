'use client';

import { useI18n } from '@/lib/i18n';
import { localeNames, localeFlags, type Locale } from '@/lib/i18n/translations';
import { Globe, Check } from 'lucide-react';
import { useState } from 'react';

const locales: Locale[] = ['az', 'tr', 'ru', 'en'];

export default function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowPicker(true)}
        className="p-5 flex items-center gap-5 hover:bg-gray-50 transition-colors cursor-pointer group"
      >
        <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 transition-colors">
          <Globe className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-gray-900">{t.language}</h3>
          <p className="text-gray-500 text-sm font-medium">{localeFlags[locale]} {localeNames[locale]}</p>
        </div>
        <div className="text-gray-300 group-hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>

      {/* Language Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-blue-600">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Globe className="w-6 h-6" />
                {t.chooseLanguage}
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { setLocale(loc); setShowPicker(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    locale === loc
                      ? 'bg-indigo-50 border-2 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <span className="text-3xl">{localeFlags[loc]}</span>
                  <span className="flex-1 text-left font-black text-gray-900 text-lg">{localeNames[loc]}</span>
                  {locale === loc && (
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setShowPicker(false)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-gray-600 transition-colors">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
