"use client";

import { useEffect, useState } from "react";
import { Building2, Phone, MapPin } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { BACKEND_URL } from "@/lib/logistics";

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
                const apiUrl = BACKEND_URL.replace('/api', '');
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
        <div className="bg-zinc-950/20 border border-white/5 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-white" />
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">{t('widgets.officeLocator.title')}</h3>
                </div>
                <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder={t('widgets.officeLocator.searchPlaceholder')}
                    className="bg-transparent border-b border-white/10 px-4 py-2 text-sm text-white placeholder-zinc-700 focus:border-white outline-none transition-all"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                />
            </div>

            {loading ? (
                <div className="animate-pulse text-[10px] font-bold tracking-[0.4em] text-zinc-700 uppercase">{t('widgets.officeLocator.loading')}</div>
            ) : (
                <div className="space-y-0 max-h-[300px] overflow-y-auto">
                    {offices.map((office, idx) => (
                        <div
                            key={idx}
                            className="py-4 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] transition-all duration-500"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-white uppercase tracking-wider">{office.name}</p>
                                    <div className="flex items-center gap-2 text-zinc-600 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-[10px] tracking-widest uppercase">{office.city}, {office.country}</span>
                                    </div>
                                    {office.address && (
                                        <p className="text-[10px] text-zinc-700 mt-2 tracking-wider">{office.address}</p>
                                    )}
                                </div>
                                {office.phone && (
                                    <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                                        <Phone className="w-3 h-3" />
                                        <span dir="ltr">{office.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {offices.length === 0 && (
                        <p className="text-zinc-700 text-center py-4 text-[10px] font-bold tracking-[0.4em] uppercase">{t('widgets.officeLocator.notFound')} {searchCity}</p>
                    )}
                </div>
            )}
        </div>
    );
}
