'use client';

import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = "852578606600-ml0l805q3ptsrrrj57gu24jjifpfnjkj.apps.googleusercontent.com";

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
