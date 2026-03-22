'use client';

import { useState, useRef, useEffect } from 'react';
import { Package, X, Search } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { apiFetch } from '@/lib/config';

interface CommodityAutocompleteProps {
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    onSelectItem?: (name: string, hsCode: string) => void;  // auto-fill HS code
    placeholder?: string;
}



export default function CommodityAutocomplete({ name, value, onChange, onSelectItem, placeholder }: CommodityAutocompleteProps) {
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
            const queryParam = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
            const res = await apiFetch(`/api/references/commodities/search${queryParam}`);
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
        setSuggestions([]); // clear stale results immediately
        onChange(name, val);

        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (val.length >= 2) {
            setIsOpen(true);
            searchTimer.current = setTimeout(() => fetchSuggestions(val), 200);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelect = (item: string | { name: string; id?: string; code?: string; hs_code?: string }) => {
        let val: string;
        let hsCode = '';
        if (typeof item === 'string') {
            val = item;
        } else {
            val = item.name;
            hsCode = item.hs_code || item.id || '';
        }
        setQuery(val);
        onChange(name, val);
        if (onSelectItem) onSelectItem(val, hsCode);
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
                        if (query.length >= 2) setIsOpen(true);
                    }}
                    placeholder={placeholder || "Search commodity..."}
                    className="w-full bg-black border border-white/5 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-white focus:border-zinc-700 outline-none font-inter transition-colors"
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

            </div>

            {/* Dropdown Suggestions */}
            {isOpen && query.length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {isSearching ? (
                        <div className="flex items-center justify-center gap-2.5 px-4 py-5">
                            <Spinner size="sm" />
                            <span className="text-[11px] text-zinc-500 font-inter font-semibold uppercase tracking-widest">Searching commodities...</span>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(item)}
                                className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0 group"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-inter font-bold text-white group-hover:text-white transition-colors">
                                        {item.name}
                                    </span>
                                    <span className="text-[9px] text-zinc-600 font-mono mt-0.5 uppercase tracking-tighter">
                                        {item.id ? `HS: ${item.id}` : "Standard Shipping Class"}
                                        {item.type && item.type !== 'DRY' ? ` · ${item.type}` : ''}
                                    </span>
                                </div>
                                <Search className="w-3 h-3 text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold font-inter">
                            No commodities found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
