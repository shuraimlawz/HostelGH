"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import {
    Plus,
    Building2,
    MapPin,
    Users,
    MoreVertical,
    Edit2,
    Eye,
    Trash2,
    CalendarCheck,
    Loader2,
    Search,
    Zap,
    ShieldCheck,
    ArrowUpRight,
    LayoutGrid,
    ChevronRight,
    Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";

export default function OwnerHostelsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { data: hostels, isLoading } = useQuery({
        queryKey: ["owner-hostels"],
        queryFn: async () => {
            const res = await api.get("/hostels/my-hostels");
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/hostels/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-hostels"] });
            toast.success("Identity purged from the matrix.");
        },
        onError: (err: any) => toast.error(err.message || "De-listing failure")
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`INITIATE TOTAL PURGE PROTOCOL FOR: ${name.toUpperCase()}?`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredHostels = hostels?.filter((h: any) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-white transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Syncing Portfolio Assets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 px-4 py-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-white/10">
                            Proprietor Hub
                        </span>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Inventory Live</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Portfolio <span className="text-blue-600 NOT-italic opacity-40">.</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-sm">
                        Enterprise-grade control over your property fleet and operational network.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white border-2 border-muted hover:border-black/10 rounded-[1.5rem] py-5 pl-14 pr-6 outline-none focus:border-black transition-all font-black text-xs uppercase tracking-tight placeholder:text-muted-foreground/30 shadow-sm w-full sm:w-64"
                            placeholder="FILTER ASSETS..."
                        />
                    </div>
                    <Link
                        href="/owner/hostels/new"
                        className="h-16 px-10 bg-black text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-xl active:scale-95 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        DEPLOY LISTING
                    </Link>
                </div>
            </div>

            {/* Matrix View Selection */}
            <div className="flex items-center justify-between border-b border-muted pb-6">
                <div className="flex items-center gap-2">
                    <LayoutGrid size={14} className="text-blue-600" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground">Standard Grid Layout</span>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    TOTAL ASSETS: <span className="text-black">{hostels?.length || 0}</span>
                </div>
            </div>

            {/* Portfolio Matrix */}
            {filteredHostels?.length === 0 ? (
                <div className="bg-white rounded-[3.5rem] border-2 border-dashed border-muted p-24 text-center space-y-6">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/20">
                        <Building2 size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Null Data Set <span className="text-blue-600 NOT-italic">.</span></h3>
                        <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">No assets detected in the current matrix slice.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredHostels?.map((hostel: any) => (
                        <div key={hostel.id} className="group bg-white rounded-[3rem] border border-muted overflow-hidden hover:border-black/10 transition-all duration-500 flex flex-col relative shadow-sm hover:shadow-2xl">
                            {/* Visual Layer */}
                            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                {hostel.images?.[0] ? (
                                    <img
                                        src={hostel.images[0]}
                                        alt={hostel.name}
                                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/10">
                                        <Building2 size={48} />
                                    </div>
                                )}

                                {/* Overlay Glassmorphism */}
                                <div className="absolute inset-x-4 top-4 flex justify-between items-start">
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-2xl",
                                        hostel.isPublished
                                            ? "bg-emerald-500/80 text-white border-white/20"
                                            : hostel.pendingVerification
                                                ? "bg-amber-500/80 text-white border-white/20"
                                                : "bg-black/60 text-white/60 border-white/10"
                                    )}>
                                        {hostel.isPublished ? "STATUS: ACTIVE" : hostel.pendingVerification ? "STATUS: PENDING" : "STATUS: DRAFT"}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-10 h-10 flex items-center justify-center bg-white/40 hover:bg-white backdrop-blur-md rounded-2xl transition-all text-black shadow-2xl border border-white/20 group/trigger">
                                                <MoreVertical size={18} className="group-hover/trigger:rotate-90 transition-transform" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-[1.8rem] p-3 shadow-2xl border-2 border-muted bg-white">
                                            <DropdownMenuItem asChild className="rounded-xl p-4 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-muted/30 flex items-center gap-3">
                                                <Link href={`/hostels/${hostel.id}`} target="_blank">
                                                    <ArrowUpRight size={16} className="text-blue-600" /> Matrix Preview
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-xl p-4 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-muted/30 flex items-center gap-3">
                                                <Link href={`/owner/hostels/${hostel.id}/edit`}>
                                                    <Settings2 size={16} className="text-foreground" /> Config Flow
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-2 bg-muted h-0.5" />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(hostel.id, hostel.name)}
                                                className="rounded-xl p-4 font-black text-[10px] uppercase tracking-widest cursor-pointer text-red-600 hover:bg-red-50 flex items-center gap-3"
                                            >
                                                <Trash2 size={16} /> Purge Identity
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="absolute inset-x-4 bottom-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/40 flex items-center justify-between shadow-2xl">
                                        <div className="flex items-center gap-3">
                                            <MapPin size={14} className="text-blue-600" />
                                            <span className="text-[10px] font-black text-black uppercase tracking-tight truncate">{hostel.city}</span>
                                        </div>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Info Layer */}
                            <div className="p-8 flex-1 flex flex-col space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-foreground tracking-tighter uppercase italic truncate leading-none group-hover:text-blue-600 transition-colors">
                                        {hostel.name}
                                    </h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">UID: #{hostel.id.slice(-6).toUpperCase()}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/10 rounded-[1.5rem] p-5 border border-muted/20 space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users size={12} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Units</span>
                                        </div>
                                        <p className="text-xl font-black text-foreground tracking-tighter italic">{hostel._count.rooms}</p>
                                    </div>
                                    <div className="bg-muted/10 rounded-[1.5rem] p-5 border border-muted/20 space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <CalendarCheck size={12} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Signals</span>
                                        </div>
                                        <p className="text-xl font-black text-foreground tracking-tighter italic">{hostel._count.bookings}</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/owner/hostels/${hostel.id}/rooms`}
                                    className="w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all gap-3 shadow-lg active:scale-95 group/btn"
                                >
                                    <Zap size={14} className="group-hover/btn:scale-125 transition-transform" />
                                    SYNC INVENTORY
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
