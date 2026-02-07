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

interface Port {
    code: string;
    name: string;
    country: string;
    type: 'port' | 'city';
}

interface PortAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function PortAutocomplete({ value, onChange, placeholder }: PortAutocompleteProps) {
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
                const { data } = await axios.get(`http://localhost:8000/api/ports/search`, {
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
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12 bg-background/50 border-input font-normal"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <MapPin className="h-4 w-4 shrink-0 opacity-50 text-gray-400" />
                        <span className={cn("truncate", !value && "text-muted-foreground")}>
                            {value || placeholder || "Select port..."}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search ports (e.g. Shanghai, CNSHA)..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {loading && <div className="p-4 text-sm text-center text-muted-foreground">Searching logistics database...</div>}
                        {!loading && ports.length === 0 && query.length > 1 && (
                            <CommandEmpty data-testid="no-results">No ports found.</CommandEmpty>
                        )}
                        <CommandGroup heading="Verified Locations">
                            {ports.map((port) => (
                                <CommandItem
                                    key={port.code}
                                    value={port.code}
                                    onSelect={() => {
                                        // Format: "Shanghai, China (CNSHA)"
                                        const formatted = `${port.name}, ${port.country} (${port.code})`;
                                        onChange(formatted);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full cursor-pointer">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 shrink-0">
                                            {port.type === 'port' ? <Anchor className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{port.name}, {port.country}</span>
                                            <span className="text-xs text-muted-foreground font-mono">{port.code} • {port.type.toUpperCase()}</span>
                                        </div>
                                        {value.includes(port.code) && (
                                            <Check className="ml-auto h-4 w-4 opacity-50 text-blue-500" />
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
