'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';


export interface PortResult {
    name: string;       // display name (terminal name or city)
    city: string;       // city name
    code: string;       // UNLOCODE e.g. "CNSHA"
    country: string;
    country_code: string;
    region: string;
    type: string;
}

interface PortAutocompleteProps {
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    onSelect?: (result: PortResult) => void;
    placeholder?: string;
    countryCode?: string;   // 2-letter ISO code e.g. "CN"
    countryName?: string;   // display name e.g. "China" (for error messages)
    termType?: string;
}

export default function PortAutocomplete({
    name, value, onChange, onSelect, placeholder, countryCode, countryName, termType
}: PortAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<PortResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [countryError, setCountryError] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => { setQuery(value); }, [value]);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setCountryError('');
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const fetchSuggestions = async (q: string) => {
        if (q.length < 2) { setSuggestions([]); return; }
        setIsSearching(true);
        try {
            let path = `/api/references/ports/search?q=${encodeURIComponent(q)}`;
            if (countryCode) path += `&country=${encodeURIComponent(countryCode)}`;
            if (termType)    path += `&term_type=${encodeURIComponent(termType)}`;
            const res = await fetch(path);
            const data = await res.json();
            setSuggestions(data.results || []);
        } catch { setSuggestions([]); }
        finally { setIsSearching(false); }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);
        setCountryError('');
        onChange(name, val);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => fetchSuggestions(val), 220);
    };

    const handleSelect = (s: PortResult) => {
        // Block if port country doesn't match selected country
        if (countryCode && s.country_code && s.country_code.toUpperCase() !== countryCode.toUpperCase()) {
            const expectedCountry = countryName || countryCode;
            setCountryError(`Only ${expectedCountry} ports allowed. "${s.city}" is in ${s.country}.`);
            return;
        }
        setCountryError('');
        const display = s.code ? `${s.city} (${s.code})` : s.city;
        setQuery(display);
        onChange(name, display);
        if (onSelect) onSelect(s);
        setIsOpen(false);
        setSuggestions([]);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsOpen(true);
                        setCountryError('');
                        if (query.length >= 2 && suggestions.length === 0) fetchSuggestions(query);
                    }}
                    placeholder={placeholder || 'Search port or terminal...'}
                    className="w-full bg-black border border-white/[0.06] rounded-xl pl-9 pr-8 py-3 text-sm text-white placeholder-zinc-700 font-inter"
                    autoComplete="off"
                />
            </div>

            {/* Country mismatch error */}
            {countryError && (
                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="text-[10px] text-red-400 font-inter font-semibold">{countryError}</span>
                </div>
            )}

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-black border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] z-[100] overflow-hidden backdrop-blur-3xl max-h-56 overflow-y-auto">
                    {isSearching ? (
                        <div className="flex items-center justify-center gap-2.5 px-6 py-5">
                            <Spinner size="sm" />
                            <span className="text-[11px] text-zinc-500 font-inter font-semibold uppercase tracking-widest">Searching ports...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelect(s)}
                                    className="w-full px-6 py-4 text-left hover:bg-white/[0.03] flex items-center justify-between group/item transition-colors"
                                >
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-semibold font-outfit text-white uppercase tracking-tight truncate">{s.name}</span>
                                            {s.code && (
                                                <span className="text-[9px] font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded flex-shrink-0">{s.code}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-white/20 font-inter uppercase tracking-tighter truncate">
                                                {s.city !== s.name ? `${s.city} · ` : ''}{s.country}{s.type ? ` · ${s.type}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <Search className="w-3 h-3 text-white/10 group-hover/item:text-white/40 flex-shrink-0 ml-2 transition-colors" />
                                </button>
                            ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="px-6 py-5 text-center text-[9px] text-white/20 uppercase tracking-[0.2em] font-semibold font-inter">
                            {countryCode
                                ? `"${query}" not found in ${countryName || countryCode}. Search a port within ${countryName || countryCode}.`
                                : `No ports found for "${query}"`}
                        </div>
                    ) : (
                        <div className="px-6 py-5 text-center text-[9px] text-white/20 uppercase tracking-[0.2em] font-semibold font-inter">
                            Type at least 2 characters to search
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
