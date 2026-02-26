'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

interface User {
    id: string;
    sovereign_id: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
    onboarding_completed: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, name: string, onboarding_completed: boolean, sovereign_id: string, role: string, avatar_url?: string, user_id?: string) => void;
    logout: () => void;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: (token, name, onboarding, sovereign, role, avatar, id) => { },
    logout: () => { },
    loading: true,
    refreshProfile: async () => { },
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
        const avatar_url = localStorage.getItem('avatar_url');
        const sovereign_id = localStorage.getItem('sovereign_id');
        const role = localStorage.getItem('user_role') || 'user';
        const onboarding_completed = true; // HARD-WIRED FOR PERMANENT ACCESS

        if (token && name) {
            console.log("[AUTH] Hydrating Citizen Session:", name);
            // Ensure cookie is in sync with localStorage for Middleware
            document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

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
                console.log("[AUTH] Stale Cookie Detected. Purging for sync.");
                document.cookie = "token=; path=/; max-age=0";
            }
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
                console.log("[AUTH] Profile Refreshed for:", data.full_name);
                setUser({
                    id: data.id,
                    sovereign_id: data.sovereign_id,
                    name: data.full_name || data.email,
                    email: data.email,
                    role: data.role || 'user',
                    avatar_url: data.avatar_url,
                    onboarding_completed: data.onboarding_completed
                });
            } else {
                console.warn("[AUTH] Session Invalid. Triggering Clean Logout.");
                logout(); // Invalid token
            }
        } catch (e) {
            console.error("[AUTH] Sync Failure:", e);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        const token = localStorage.getItem('token');
        if (token) await fetchProfile(token);
    };

    const login = (token: string, name: string, onboarding_completed: boolean, sovereign_id: string, role: string, avatar_url?: string, user_id?: string) => {
        console.log("[AUTH] Initializing Secure Link for:", name);
        localStorage.setItem('token', token);
        localStorage.setItem('user_name', name);
        localStorage.setItem('sovereign_id', sovereign_id);
        localStorage.setItem('user_role', role);
        localStorage.setItem('onboarding_completed', 'true');
        if (avatar_url) localStorage.setItem('avatar_url', avatar_url);

        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

        setUser({
            id: user_id || '',
            sovereign_id,
            name,
            email: '',
            role,
            onboarding_completed,
            avatar_url
        });

        // Finalize state immediately. We trust the login provider details.
        setLoading(false);
    };

    const logout = () => {
        console.log("[AUTH] Terminating Citizen Session.");
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
