"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Building2, MapPin, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Hostel {
    id: string;
    name: string;
    city: string;
    images: string[];
    rooms: Array<{
        id: string;
        name: string;
        pricePerTerm: number;
    }>;
}

interface HostelSearchModalProps {
    onSelect: (hostel: Hostel, room?: { id: string; name: string }) => void;
    trigger: React.ReactNode;
}

export default function HostelSearchModal({ onSelect, trigger }: HostelSearchModalProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data: hostels, isLoading } = useQuery({
        queryKey: ["hostel-search", search],
        queryFn: async () => {
            if (!search && !open) return [];
            const { data } = await api.get("/hostels/public", {
                params: { city: search, limit: 5 }
            });
            // Fetch full details for the first few to get rooms if needed, 
            // or assume the search endpoint returns basic info and we'll fetch details on selection
            return Array.isArray(data) ? data : [];
        },
        enabled: open,
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-black tracking-tighter">Attach a Hostel</DialogTitle>
                </DialogHeader>
                
                <div className="p-6 pt-2 space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search by city or hostel name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 bg-zinc-50 border-none rounded-xl pl-11 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/20"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <Loader2 size={32} className="animate-spin text-primary/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Searching Hostels...</span>
                            </div>
                        ) : hostels?.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <Building2 size={32} className="opacity-20" />
                                <span className="text-xs font-bold">No hostels found</span>
                            </div>
                        ) : (
                            hostels?.map((hostel: Hostel) => (
                                <div 
                                    key={hostel.id}
                                    onClick={() => {
                                        onSelect(hostel);
                                        setOpen(false);
                                    }}
                                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 cursor-pointer transition-all border border-transparent hover:border-primary/5"
                                >
                                    <div className="h-14 w-14 rounded-lg bg-zinc-100 overflow-hidden shadow-sm flex-shrink-0">
                                        {hostel.images?.[0] ? (
                                            <img src={hostel.images[0]} alt={hostel.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Building2 size={24} className="text-zinc-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-sm truncate">{hostel.name}</h4>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{hostel.city}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Check size={16} className="text-primary" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
