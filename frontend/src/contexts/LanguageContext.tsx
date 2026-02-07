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
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('language') as Language) || 'en';
        }
        return 'en';
    });
    const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

    function setLanguage(lang: Language) {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        // DOM updates handled by useEffect
    }

    // Sync DOM on mount/change
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = direction;
    }, [language, direction]);

    const t = (key: string): string => {
        const keys = key.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
