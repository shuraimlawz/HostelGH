"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Check,
    X,
    Calendar,
    Building2,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Search,
    ChevronRight,
    MessageSquare,
    DollarSign,
    LogIn,
    LogOut,
    Filter,
    MoreHorizontal,
    ShieldCheck,
    ArrowUpRight,
    UserCircle2,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function OwnerBookingsPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<string>("ALL");
    const [search, setSearch] = useState("");

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["owner-bookings"],
        queryFn: async () => {
            const { data } = await api.get("/bookings/owner");
            return Array.isArray(data) ? data : [];
        },
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/bookings/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Protocol approved! Identity notified.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Approval failure")
    });

    const managerConfirmMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/bookings/${id}/manager-confirm`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Arrival confirmed. Activation pending tenant sync.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Confirmation failure")
    });

    const requestDeletionMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            api.patch(`/bookings/${id}/request-deletion`, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Purge request transmitted to central admin.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Purge request failure")
    });

    const filteredBookings = bookings?.filter((b: any) => {
        const matchesFilter = filter === "ALL" || b.status === filter;
        const matchesSearch = b.tenant.firstName.toLowerCase().includes(search.toLowerCase()) ||
            b.tenant.lastName.toLowerCase().includes(search.toLowerCase()) ||
            b.hostel.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) return (
        <div className="flex h-[80vh] items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Syncing Ledger Matrix...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 px-4 py-12">
            {/* Header / Search Hub */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-white/10">
                            Management Ledger
                        </span>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Live Database Access</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Reservations <span className="text-blue-600 NOT-italic opacity-40">.</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-sm">
                        Global control panel for real-time occupancy and asset distribution.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative group flex-1 md:w-80">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border-2 border-muted hover:border-black/10 rounded-[1.5rem] py-5 pl-14 pr-6 outline-none focus:border-black transition-all font-black text-xs uppercase tracking-tight placeholder:text-muted-foreground/30 shadow-sm"
                            placeholder="SEARCH OPERATIONAL DATA..."
                        />
                    </div>
                    <div className="hidden md:flex bg-black text-white px-8 rounded-[1.5rem] items-center gap-3 shadow-xl">
                        <Filter size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Matrix Filter</span>
                    </div>
                </div>
            </div>

            {/* Matrix Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-muted">
                {["ALL", "PENDING", "PAYMENT_SECURED", "RESERVED", "COMPLETED", "DISPUTED", "CANCELLED"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-6 py-4 rounded-[1.2rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-2",
                            filter === f
                                ? "bg-black text-white border-black shadow-2xl scale-105"
                                : "bg-muted/10 text-muted-foreground border-transparent hover:bg-white hover:border-muted"
                        )}
                    >
                        {f === "ALL" ? "LEADERBOARD" : f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Matrix Content */}
            {filteredBookings?.length === 0 ? (
                <div className="bg-white rounded-[3.5rem] border-2 border-dashed border-muted p-24 text-center space-y-6">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/20">
                        <Calendar size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Null Search Result <span className="text-blue-600 NOT-italic">.</span></h3>
                        <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">No active stay protocols matching the current matrix filter.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {filteredBookings?.map((booking: any) => (
                        <div key={booking.id} className="group bg-white rounded-[3rem] border border-muted p-8 md:p-10 hover:border-black/10 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative z-10 flex flex-col xl:flex-row gap-12">
                                {/* Tenant Matrix Identity */}
                                <div className="xl:w-80 space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center text-2xl font-black uppercase border-4 border-white shadow-2xl rotate-2 group-hover:rotate-0 transition-transform">
                                            {booking.tenant.firstName?.[0] || booking.tenant.email[0]}
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <h3 className="font-black text-xl uppercase tracking-tighter text-foreground italic leading-none truncate">
                                                {booking.tenant.firstName} {booking.tenant.lastName}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">
                                                {booking.tenant.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border",
                                            booking.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                                booking.status === "PAYMENT_SECURED" || booking.status === "RESERVED" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                    booking.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                        "bg-muted text-muted-foreground border-muted"
                                        )}>
                                            {booking.status === "PENDING" ? <Clock size={12} /> :
                                                booking.status === "COMPLETED" ? <CheckCircle2 size={12} /> : <ShieldCheck size={12} />}
                                            {booking.status.replace("_", " ")}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">
                                            <Calendar size={12} />
                                            <span>CREATED {new Date(booking.createdAt).toLocaleDateString().toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Allocation Details */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 py-2 xl:border-l xl:pl-12 border-muted">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2 leading-none">
                                                <Building2 size={12} className="text-blue-500" /> Operational Asset
                                            </p>
                                            <h4 className="font-black text-2xl text-foreground uppercase italic tracking-tighter leading-none">{booking.hostel.name}</h4>
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{booking.items[0]?.room.name} <span className="text-black/20">|</span> {booking.items[0]?.quantity} UNIT ALLOCATION</p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2 leading-none">
                                                <DollarSign size={12} className="text-emerald-500" /> Revenue Flow
                                            </p>
                                            <p className="text-3xl font-black text-foreground tracking-tighter italic leading-none truncate">₵{((booking.items[0]?.unitPrice * booking.items[0]?.quantity) / 100).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-10 bg-muted/10 p-6 rounded-[2rem] border border-muted/20">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Entry</p>
                                                <p className="font-black text-sm text-foreground uppercase italic leading-none">{new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <ChevronRight className="text-muted-foreground" size={20} />
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Exit</p>
                                                <p className="font-black text-sm text-foreground uppercase italic leading-none">{new Date(booking.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 leading-none">
                                                    <MessageSquare size={12} /> External Signal
                                                </p>
                                                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight italic bg-muted/10 p-4 rounded-2xl border-l-4 border-blue-600">"{booking.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Channel Actions */}
                                <div className="xl:w-64 flex flex-col justify-center gap-4">
                                    <div className="space-y-3">
                                        {booking.status === "RESERVED" && !booking.managerConfirmed && (
                                            <button
                                                onClick={() => managerConfirmMutation.mutate(booking.id)}
                                                disabled={managerConfirmMutation.isPending}
                                                className="w-full h-16 bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl group/btn"
                                            >
                                                {managerConfirmMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} className="group-hover/btn:scale-125 transition-transform" />}
                                                Confirm Arrival
                                            </button>
                                        )}

                                        {booking.managerConfirmed && !booking.userCheckedIn && (
                                            <div className="p-6 bg-blue-600/10 border-2 border-dashed border-blue-600/20 rounded-[1.5rem] text-center">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] italic animate-pulse">Syncing Tenant...</p>
                                            </div>
                                        )}

                                        {booking.status === "COMPLETED" && (
                                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] text-center flex items-center justify-center gap-3">
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Operational Success</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Extended Operations Menu */}
                                    <div className="flex justify-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-full flex items-center justify-center gap-3 py-4 text-muted-foreground hover:text-black font-black text-[9px] uppercase tracking-[0.3em] rounded-xl border-2 border-transparent hover:border-muted transition-all">
                                                    <MoreHorizontal size={14} /> Operations Hub
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-[1.8rem] p-3 shadow-2xl border-2 border-muted bg-white">
                                                <DropdownMenuItem className="rounded-xl p-4 font-black text-[10px] uppercase tracking-widest cursor-pointer text-foreground hover:bg-muted/30 focus:bg-muted/30 flex items-center gap-3">
                                                    <UserCircle2 size={16} className="text-blue-600" /> Operational Details
                                                </DropdownMenuItem>
                                                {!booking.deletionRequested && (
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            const reason = prompt("ENTER AUTHORIZATION REASON FOR PURGE:");
                                                            if (reason) requestDeletionMutation.mutate({ id: booking.id, reason });
                                                        }}
                                                        className="rounded-xl p-4 font-black text-[10px] uppercase tracking-widest cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 flex items-center gap-3"
                                                    >
                                                        <Trash2 size={16} /> Authorize Purge
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
