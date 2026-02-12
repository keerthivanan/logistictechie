import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch("http://localhost:8000/api/auth/login", {
                        method: "POST",
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const user = await res.json();

                    if (res.ok && user) {
                        return {
                            id: user.user_id,
                            name: user.user_name,
                            email: credentials.email,
                            accessToken: user.access_token // Store for API calls
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Auth Error:", e);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user, account, profile }) {
            // Initial sign-in
            if (user && account) {
                if (account.provider === "credentials") {
                    token.accessToken = (user as any).accessToken;
                    token.id = user.id;
                } else if (account.provider === "google") {
                    // 👑 SOCIAL SYNC HANDSHAKE
                    try {
                        const res = await fetch("http://localhost:8000/api/auth/social-sync", {
                            method: "POST",
                            body: JSON.stringify({
                                email: user.email,
                                name: user.name,
                                image: user.image,
                                provider: "google"
                            }),
                            headers: { "Content-Type": "application/json" }
                        });
                        if (res.ok) {
                            const syncData = await res.json();
                            token.accessToken = syncData.access_token;
                            token.id = syncData.user_id;
                        }
                    } catch (e) {
                        console.error("Social Sync Failed:", e);
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).accessToken = token.accessToken;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
