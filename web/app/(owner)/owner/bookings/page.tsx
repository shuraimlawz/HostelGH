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
    ShieldCheck,
    Filter,
    MoreHorizontal,
    UserCircle2,
    Trash2,
    CheckCircle,
    ArrowRight
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
            toast.success("Removal request transmitted to administration.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Request failure")
    });

    const filteredBookings = bookings?.filter((b: any) => {
        const matchesFilter = filter === "ALL" || b.status === filter;
        const matchesSearch = 
            b.tenant.firstName.toLowerCase().includes(search.toLowerCase()) ||
            b.tenant.lastName.toLowerCase().includes(search.toLowerCase()) ||
            b.hostel.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100";
            case "PAYMENT_SECURED": return "bg-blue-50 text-blue-700 border-blue-100";
            case "RESERVED": return "bg-indigo-50 text-indigo-700 border-indigo-100";
            case "CHECKED_IN": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "COMPLETED": return "bg-gray-50 dark:bg-gray-950 text-gray-700 border-gray-100";
            case "CANCELLED": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 dark:text-gray-500 border-gray-200";
        }
    };

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Syncing booking data...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reserve Network</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Reservations</h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm max-w-md">Global control panel for real-time occupancy and asset distribution.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-950 border border-gray-100 rounded-xl py-3 pl-12 pr-6 outline-none focus:bg-white dark:bg-gray-900 focus:border-blue-500 transition-all font-bold text-xs shadow-sm w-full sm:w-64"
                            placeholder="Find reserver..."
                        />
                    </div>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {["ALL", "PENDING", "PAYMENT_SECURED", "RESERVED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "h-9 px-5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border shrink-0",
                                filter === f
                                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                    : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 dark:text-gray-500 border-gray-100 hover:bg-gray-50 dark:bg-gray-950"
                            )}
                        >
                            {f.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Total Records: <span className="text-gray-900 dark:text-white">{filteredBookings?.length || 0}</span>
                </div>
            </div>

            {/* Grid Content */}
            {filteredBookings?.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 border-dashed rounded-2xl p-20 text-center space-y-6">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-950 rounded-xl flex items-center justify-center mx-auto text-gray-300">
                        <Calendar size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No matching reservations</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-sm mx-auto">Either there are no bookings yet or no records match your current filter.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredBookings?.map((booking: any) => (
                        <div key={booking.id} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 p-1.5 hover:border-gray-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
                            <div className="flex flex-col lg:flex-row">
                                {/* Tenant Info */}
                                <div className="p-6 md:p-8 shrink-0 lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-50">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center text-xl font-bold border border-blue-100 shadow-sm">
                                            {booking.tenant.firstName?.[0] || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight truncate leading-tight">
                                                {booking.tenant.firstName} {booking.tenant.lastName}
                                            </h3>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">
                                                {booking.tenant.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className={cn("inline-flex items-center h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-tight border", getStatusStyles(booking.status))}>
                                            {booking.status.replace(/_/g, " ")}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-1">
                                            <Calendar size={12} />
                                            <span>Issued {new Date(booking.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Context */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Building2 size={12} className="text-blue-500" /> Allocated Property
                                            </p>
                                            <h4 className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">{booking.hostel.name}</h4>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {booking.items?.map((item: any) => (
                                                    <span key={item.id} className="text-[11px] font-bold bg-gray-50 dark:bg-gray-950 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-100">
                                                        {item.quantity}x {item.room.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <DollarSign size={12} className="text-emerald-500" /> Revenue Flow
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                                GHS {(booking.items?.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0) / 100).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-6 bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-100/50">
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Arrival</p>
                                                <p className="font-bold text-xs text-gray-900 dark:text-white">{new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <ChevronRight className="text-gray-300" size={16} />
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Exit</p>
                                                <p className="font-bold text-xs text-gray-900 dark:text-white">{new Date(booking.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                    <MessageSquare size={12} /> Tenant Signal
                                                </p>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed border-l-2 border-blue-500 pl-3 py-1">
                                                    "{booking.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Operational Panel */}
                                <div className="p-6 md:p-8 lg:w-72 flex flex-col justify-center bg-gray-50 dark:bg-gray-950/30 border-t lg:border-t-0 lg:border-l border-gray-100">
                                    <div className="space-y-3">
                                        {booking.status === "RESERVED" && !booking.managerConfirmed && (
                                            <button
                                                onClick={() => managerConfirmMutation.mutate(booking.id)}
                                                disabled={managerConfirmMutation.isPending}
                                                className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                                            >
                                                {managerConfirmMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                                Confirm Arrival
                                            </button>
                                        )}

                                        {booking.managerConfirmed && !booking.userCheckedIn && (
                                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest animate-pulse">Syncing Resident...</p>
                                            </div>
                                        )}

                                        {booking.status === "CHECKED_IN" && (
                                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center flex items-center justify-center gap-2">
                                                <CheckCircle size={16} className="text-emerald-500" />
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Stay</p>
                                            </div>
                                        )}

                                        {booking.status === "COMPLETED" && (
                                            <div className="p-3 bg-gray-100 rounded-xl border border-gray-200 text-center flex items-center justify-center gap-2">
                                                <CheckCircle2 size={16} className="text-gray-400 dark:text-gray-500" />
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-widest">Stay Concluded</p>
                                            </div>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-full h-12 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white dark:bg-gray-900 border border-transparent hover:border-gray-100 transition-all">
                                                    <MoreHorizontal size={16} /> Operations
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 shadow-xl border border-gray-100 bg-white dark:bg-gray-900">
                                                <DropdownMenuItem className="rounded-lg p-2.5 font-bold text-xs cursor-pointer hover:bg-gray-50 dark:bg-gray-950 flex items-center gap-3">
                                                    <UserCircle2 size={14} className="text-blue-600" /> Tenant Details
                                                </DropdownMenuItem>
                                                {!booking.deletionRequested && (
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            const reason = prompt("Enter reason for removal request:");
                                                            if (reason) requestDeletionMutation.mutate({ id: booking.id, reason });
                                                        }}
                                                        className="rounded-lg p-2.5 font-bold text-xs cursor-pointer text-red-600 hover:bg-red-50 flex items-center gap-3"
                                                    >
                                                        <Trash2 size={14} /> Request Removal
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

            {/* Support Disclaimer */}
            <div className="bg-gray-900 p-8 rounded-2xl text-white relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="w-14 h-14 bg-white dark:bg-gray-900/5 border border-white/10 rounded-xl flex items-center justify-center">
                            <ShieldCheck size={28} className="text-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-bold tracking-tight">Operational Protocol</h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-relaxed max-w-2xl">
                                Stay confirmations must be verified by both parties. This ensures secure payouts and verified occupancy metrics. For disputes or assistance with bulk removals, contact the Administrative Nexus.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
