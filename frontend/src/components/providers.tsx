"use client";

import { LanguageProvider } from '@/contexts/LanguageContext';
import { GoogleMapsProvider } from './providers/GoogleMapsProvider';
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LanguageProvider>
                <GoogleMapsProvider>
                    {children}
                </GoogleMapsProvider>
            </LanguageProvider>
        </SessionProvider>
    );
}

