'use client';

import { AuthProvider } from '@/context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = "852578606600-um6nsb17r0qm2hs5m7jmfhohtdcb9o27.apps.googleusercontent.com"; // SOVEREIGN Production Client

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
