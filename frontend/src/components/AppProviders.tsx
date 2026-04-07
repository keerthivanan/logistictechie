'use client';

import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <GoogleOAuthProvider clientId={CLIENT_ID}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </GoogleOAuthProvider>
        </LanguageProvider>
    );
}
