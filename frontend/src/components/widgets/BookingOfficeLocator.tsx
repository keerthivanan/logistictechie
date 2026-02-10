"use client";

import { useEffect, useState } from "react";
import { Building2, Phone, MapPin, Globe } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";

interface Office {
    name: string;
    city: string;
    country: string;
    address: string;
    phone: string;
}

interface OfficeLocatorProps {
    city?: string;
}

export function BookingOfficeLocator({ city = "Singapore" }: OfficeLocatorProps) {
    const [offices, setOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchCity, setSearchCity] = useState(city);
    const { t, direction } = useLanguage();
    const isRTL = direction === 'rtl';

    useEffect(() => {
        async function fetchOffices() {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await axios.get(`${apiUrl}/api/offices/search?city=${searchCity}`);
                setOffices(res.data.offices || []);
            } catch (error) {
                console.error("Failed to fetch offices:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOffices();
    }, [searchCity]);

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('widgets.officeLocator.title')}</h3>
                </div>
                <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder={t('widgets.officeLocator.searchPlaceholder')}
                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 outline-none"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                />
            </div>

            {loading ? (
                <div className="animate-pulse text-gray-400">{t('widgets.officeLocator.loading')}</div>
            ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {offices.map((office, idx) => (
                        <div
                            key={idx}
                            className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-white font-semibold">{office.name}</p>
                                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-xs">{office.city}, {office.country}</span>
                                    </div>
                                    {office.address && (
                                        <p className="text-xs text-gray-500 mt-2">{office.address}</p>
                                    )}
                                </div>
                                {office.phone && (
                                    <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                        <Phone className="w-3 h-3" />
                                        <span dir="ltr">{office.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {offices.length === 0 && (
                        <p className="text-gray-500 text-center py-4">{t('widgets.officeLocator.notFound')} {searchCity}</p>
                    )}
                </div>
            )}
        </div>
    );
}

