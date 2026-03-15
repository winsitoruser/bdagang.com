import React, { useState, useEffect, useCallback } from 'react';
import {
  TranslationContext, Language, Currency, translateText,
  detectLanguage, saveLanguage, detectCurrency, saveCurrency,
  defaultCurrencyForLang, formatCurrencyValue, formatDateValue
} from '@/lib/i18n';

interface TranslationProviderProps {
  children: React.ReactNode;
  translations: Record<Language, Record<string, any>>;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children, translations }) => {
  const [language, setLanguageState] = useState<Language>('id');
  const [currency, setCurrencyState] = useState<Currency>('IDR');

  useEffect(() => {
    const detectedLang = detectLanguage();
    setLanguageState(detectedLang);
    const detectedCurrency = detectCurrency();
    setCurrencyState(detectedCurrency);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
    // Auto-switch currency when language changes
    const newCurrency = defaultCurrencyForLang[lang];
    setCurrencyState(newCurrency);
    saveCurrency(newCurrency);
  }, []);

  const setCurrency = useCallback((cur: Currency) => {
    setCurrencyState(cur);
    saveCurrency(cur);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return translateText(translations[language] || translations['id'], key, params);
  }, [language, translations]);

  const formatCurrency = useCallback((amount: number) => {
    return formatCurrencyValue(amount, currency);
  }, [currency]);

  const formatDate = useCallback((date: string | Date, style?: 'short' | 'long' | 'datetime') => {
    return formatDateValue(date, language, style);
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, currency, setCurrency, formatCurrency, formatDate }}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationProvider;
