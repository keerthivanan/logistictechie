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
import { BACKEND_URL } from "@/lib/logistics";

// Flag logic removed for architectural purity

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
                const apiUrl = BACKEND_URL.replace('/api', '');
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
            <PopoverContent className="w-[calc(100vw-2rem)] md:w-[450px] p-0 shadow-2xl border-white/10 rounded-none bg-black" align="start">
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
                            <CommandGroup heading="TELEMETRY RESULTS" className="text-gray-500 font-bold text-[10px] tracking-[0.4em] px-4 py-3 uppercase border-b border-white/5">
                                {ports.map((port, idx) => {
                                    const isSelected = value === `${port.name} (${port.code})`;
                                    return (
                                        <CommandItem
                                            key={port.code + idx}
                                            value={port.name + " " + port.code}
                                            onSelect={() => {
                                                const formatted = `${port.name} (${port.code})`;
                                                onChange(formatted);
                                                setOpen(false);
                                            }}
                                            className={cn(
                                                "cursor-pointer transition-all duration-200 py-5 px-6 border-b border-white/[0.02] relative group outline-none",
                                                "aria-selected:bg-white/10 hover:bg-white/10",
                                                isSelected && "bg-white/[0.07]"
                                            )}
                                        >
                                            {/* Selection Highlight Bar */}
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1 bg-white opacity-0 transition-opacity",
                                                "group-aria-selected:opacity-100 group-hover:opacity-100",
                                                isSelected && "opacity-100 bg-emerald-500"
                                            )} />

                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-10 w-10 border border-white/10 flex items-center justify-center bg-white/5 grayscale group-hover:grayscale-0 transition-all duration-500">
                                                        <Anchor className="h-5 w-5 text-zinc-500" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className={cn(
                                                            "font-bold text-base uppercase tracking-tight transition-colors",
                                                            isSelected ? "text-emerald-400" : "text-white group-aria-selected:text-white"
                                                        )}>
                                                            {port.name}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-zinc-500 font-bold tracking-[0.1em] uppercase">
                                                                {port.country}
                                                            </span>
                                                            <span className="h-1 w-1 rounded-full bg-zinc-700" />
                                                            <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-zinc-800/50 px-1.5 py-0.5 rounded">
                                                                {port.code}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-none border text-[9px] font-black tracking-widest uppercase transition-all",
                                                        port.type === 'port'
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                                            : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                                    )}>
                                                        {port.type === 'port' ? 'OFFSHORE' : 'INLAND'}
                                                    </div>

                                                    {isSelected && (
                                                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                            <Check className="h-3.5 w-3.5 text-black stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>

        </Popover>
    );
}

