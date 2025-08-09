"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, defaultLocale, getDictionary, Dictionary } from '@/i18n';
import { StorageEnum } from '@/types';

interface LanguageContextType {
  locale: Locale;
  dictionary: Dictionary | null;
  setLocale: (locale: Locale) => void;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [dictionary, setDictionary] = useState<Dictionary | null>(getDictionary(defaultLocale));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load locale from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(StorageEnum.Language) as Locale;
      if (savedLocale && ['en', 'pt'].includes(savedLocale)) {
        setLocaleState(savedLocale);
        setDictionary(getDictionary(savedLocale));
      }
    }
  }, []);

  useEffect(() => {
    try {
      const dict = getDictionary(locale);
      setDictionary(dict);
    } catch (error) {
      console.error('Failed to load dictionary:', error);
      // Fallback to default locale
      const dict = getDictionary(defaultLocale);
      setDictionary(dict);
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(StorageEnum.Language, newLocale);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, dictionary, setLocale, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { dictionary, loading } = useLanguage();
  
  const t = (key: string): string => {
    if (!dictionary || loading) return key;
    
    const keys = key.split('.');
    let value: any = dictionary;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, loading };
}
