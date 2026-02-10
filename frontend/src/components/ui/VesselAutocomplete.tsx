import * as React from "react";
import { Check, ChevronsUpDown, Ship, Search } from "lucide-react";
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

interface Vessel {
    name: string;
    imo: string;
    flag: string;
    operator: string;
}

interface VesselAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minimal?: boolean;
}

export function VesselAutocomplete({ value, onChange, placeholder, className, minimal = false }: VesselAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [vessels, setVessels] = React.useState<Vessel[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Initial Fetch
    React.useEffect(() => {
        const fetchVessels = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const { data } = await axios.get(`${apiUrl}/api/vessels/active`);
                if (data && data.vessels) {
                    setVessels(data.vessels);
                }
            } catch (error) {
                console.error("Vessel fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVessels();
    }, []);

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
                        {!minimal && <Ship className="h-4 w-4 shrink-0 opacity-50 text-gray-500" />}
                        <span className="truncate flex-1 font-medium text-base">
                            {value || placeholder || "Select Vessel..."}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0 shadow-xl border-gray-100" align="start">
                <Command className="bg-white">
                    <CommandInput
                        placeholder="Search Vessel Name..."
                        className="h-10 text-sm border-b border-gray-100"
                    />
                    <CommandList className="max-h-[300px]">
                        {loading && <div className="p-4 text-xs text-center text-gray-500">Loading Fleet...</div>}
                        {!loading && vessels.length === 0 && (
                            <CommandEmpty className="py-4 text-center text-xs text-gray-500">No active vessels found.</CommandEmpty>
                        )}
                        <CommandGroup heading="Active Fleet" className="text-gray-400 font-medium px-1 py-1">
                            {vessels.map((vessel, idx) => (
                                <CommandItem
                                    key={idx}
                                    value={vessel.name}
                                    onSelect={() => {
                                        onChange(vessel.name);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer hover:bg-blue-50 aria-selected:bg-blue-50 transition-colors py-2 px-3"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-500 text-sm">{vessel.name}</span>
                                            <span className="text-xs text-gray-400 font-mono">IMO: {vessel.imo} • {vessel.flag}</span>
                                        </div>
                                        <Ship className="h-3 w-3 text-blue-500 opacity-50" />
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

