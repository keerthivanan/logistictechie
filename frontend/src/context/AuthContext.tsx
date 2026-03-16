'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/config';

interface User {
    id: string;
    sovereign_id: string;
    name: string;
    email: string;
    role: string;
    phone_number?: string;
    company_name?: string;
    company_email?: string;
    website?: string;
    avatar_url?: string;
    onboarding_completed: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, name: string, onboarding_completed: boolean, sovereign_id: string, role: string, avatar_url?: string, user_id?: string, email?: string) => void;
    logout: () => void;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: (token, name, onboarding, sovereign, role, avatar, id, email) => { },
    logout: () => { },
    loading: true,
    refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('avatar_url');
        localStorage.removeItem('sovereign_id');
        localStorage.removeItem('user_role');
        localStorage.removeItem('onboarding_completed');
        document.cookie = "token=; path=/; max-age=0";
        setUser(null);
        router.push('/');
    }, [router, setUser]);

    const fetchProfile = useCallback(async (token: string) => {
        try {
            const res = await apiFetch(`/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Always sync localStorage so page-reload reflects latest role/sovereign_id
                // (critical after forwarder promotion: OMEGO-XXXX → REG-OMEGO-XXXX)
                localStorage.setItem('sovereign_id', data.sovereign_id);
                localStorage.setItem('user_role', data.role || 'user');
                if (data.full_name) localStorage.setItem('user_name', data.full_name);
                setUser({
                    id: data.id,
                    sovereign_id: data.sovereign_id,
                    name: data.full_name || data.email,
                    email: data.email,
                    role: data.role || 'user',
                    phone_number: data.phone_number,
                    company_name: data.company_name,
                    company_email: data.company_email,
                    website: data.website,
                    avatar_url: data.avatar_url,
                    onboarding_completed: data.onboarding_completed
                });
            } else {
                handleLogout();
            }
        } catch (e) {
        } finally {
            setLoading(false);
        }
    }, [setUser, handleLogout]);

    useEffect(() => {
        // Hydrate from localStorage
        const token = localStorage.getItem('token');
        const name = localStorage.getItem('user_name');
        const avatar_url = localStorage.getItem('avatar_url');
        const sovereign_id = localStorage.getItem('sovereign_id');
        const role = localStorage.getItem('user_role') || 'user';
        const onboarding_completed = localStorage.getItem('onboarding_completed') === 'true';

        if (token && name) {
            // Ensure cookie is in sync with localStorage for Middleware
            document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;

            setUser({
                id: '', // Will be refreshed by fetchProfile
                sovereign_id: sovereign_id || 'ID-PENDING',
                name,
                email: '',
                role,
                avatar_url: avatar_url || undefined,
                onboarding_completed
            });
            fetchProfile(token);
        } else {
            // If no localStorage but cookie exists, clear the cookie to prevent middleware loops
            if (document.cookie.includes('token=')) {
                document.cookie = "token=; path=/; max-age=0";
            }
            setLoading(false);
        }
    }, [fetchProfile]);

    const refreshProfile = async () => {
        const token = localStorage.getItem('token');
        if (token) await fetchProfile(token);
    };

    const login = (token: string, name: string, onboarding_completed: boolean, sovereign_id: string, role: string, avatar_url?: string, user_id?: string, email?: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user_name', name);
        localStorage.setItem('sovereign_id', sovereign_id);
        localStorage.setItem('user_role', role);
        localStorage.setItem('onboarding_completed', String(onboarding_completed));
        if (avatar_url) localStorage.setItem('avatar_url', avatar_url);

        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;

        setUser({
            id: user_id || '',
            sovereign_id,
            name,
            email: email || '',
            role,
            onboarding_completed,
            avatar_url
        });

        // Finalize state immediately. We trust the login provider details.
        setLoading(false);
    };

    const logout = () => {
        const token = localStorage.getItem('token');
        // Fire-and-forget: log LOGOUT activity on backend (don't block UI)
        if (token) {
            apiFetch(`/api/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => { /* ignore network errors on logout */ });
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('avatar_url');
        localStorage.removeItem('sovereign_id');
        localStorage.removeItem('user_role');
        localStorage.removeItem('onboarding_completed');
        document.cookie = "token=; path=/; max-age=0";
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
