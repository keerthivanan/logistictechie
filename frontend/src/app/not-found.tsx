'use client'

import Link from 'next/link'
import { useT } from '@/lib/i18n/t'

export default function NotFound() {
    const t = useT()
    return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-white mb-4">404</h1>
                <h2 className="text-3xl font-bold mb-4">{t('notfound.title')}</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    {t('notfound.sub')}
                </p>
                <Link
                    href="/"
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
                >
                    {t('notfound.home')}
                </Link>
            </div>
        </div>
    )
}
