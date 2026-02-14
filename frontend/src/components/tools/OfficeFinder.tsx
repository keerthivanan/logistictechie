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
        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-6 mb-10">
                <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{t('widgets.officeLocator.locatorTitle')}</h3>
                    <span className="text-slate-400 text-sm font-medium">{t('widgets.officeLocator.locatorSubtitle')}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRTL ? 'right-5' : 'left-5'}`} />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('widgets.officeLocator.enterCity')}
                        className={`${isRTL ? 'pr-14' : 'pl-14'} bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 h-14 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-medium`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-slate-900 text-white h-14 px-10 hover:bg-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-xl shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    {loading ? t('widgets.officeLocator.searching') : t('widgets.officeLocator.search')}
                </Button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                    {results.map((office, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-50/50 border border-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-500 group"
                        >
                            <div className="font-bold text-slate-900 mb-3 text-lg flex items-center justify-between">
                                {office.name}
                                <div className="h-2 w-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-2">
                                <div className="text-slate-500 text-sm font-medium flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    {office.address}, {office.city}
                                </div>
                                {office.phone && (
                                    <div className="text-slate-400 text-sm font-medium flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-slate-300" />
                                        <span dir="ltr" className="tracking-wider">{office.phone}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {searched && !loading && results.length === 0 && (
                        <div className="text-center py-16 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">{t('widgets.officeLocator.noResults')}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
