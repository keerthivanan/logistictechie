import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Import Axios
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState(""); // Add state
    const [password, setPassword] = useState(""); // Add state
    const router = useRouter();

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            // 🔒 REAL BACKEND AUTH CALL
            const response = await axios.post("http://localhost:8000/api/auth/login", {
                email: email,
                password: password
            });

            if (response.data.access_token) {
                // Store token (securely in cookie in prod, localStorage for MVP)
                localStorage.setItem("token", response.data.access_token);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error("Login Failed", error);
            alert("Authentication Failed: Check Backend Logs");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
            {/* Minimalist Background */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <Card className="p-8 space-y-8 border-white/10 bg-black border shadow-2xl rounded-xl">
                    <div className="text-center space-y-2">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white mb-4">
                            <Lock className="h-6 w-6 text-black" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tighter">{t('login.title')}</h1>
                        <p className="text-gray-400 font-light">{t('login.subtitle')}</p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('login.client_id')}</label>
                            <Input
                                placeholder="USR-8821..."
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 focus:border-white focus:ring-0 rtl:text-right rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('login.client_id')}</label>
                            <Input
                                placeholder="admin@logistics.os"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 focus:border-white focus:ring-0 rtl:text-right rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('login.passkey')}</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12 focus:border-white focus:ring-0 rtl:text-right rounded-lg"
                            />
                        </div>

                        <Button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full bg-white hover:bg-gray-200 text-black h-12 font-bold transition-all active:scale-[0.98] rounded-lg mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                                    {t('login.authenticating')}
                                </>
                            ) : t('login.authenticate')}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-600 pt-6 border-t border-white/10">
                        <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1 font-medium">
                            <span className="rtl:hidden">←</span> {t('login.return')} <span className="ltr:hidden">→</span>
                        </Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}
