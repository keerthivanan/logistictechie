'use client';

import { useState, useRef, useEffect } from 'react';
import { Package, X, Loader2, Info, Plus, Search } from 'lucide-react';
import { API_URL } from '@/lib/config';

interface CommodityAutocompleteProps {
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
}



export default function CommodityAutocomplete({ name, value, onChange, placeholder }: CommodityAutocompleteProps) {
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

    const fetchSuggestions = async (q: string = "") => {
        setIsSearching(true);
        try {
            const queryParam = q.trim() ? `q=${encodeURIComponent(q.trim())}` : "";
            const url = `${API_URL}/api/references/commodities/search?${queryParam}`;
            const res = await fetch(url);
            const data = await res.json();

            const apiResults = (data.results || []).map((r: any) => ({ ...r, source: "API" }));
            setSuggestions(apiResults.slice(0, 30));
        } catch (err) {
            console.error(err);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true); // Open immediately so they see the custom entry item updating
        onChange(name, val);

        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchSuggestions(val), val.length === 0 ? 0 : 200);
    };

    const handleSelect = (item: string | { name: string; id?: string; code?: string }) => {
        let val: string;
        if (typeof item === 'string') {
            val = item;
        } else {
            val = item.name;
        }
        setQuery(val);
        onChange(name, val);
        setIsOpen(false);
    };

    const clearInput = () => {
        setQuery('');
        onChange(name, '');
        setSuggestions([]);
        setIsOpen(false);
    };

    const results = suggestions; // API results

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative flex items-center">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 z-10" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsOpen(true);
                        if (suggestions.length === 0) fetchSuggestions(query);
                    }}
                    placeholder={placeholder || "Search commodity..."}
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
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin z-10" />
                )}
            </div>

            {/* Dropdown Suggestions */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">

                    {/* Suggestions (API + Comprehensive Fallbacks) */}
                    {results.length > 0 ? (
                        <>
                            {/* Subtle Custom Option at top if user typed something */}
                            {query.length > 0 && !results.some(r => r.name.toLowerCase() === query.toLowerCase()) && (
                                <button
                                    onClick={() => handleSelect(query)}
                                    className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 group transition-colors bg-white/[0.02]"
                                >
                                    <div className="flex items-center gap-3">
                                        <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                                        <div>
                                            <div className="text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider">Custom: &quot;{query}&quot;</div>
                                        </div>
                                    </div>
                                </button>
                            )}

                            {results.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(item.name)}
                                    className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0 group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-inter font-bold text-white group-hover:text-white transition-colors">
                                            {item.name}
                                        </span>
                                        <span className="text-[9px] text-zinc-600 font-mono mt-0.5 uppercase tracking-tighter">
                                            {item.source === "API" ? `Reference ID: ${item.id}` : "Standard Shipping Class"}
                                        </span>
                                    </div>
                                    <Search className="w-3 h-3 text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                                </button>
                            ))}
                        </>
                    ) : !isSearching && query.length < 2 && (
                        <div className="p-4 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-inter">
                            Search thousands of global products...
                        </div>
                    )}

                    {/* No results message */}
                    {!isSearching && query.length >= 2 && results.length === 0 && (
                        <button
                            onClick={() => handleSelect(query)}
                            className="w-full p-4 hover:bg-white/5 transition-colors group"
                        >
                            <div className="text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold group-hover:text-white">
                                No records found. Use custom: &quot;{query}&quot;
                            </div>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
