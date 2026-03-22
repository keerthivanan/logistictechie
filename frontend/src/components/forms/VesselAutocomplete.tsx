'use client';

import { useState, useRef, useEffect } from 'react';
import { Ship, X, Search } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { apiFetch } from '@/lib/config';

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
            const res = await apiFetch(`/api/references/vessels/search?q=${encodeURIComponent(q)}`);
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
                    className="w-full bg-black border border-white/5 rounded-xl pl-12 pr-12 py-3 text-sm font-medium text-white placeholder:text-zinc-700 focus:border-zinc-700 outline-none font-inter transition-colors"
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
                        <Spinner size="sm" />
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-black border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] z-[100] overflow-hidden backdrop-blur-3xl max-h-56 overflow-y-auto">
                    {isSearching ? (
                        <div className="flex items-center justify-center gap-2.5 px-6 py-5">
                            <Spinner size="sm" />
                            <span className="text-[11px] text-zinc-500 font-inter font-semibold uppercase tracking-widest">Searching vessels...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(item.name)}
                                    className="w-full px-6 py-4 text-left hover:bg-white/[0.03] flex items-center justify-between group/item transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-semibold font-outfit text-white group-hover/item:text-white transition-colors uppercase tracking-tight">
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
                    ) : query.length >= 2 ? (
                        <div className="p-8 text-center">
                            <Ship className="w-8 h-8 text-white/5 mx-auto mb-3" />
                            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-semibold">
                                No vessels detected for &quot;{query}&quot;
                            </p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-semibold">
                                Type at least 2 characters to search vessels
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}
