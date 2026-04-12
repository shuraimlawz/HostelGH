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
    Zap
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
            toast.success("Property removed successfully");
        },
        onError: (err: any) => toast.error(err.message || "Failed to delete hostel")
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Permanently remove ${name}?`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredHostels = hostels?.filter((h: any) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-foreground text-background rounded-sm text-[8px] font-black uppercase tracking-[0.2em]">
                            Proprietor Hub
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight uppercase italic">
                        Portfolio <span className="text-primary NOT-italic">.</span>
                    </h1>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Manage your property fleet and tracking results.</p>
                </div>
                <Link
                    href="/owner/hostels/new"
                    className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] w-fit"
                >
                    <Plus size={14} />
                    <span>Deploy Listing</span>
                </Link>
            </div>

            {/* Controls */}
            {hostels?.length > 0 && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background border border-border rounded-sm py-2 pl-9 pr-4 outline-none focus:border-primary transition-all text-[11px] font-bold uppercase tracking-tight placeholder:text-muted-foreground/30 shadow-sm"
                        placeholder="FILTER ASSETS..."
                    />
                </div>
            )}

            {/* Grid */}
            {filteredHostels?.length === 0 ? (
                <div className="bg-muted/30 border border-border border-dashed rounded-sm p-12 text-center">
                    <Building2 className="text-muted-foreground/30 mx-auto mb-4" size={32} />
                    <h3 className="text-xs font-black text-foreground tracking-widest uppercase mb-2">Null Set</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-4">No assets detected in the current filter.</p>
                    {hostels?.length === 0 && (
                        <Link
                            href="/owner/hostels/new"
                            className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                        >
                            Deploy First Asset
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredHostels?.map((hostel: any) => (
                        <div key={hostel.id} className="group bg-card border border-border rounded-sm overflow-hidden hover:border-foreground/20 transition-all duration-300 flex flex-col relative shadow-sm">
                            {/* Image Area */}
                            <div className="aspect-[16/10] bg-muted relative overflow-hidden border-b border-border">
                                {hostel.images?.[0] ? (
                                    <img
                                        src={hostel.images[0]}
                                        alt={hostel.name}
                                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                        <Building2 size={32} />
                                    </div>
                                )}

                                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                        hostel.isPublished
                                            ? "bg-emerald-500 text-white border-emerald-400"
                                            : hostel.pendingVerification
                                                ? "bg-amber-500 text-white border-amber-400"
                                                : "bg-foreground text-background border-border"
                                    )}>
                                        {hostel.isPublished ? "Live" : hostel.pendingVerification ? "Pending" : "Draft"}
                                    </span>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-6 h-6 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-sm hover:bg-background transition-colors text-foreground shadow-sm border border-border">
                                                <MoreVertical size={14} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-sm p-1 shadow-xl border-border bg-background">
                                            <DropdownMenuItem asChild className="rounded-sm p-2 font-black text-[10px] uppercase tracking-widest cursor-pointer focus:bg-muted">
                                                <Link href={`/hostels/${hostel.id}`} target="_blank" className="flex items-center gap-2">
                                                    <Eye size={12} className="text-primary" />
                                                    Preview
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-sm p-2 font-black text-[10px] uppercase tracking-widest cursor-pointer focus:bg-muted">
                                                <Link href={`/owner/hostels/${hostel.id}/edit`} className="flex items-center gap-2">
                                                    <Edit2 size={12} className="text-foreground" />
                                                    Configure
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border" />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(hostel.id, hostel.name)}
                                                className="rounded-sm p-2 font-black text-[10px] uppercase tracking-widest cursor-pointer focus:bg-red-50 text-red-600"
                                            >
                                                <Trash2 size={12} className="mr-2" />
                                                Terminate
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-sm font-black text-foreground tracking-tight uppercase italic truncate group-hover:text-primary transition-colors">
                                        {hostel.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-muted-foreground text-[9px] font-bold uppercase tracking-widest truncate">
                                        <MapPin size={10} className="text-primary" />
                                        <span>{hostel.city}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <div className="bg-muted/30 rounded-sm p-2 border border-border">
                                        <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                                            <Users size={10} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Units</span>
                                        </div>
                                        <p className="text-sm font-black text-foreground tracking-tight">{hostel._count.rooms}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-sm p-2 border border-border">
                                        <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                                            <CalendarCheck size={10} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Orders</span>
                                        </div>
                                        <p className="text-sm font-black text-foreground tracking-tight">{hostel._count.bookings}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Link
                                        href={`/owner/hostels/${hostel.id}/rooms`}
                                        className="w-full bg-foreground text-background py-2 rounded-sm flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all gap-2"
                                    >
                                        <Zap size={10} />
                                        Manage inventory
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
