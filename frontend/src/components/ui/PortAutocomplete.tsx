"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin, Anchor, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";

// Helper to convert country code to flag emoji
const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return "🌐";
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

interface Port {
    code: string;
    name: string;
    country: string;
    country_code: string;
    type: 'port' | 'city';
}

interface PortAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minimal?: boolean;
}

export function PortAutocomplete({ value, onChange, placeholder, className, minimal = false }: PortAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [ports, setPorts] = React.useState<Port[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) return;

            setLoading(true);
            try {
                // Call our Python Backend
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const { data } = await axios.get(`${apiUrl}/api/ports/search`, {
                    params: { q: query }
                });
                if (data && data.results) {
                    setPorts(data.results);
                }
            } catch (error) {
                console.error("Port search failed", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-12 font-normal px-4",
                        minimal
                            ? "bg-transparent border-0 hover:bg-gray-50 text-gray-500 focus:ring-0"
                            : "bg-background/50 border-input",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <div className="flex items-center gap-3 overflow-hidden w-full text-left">
                        {!minimal && <MapPin className="h-4 w-4 shrink-0 opacity-50 text-gray-500" />}
                        <span className="truncate flex-1 font-medium text-base">
                            {value || placeholder || "Select port..."}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0 shadow-2xl border-white/10 rounded-none bg-black" align="start">
                <Command shouldFilter={false} className="bg-black">
                    <CommandInput
                        placeholder="SEARCH GLOBAL PORTS..."
                        value={query}
                        onValueChange={setQuery}
                        className="h-14 text-xs font-bold tracking-[0.2em] border-b border-white/10 uppercase bg-black text-white"
                    />
                    <CommandList className="max-h-[350px]">
                        {loading && <div className="p-6 text-xs font-bold tracking-widest text-center text-gray-500 uppercase flex items-center justify-center gap-3"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> SYNCHRONIZING NETWORK...</div>}
                        {!loading && ports.length === 0 && query.length > 1 && (
                            <CommandEmpty className="py-8 text-center text-xs font-bold text-gray-600 uppercase tracking-widest">Protocol error: no matches found.</CommandEmpty>
                        )}
                        {!loading && ports.length > 0 && (
                            <CommandGroup heading="TELEMETRY RESULTS" className="text-gray-600 font-bold text-xs tracking-[0.3em] px-4 py-2 uppercase">
                                {ports.map((port) => (
                                    <CommandItem
                                        key={port.code}
                                        value={port.code}
                                        onSelect={() => {
                                            const formatted = `${port.name}, ${port.country_code || port.country.substring(0, 2).toUpperCase()}`;
                                            onChange(formatted);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer hover:bg-white/[0.05] aria-selected:bg-white/[0.05] transition-colors py-4 px-4 border-b border-white/[0.03]"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl leading-none grayscale contrast-125">
                                                    {getFlagEmoji(port.country_code)}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm uppercase tracking-tight">
                                                        {port.name}, <span className="text-gray-500">{port.country_code}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 uppercase">
                                                <span className="text-xs font-bold text-white tracking-widest">
                                                    {port.type === 'port' ? 'STATION' : 'NODE'}
                                                </span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>

        </Popover>
    );
}

