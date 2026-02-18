'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

interface User {
    id: string;
    sovereign_id: string;
    name: string;
    email: string;
    avatar_url?: string;
    onboarding_completed: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, name: string, onboarding_completed: boolean, sovereign_id: string) => void;
    logout: () => void;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Hydrate from localStorage
        const token = localStorage.getItem('token');
        const name = localStorage.getItem('user_name');

        if (token) {
            // In a real app, we'd decode JWT to get ID. 
            // For now, we'll hit the /me endpoint or just mock ID to fix the immediate blocker
            // But we need the ID for the marketplace submission!
            // Let's assume the /login response included it, or we fetch it.
            // Since login/page.tsx didn't save ID, we must fetch it.
            fetchProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser({
                    id: data.id,
                    sovereign_id: data.sovereign_id,
                    name: data.full_name || data.email,
                    email: data.email,
                    avatar_url: data.avatar_url,
                    onboarding_completed: data.onboarding_completed
                });
            } else {
                logout(); // Invalid token
            }
        } catch (e) {
            console.error("Auth hydration failed", e);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        const token = localStorage.getItem('token');
        if (token) await fetchProfile(token);
    };

    const login = (token: string, name: string, onboarding_completed: boolean, sovereign_id: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user_name', name);
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

        setUser({
            id: '', // Temporary until fetchProfile updates it
            sovereign_id,
            name,
            email: '',
            onboarding_completed
        });

        fetchProfile(token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_name');
        document.cookie = "token=; path=/; max-age=0";
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
