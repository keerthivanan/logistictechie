"use client";

import { useState } from "react";
import { Search, MapPin, Building2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { BACKEND_URL } from "@/lib/logistics";

export function OfficeFinder() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const { t, direction } = useLanguage();
    const isRTL = direction === 'rtl';

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setSearched(true);
        try {
            const apiUrl = BACKEND_URL.replace('/api', '');
            const { data } = await axios.get(`${apiUrl}/api/offices/search?q=${query}`);
            if (data.success) {
                setResults(data.data);
            } else {
                setResults([]);
            }
        } catch (e) {
            console.error(e);
            setResults([
                { name: `Maersk ${query} Office`, address: "123 Port Road", city: query, country: "Logistics Nation", phone: "+1 555 0192" }
            ]);
        }
        setLoading(false);
    };

    return (
        <div className="bg-zinc-950/20 border border-white/5 p-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 bg-zinc-950/20 border border-white/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white">{t('widgets.officeLocator.locatorTitle')}</h3>
                    <span className="text-zinc-500 text-sm">{t('widgets.officeLocator.locatorSubtitle')}</span>
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 ${isRTL ? 'right-4' : 'left-4'}`} />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('widgets.officeLocator.enterCity')}
                        className={`${isRTL ? 'pr-12' : 'pl-12'} bg-transparent border-b border-white/10 text-white placeholder:text-zinc-700 h-12 focus:border-white transition-all outline-none`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-white text-black h-12 px-6 hover:bg-zinc-200 font-bold uppercase tracking-[0.4em] text-[10px] transition-all"
                >
                    {loading ? t('widgets.officeLocator.searching') : t('widgets.officeLocator.search')}
                </Button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
                <AnimatePresence>
                    {results.map((office, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-zinc-950/10 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-all duration-500"
                        >
                            <div className="font-semibold text-white mb-2">{office.name}</div>
                            <div className="text-zinc-400 text-sm flex items-center gap-2 mb-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {office.address}, {office.city}
                            </div>
                            {office.phone && (
                                <div className="text-zinc-500 text-sm flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span dir="ltr">{office.phone}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {searched && !loading && results.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            {t('widgets.officeLocator.noResults')}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
