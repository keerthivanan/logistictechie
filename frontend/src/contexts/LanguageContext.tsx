"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

import { en } from '@/lib/i18n/en';
import { ar } from '@/lib/i18n/ar';

const dictionaries = { en, ar };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [direction, setDirection] = useState<Direction>('ltr');

    useEffect(() => {
        // Load saved language or default to English
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        setDirection(dir);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = dictionaries[language];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }

        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
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
