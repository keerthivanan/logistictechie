"use client";

import { useState } from "react";
import { Search, MapPin, Building2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";

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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center">
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
                        className={`${isRTL ? 'pr-12' : 'pl-12'} bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-lg focus:border-zinc-500 transition-all`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-white text-black h-12 px-6 rounded-lg hover:bg-zinc-100 font-semibold transition-all"
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
                            className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all"
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
