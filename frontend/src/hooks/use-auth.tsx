"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    role?: string;
}

export function useAuth() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") {
            setIsLoading(true);
        } else if (status === "authenticated" && session?.user) {
            setIsAuthenticated(true);
            setUser({
                id: (session.user as any).id || "",
                name: session.user.name,
                email: session.user.email,
                avatar_url: session.user.image,
                role: "user"
            });
            setIsLoading(false);
        } else {
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
        }
    }, [session, status]);

    const logout = () => {
        signOut({ callbackUrl: "/login" });
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        logout,
        refresh: () => { }, // No-op in next-auth
        tryRefresh: async () => true // handled by next-auth
    };
}


