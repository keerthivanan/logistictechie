"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Building, Calendar, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProfilePage() {
    const router = useRouter();
    const { t, direction, language } = useLanguage();
    const isRTL = direction === 'rtl';
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.get(`${apiUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setEditData(res.data);
        } catch (e) {
            console.error("Profile Fetch Error", e);
            router.push("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await axios.put(`${apiUrl}/api/auth/update-profile`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchProfile();
            setIsEditing(false);
        } catch (e) {
            console.error("Profile Update Error", e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t('dashboard.loading')}</div>;

    return (
        <main className="min-h-screen bg-black text-white pt-24 px-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-2xl mx-auto">
                <Button onClick={() => router.back()} variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
                    <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} /> {t('profile.back')}
                </Button>

                <Card className="bg-zinc-900/50 border-zinc-800 p-8 rounded-2xl overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-900/20 to-black"></div>

                    <div className="relative pt-10">
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 text-center md:text-left">
                            <div className="h-24 w-24 rounded-full bg-zinc-800 border-4 border-black flex items-center justify-center text-3xl font-bold text-emerald-500 shadow-xl overflow-hidden">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    (user.full_name || "U").charAt(0).toUpperCase()
                                )}
                            </div>

                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-2xl font-bold text-white w-full mb-2"
                                        value={editData.full_name || ""}
                                        onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                    />
                                ) : (
                                    <h1 className="text-3xl font-bold text-white mb-1">{user.full_name || "Logistics User"}</h1>
                                )}
                                <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 text-sm">
                                    <Building className="h-3 w-3" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="bg-zinc-800/50 border border-zinc-700 rounded px-2 py-0.5"
                                            value={editData.company_name || ""}
                                            onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                                        />
                                    ) : (
                                        user.company_name || "Independent Trader"
                                    )}
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-emerald-500 font-medium">{user.role || "Standard User"}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-zinc-400">
                                            {t('common.cancel')}
                                        </Button>
                                        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white hover:bg-emerald-500 px-6">
                                            {saving ? "..." : t('common.save')}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)} className="bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg">
                                        {t('profile.edit')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mb-8 p-4 bg-zinc-800/20 border border-zinc-700 rounded-xl">
                                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2 block">Avatar URL</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/photo.jpg"
                                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white w-full"
                                    value={editData.avatar_url || ""}
                                    onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="grid gap-4">
                            <div className="p-4 bg-zinc-800/30 rounded-xl flex items-center gap-4 border border-zinc-800">
                                <Mail className="h-5 w-5 text-zinc-500" />
                                <div className="flex-1">
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{t('profile.email')}</div>
                                    <div className="text-white font-medium">{user.email}</div>
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-800/30 rounded-xl flex items-center gap-4 border border-zinc-800">
                                <User className="h-5 w-5 text-zinc-500" />
                                <div className="flex-1">
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Phone Number</div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white w-full mt-1"
                                            value={editData.phone_number || ""}
                                            onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                                        />
                                    ) : (
                                        <div className="text-white font-medium">{user.phone_number || "Not provided"}</div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-800/30 rounded-xl flex items-center gap-4 border border-zinc-800">
                                <Calendar className="h-5 w-5 text-zinc-500" />
                                <div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{t('profile.memberSince')}</div>
                                    <div className="text-white font-medium">
                                        {new Date(user.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section Placeholder */}
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                <div className="text-3xl font-bold text-white mb-1">100% Honest</div>
                                <div className="text-xs text-emerald-400 uppercase tracking-wider font-bold">Data Legitimacy</div>
                            </div>
                            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                                <div className="text-3xl font-bold text-white mb-1">Sovereign</div>
                                <div className="text-xs text-blue-400 uppercase tracking-wider font-bold">Level-1 Verified</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </main>
    );
}
