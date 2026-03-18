'use client';

import { useState, useRef, useEffect } from 'react';
import { Ship, X, Loader2, Search } from 'lucide-react';
import { API_URL } from '@/lib/config';

interface VesselAutocompleteProps {
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
}

export default function VesselAutocomplete({ name, value, onChange, placeholder }: VesselAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const searchTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (q: string) => {
        if (q.length < 2) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const url = `${API_URL}/api/references/vessels/search?q=${encodeURIComponent(q)}`;
            const res = await fetch(url);
            const data = await res.json();
            setSuggestions(data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);
        onChange(name, val);

        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchSuggestions(val), 200);
    };

    const handleSelect = (vesselName: string) => {
        setQuery(vesselName);
        onChange(name, vesselName);
        setIsOpen(false);
    };

    const clearInput = () => {
        setQuery('');
        onChange(name, '');
        setSuggestions([]);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative flex items-center group">
                <Ship className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors z-10" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder || "Search Global Vessel Fleet..."}
                    className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-[10px] font-black text-white placeholder:text-white/10 focus:border-white/20 outline-none font-inter transition-all shadow-[inset_0_0_20px_rgba(255,255,255,0.01)]"
                    autoComplete="off"
                />

                {query && !isSearching && (
                    <button
                        type="button"
                        onClick={clearInput}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors z-10 p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-black border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] z-[100] overflow-hidden backdrop-blur-3xl">
                    {suggestions.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(item.name)}
                                    className="w-full px-6 py-4 text-left hover:bg-white/[0.03] flex items-center justify-between group/item transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black font-outfit text-white group-hover/item:text-white transition-colors uppercase tracking-tight">
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] text-white/20 font-mono uppercase tracking-tighter">
                                                IMO: {item.imo}
                                            </span>
                                            <div className="w-1 h-1 bg-white/10 rounded-full" />
                                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest font-inter">
                                                Registry: {item.flag}
                                            </span>
                                        </div>
                                    </div>
                                    <Search className="w-3 h-3 text-white/10 group-hover/item:text-white/40 transition-colors" />
                                </button>
                            ))}
                        </div>
                    ) : !isSearching && query.length >= 2 && (
                        <div className="p-8 text-center">
                            <Ship className="w-8 h-8 text-white/5 mx-auto mb-3" />
                            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
                                No vessels detected in sector &quot;{query}&quot;
                            </p>
                        </div>
                    )}
                    {query.length < 2 && !isSearching && (
                        <div className="p-8 text-center">
                            <div className="flex justify-center gap-2 mb-3">
                                <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce" />
                            </div>
                            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
                                Awaiting fleet identification...
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}
