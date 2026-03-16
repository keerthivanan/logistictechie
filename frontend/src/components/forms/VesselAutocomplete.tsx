'use client';

import { useState, useRef, useEffect } from 'react';
import { Ship, X, Loader2, Search } from 'lucide-react';
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
            <div className="relative flex items-center">
                <Ship className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 z-10" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder || "Search Vessel..."}
                    className="w-full bg-black border border-white/5 rounded-lg pl-10 pr-10 py-2.5 text-[10px] font-bold text-white focus:border-white/20 outline-none font-inter transition-all"
                    autoComplete="off"
                />

                {query && !isSearching && (
                    <button
                        type="button"
                        onClick={clearInput}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin z-10" />
                )}
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        suggestions.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(item.name)}
                                className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0 group"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-inter font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {item.name}
                                    </span>
                                    <span className="text-[9px] text-zinc-600 font-mono mt-0.5 uppercase tracking-tighter">
                                        IMO: {item.imo} | Flag: {item.flag}
                                    </span>
                                </div>
                                <Search className="w-3 h-3 text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                            </button>
                        ))
                    ) : !isSearching && query.length >= 2 && (
                        <div className="p-4 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            No vessels found for &quot;{query}&quot;
                        </div>
                    )}
                    {query.length < 2 && !isSearching && (
                        <div className="p-4 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            Type to search Global Vessels
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
