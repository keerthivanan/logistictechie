"use client";

import { LanguageProvider } from '@/contexts/LanguageContext';
import { GoogleMapsProvider } from './providers/GoogleMapsProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <GoogleMapsProvider>
                {children}
            </GoogleMapsProvider>
        </LanguageProvider>
    );
}
