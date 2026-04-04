'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/config';

interface User {
    id: string;
    sovereign_id: string;
    forwarder_id?: string;
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
    login: (token: string, name: string, onboarding_completed: boolean, sovereign_id: string, role: string, avatar_url?: string, user_id?: string, email?: string, forwarder_id?: string, refresh_token?: string) => void;
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
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('avatar_url');
        localStorage.removeItem('sovereign_id');
        localStorage.removeItem('forwarder_id');
        localStorage.removeItem('user_role');
        localStorage.removeItem('onboarding_completed');
        document.cookie = "token=; path=/; max-age=0";
        setUser(null);
        router.push('/');
    }, [router, setUser]);

    const applyProfileData = useCallback((data: any) => {
        localStorage.setItem('sovereign_id', data.sovereign_id);
        localStorage.setItem('user_role', data.role || 'user');
        if (data.full_name) localStorage.setItem('user_name', data.full_name);
        if (data.email) localStorage.setItem('user_email', data.email);
        if (data.forwarder_id) localStorage.setItem('forwarder_id', data.forwarder_id);
        else localStorage.removeItem('forwarder_id');
        setUser({
            id: data.id,
            sovereign_id: data.sovereign_id,
            forwarder_id: data.forwarder_id || undefined,
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
    }, [setUser]);

    const fetchProfile = useCallback(async (token: string, isRetry = false) => {
        try {
            const res = await apiFetch(`/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                applyProfileData(data);
            } else if (res.status === 401 && !isRetry) {
                // Access token expired — try refresh before logging out
                const rt = localStorage.getItem('refresh_token');
                if (rt) {
                    try {
                        const refreshRes = await apiFetch('/api/auth/refresh', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refresh_token: rt }),
                        });
                        if (refreshRes.ok) {
                            const refreshData = await refreshRes.json();
                            const newToken = refreshData.access_token;
                            localStorage.setItem('token', newToken);
                            if (refreshData.refresh_token) localStorage.setItem('refresh_token', refreshData.refresh_token);
                            const secure = window.location.protocol === 'https:' ? '; Secure' : '';
                            document.cookie = `token=${newToken}; path=/; max-age=604800; SameSite=Lax${secure}`;
                            await fetchProfile(newToken, true);
                            return;
                        }
                    } catch { /* refresh network error — fall through to logout */ }
                }
                handleLogout();
            } else if (res.status !== 401) {
                // Non-auth error (500 etc.) — don't log out, just stop loading
            } else {
                handleLogout();
            }
        } catch (e) {
        } finally {
            setLoading(false);
        }
    }, [applyProfileData, handleLogout]);

    useEffect(() => {
        // Hydrate from localStorage
        const token = localStorage.getItem('token');
        const name = localStorage.getItem('user_name');
        const avatar_url = localStorage.getItem('avatar_url');
        const sovereign_id = localStorage.getItem('sovereign_id');
        const role = localStorage.getItem('user_role') || 'user';
        const onboarding_completed = localStorage.getItem('onboarding_completed') === 'true';

        const email = localStorage.getItem('user_email') || '';
        const forwarder_id = localStorage.getItem('forwarder_id') || undefined;

        if (token && name) {
            // Ensure cookie is in sync with localStorage for Middleware
            const secure = window.location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax${secure}`;

            setUser({
                id: '', // Will be refreshed by fetchProfile
                sovereign_id: sovereign_id || 'ID-PENDING',
                forwarder_id,
                name,
                email,
                role,
                avatar_url: avatar_url || undefined,
                onboarding_completed
            });
            setLoading(false); // Unblock UI immediately from localStorage cache
            fetchProfile(token); // Silently refresh in background
        } else {
            // If no localStorage but cookie exists, clear the cookie to prevent middleware loops
            if (document.cookie.includes('token=')) {
                document.cookie = "token=; path=/; max-age=0";
            }
            setLoading(false);
        }
    }, [fetchProfile]);

    // Auto-refresh access token every 13 minutes (before the 15-min expiry)
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(async () => {
            const rt = localStorage.getItem('refresh_token');
            if (!rt) return;
            try {
                const res = await apiFetch('/api/auth/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: rt }),
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('token', data.access_token);
                    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
                    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
                    document.cookie = `token=${data.access_token}; path=/; max-age=604800; SameSite=Lax${secure}`;
                } else {
                    handleLogout();
                }
            } catch { /* silent — next poll will retry */ }
        }, 13 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user, handleLogout]);

    const refreshProfile = async () => {
        const token = localStorage.getItem('token');
        if (token) await fetchProfile(token);
    };

    const login = (token: string, name: string, onboarding_completed: boolean, sovereign_id: string, role: string, avatar_url?: string, user_id?: string, email?: string, forwarder_id?: string, refresh_token?: string) => {
        localStorage.setItem('token', token);
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
        else localStorage.removeItem('refresh_token');
        localStorage.setItem('user_name', name);
        localStorage.setItem('sovereign_id', sovereign_id);
        localStorage.setItem('user_role', role);
        localStorage.setItem('onboarding_completed', String(onboarding_completed));
        if (avatar_url) localStorage.setItem('avatar_url', avatar_url);
        if (email) localStorage.setItem('user_email', email);
        else localStorage.removeItem('user_email');
        if (forwarder_id) localStorage.setItem('forwarder_id', forwarder_id);
        else localStorage.removeItem('forwarder_id');

        const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax${secure}`;

        setUser({
            id: user_id || '',
            sovereign_id,
            forwarder_id: forwarder_id || undefined,
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
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('avatar_url');
        localStorage.removeItem('sovereign_id');
        localStorage.removeItem('forwarder_id');
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
