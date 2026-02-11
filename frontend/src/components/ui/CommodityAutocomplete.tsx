import * as React from "react";
import { Check, ChevronsUpDown, Package, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
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

interface Commodity {
    commodityName: string;
    commodityCode: string;
}

interface CommodityAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minimal?: boolean;
}

export function CommodityAutocomplete({ value, onChange, placeholder, className, minimal = false }: CommodityAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [commodities, setCommodities] = React.useState<Commodity[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) return;
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const { data } = await axios.get(`${apiUrl}/api/commodities/search`, {
                    params: { q: query }
                });
                if (data && data.results) {
                    setCommodities(data.results);
                }
            } catch (error) {
                console.error("Commodity search failed", error);
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
                    <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                        {!minimal && <Package className="h-4 w-4 shrink-0 opacity-50 text-gray-500" />}
                        <span className="truncate flex-1 font-medium text-base">
                            {value || placeholder || "General Cargo"}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] md:w-[350px] p-0 shadow-2xl border-white/10 rounded-none bg-black" align="start">
                <Command shouldFilter={false} className="bg-black">
                    <CommandInput
                        placeholder="SEARCH_CARGO_SPEC..."
                        value={query}
                        onValueChange={setQuery}
                        className="h-14 text-[10px] font-black tracking-[0.3em] border-b border-white/10 uppercase bg-black text-white"
                    />
                    <CommandList className="max-h-[350px]">
                        {loading && <div className="p-6 text-[10px] font-black tracking-widest text-center text-zinc-500 uppercase flex items-center justify-center gap-3"><div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> SCANNING_DATABASE...</div>}
                        {!loading && commodities.length === 0 && query.length > 1 && (
                            <CommandEmpty className="py-8 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No valid profile found.</CommandEmpty>
                        )}
                        {!loading && (
                            <CommandGroup heading="DETECTION_RESULTS" className="text-zinc-600 font-black text-[9px] tracking-[0.4em] px-4 py-3 uppercase border-b border-white/5">
                                {commodities.map((comm, idx) => {
                                    const isSelected = value === comm.commodityName;
                                    return (
                                        <CommandItem
                                            key={idx}
                                            value={comm.commodityName}
                                            onSelect={() => {
                                                onChange(comm.commodityName);
                                                setOpen(false);
                                            }}
                                            className={cn(
                                                "cursor-pointer transition-all duration-200 py-4 px-4 border-b border-white/[0.02] relative group outline-none",
                                                "aria-selected:bg-white/10 hover:bg-white/10",
                                                isSelected && "bg-white/[0.05]"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 transition-opacity",
                                                "group-aria-selected:opacity-100 group-hover:opacity-100",
                                                isSelected && "opacity-100"
                                            )} />

                                            <div className="flex flex-col gap-1">
                                                <span className={cn(
                                                    "font-bold text-xs uppercase tracking-tight transition-colors",
                                                    isSelected ? "text-emerald-400" : "text-white group-hover:text-emerald-400"
                                                )}>
                                                    {comm.commodityName}
                                                </span>
                                                {comm.commodityCode && (
                                                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                                                        CODE: {comm.commodityCode}
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    );
                                })}

                                {/* Default Options if no query */}
                                {query.length < 2 && (
                                    <div className="pt-2">
                                        {["GENERAL CARGO", "ELECTRONICS", "TEXTILES", "MACHINERY", "AUTOMOTIVE"].map(c => {
                                            const isSelected = value === c;
                                            return (
                                                <CommandItem
                                                    key={c}
                                                    value={c}
                                                    onSelect={() => { onChange(c); setOpen(false); }}
                                                    className={cn(
                                                        "cursor-pointer transition-all duration-200 py-3.5 px-4 border-b border-white/[0.02] relative group outline-none",
                                                        "aria-selected:bg-white/10 hover:bg-white/10",
                                                        isSelected && "bg-white/[0.05]"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 transition-opacity",
                                                        "group-aria-selected:opacity-100 group-hover:opacity-100",
                                                        isSelected && "opacity-100"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                                                        isSelected ? "text-emerald-400" : "text-zinc-300 group-hover:text-emerald-400"
                                                    )}>
                                                        {c}
                                                    </span>
                                                </CommandItem>
                                            );
                                        })}
                                    </div>
                                )}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>

        </Popover>
    );
}

