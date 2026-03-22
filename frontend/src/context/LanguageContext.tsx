'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'en' | 'ar'
const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('en')
    useEffect(() => {
        const saved = localStorage.getItem('lang') as Lang
        if (saved === 'ar' || saved === 'en') setLangState(saved)
    }, [])
    const setLang = (l: Lang) => {
        setLangState(l)
        localStorage.setItem('lang', l)
        document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = l
    }
    useEffect(() => {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = lang
    }, [lang])
    return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
