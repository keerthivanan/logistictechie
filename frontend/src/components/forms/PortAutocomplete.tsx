'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, MapPin, Plus, Search } from 'lucide-react';
import { apiFetch } from '@/lib/config';

interface PortAutocompleteProps {
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
    countryCode?: string;
    termType?: string;
}

export default function PortAutocomplete({ name, value, onChange, placeholder, countryCode, termType }: PortAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const searchTimer = useRef<NodeJS.Timeout | null>(null);

    // Sync external value
    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (q: string) => {
        if (q.length < 1) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        try {
            let url = `${API_URL}/api/references/ports/search?q=${encodeURIComponent(q)}`;
            if (countryCode) {
                url += `&country=${countryCode}`;
            }
            if (termType) {
                url += `&term_type=${termType}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setSuggestions(data.results || []);
            // Intentionally not setting isOpen here to avoid pop-opens after selection
        } catch (e) {
            console.error("Link Error", e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onChange(name, val); // Keep external form state updated with literal text

        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchSuggestions(val), 200);
    };

    const handleSelect = (s: any) => {
        setQuery(s.name);
        onChange(name, s.name);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                    setIsOpen(true);
                    if (query.length >= 1 && suggestions.length === 0) fetchSuggestions(query);
                }}
                placeholder={placeholder || "Search Port / Terminal..."}
                className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-white/20 outline-none font-inter"
                autoComplete="off"
            />
            {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                </div>
            )}

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">

                    {/* Results or Fallbacks */}
                    {suggestions.length > 0 &&
                        suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelect(s)}
                                className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0 group transition-colors"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-inter font-bold text-white group-hover:text-white transition-colors">
                                            {s.name}
                                        </span>
                                        {s.code && (
                                            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">
                                                {s.code}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                                        {s.country} {s.type && `• ${s.type}`}
                                    </div>
                                </div>
                                <Search className="w-3 h-3 text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                            </button>
                        ))
                    }

                    {suggestions.length === 0 && !isSearching && query.length < 2 && (
                        <div className="p-4 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            Type to search Global Database
                        </div>
                    )}

                    {!isSearching && query.length >= 2 && suggestions.length === 0 && (
                        <div className="p-4 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            No ports or terminals found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
