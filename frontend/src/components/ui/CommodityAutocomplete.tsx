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
            <PopoverContent className="w-[300px] p-0 shadow-2xl border-white/10 rounded-none bg-black" align="start">
                <Command shouldFilter={false} className="bg-black">
                    <CommandInput
                        placeholder="CARGO TYPE..."
                        value={query}
                        onValueChange={setQuery}
                        className="h-10 text-xs font-bold tracking-widest border-b border-white/10 uppercase bg-black text-white"
                    />
                    <CommandList className="max-h-[300px]">
                        {loading && <div className="p-4 text-xs font-bold text-center text-gray-500 uppercase tracking-widest">ANALYZING...</div>}
                        {!loading && commodities.length === 0 && query.length > 1 && (
                            <CommandEmpty className="py-4 text-center text-xs font-bold text-gray-600 uppercase">NO PROTOCOLS FOUND.</CommandEmpty>
                        )}
                        {!loading && (
                            <CommandGroup heading="CARGO PROTOCOLS" className="text-gray-600 font-bold text-xs tracking-[0.2em] px-2 py-1 uppercase">
                                {commodities.map((comm, idx) => (
                                    <CommandItem
                                        key={idx}
                                        value={comm.commodityName}
                                        onSelect={() => {
                                            onChange(comm.commodityName);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer hover:bg-white/5 aria-selected:bg-white/5 transition-colors py-3 px-3 border-b border-white/[0.03]"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-xs uppercase tracking-tight">{comm.commodityName}</span>
                                            {comm.commodityCode && <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{comm.commodityCode}</span>}
                                        </div>
                                    </CommandItem>
                                ))}
                                {/* Default Options if no query */}
                                {query.length < 2 && (
                                    <>
                                        {["GENERAL CARGO", "ELECTRONICS", "TEXTILES", "MACHINERY", "AUTOMOTIVE"].map(c => (
                                            <CommandItem
                                                key={c}
                                                value={c}
                                                onSelect={() => { onChange(c); setOpen(false); }}
                                                className="cursor-pointer hover:bg-white/5 aria-selected:bg-white/5 transition-colors py-3 px-3 uppercase text-xs font-bold text-white tracking-widest"
                                            >
                                                {c}
                                            </CommandItem>
                                        ))}
                                    </>
                                )}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>

        </Popover>
    );
}

