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
    MoreHorizontal
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
            toast.success("Booking approved! Tenant has been notified.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to approve")
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            api.patch(`/bookings/${id}/reject`, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Booking rejected.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to reject")
    });

    const checkInMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/bookings/${id}/check-in`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Tenant checked in successfully!");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to check in")
    });

    const checkOutMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/bookings/${id}/check-out`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Tenant checked out.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to check out")
    });

    const completeMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/bookings/${id}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Booking marked as completed.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to complete")
    });

    const verifyOfflineMutation = useMutation({
        mutationFn: ({ paymentId, status }: { paymentId: string; status: "SUCCESS" | "FAILED" }) =>
            api.post(`/payments/offline/verify/${paymentId}`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Payment verified and booking confirmed!");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Verification failed")
    });

    const requestDeletionMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            api.patch(`/bookings/${id}/request-deletion`, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Deletion request sent to admin.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to request deletion")
    });

    const filteredBookings = bookings?.filter((b: any) => {
        const matchesFilter = filter === "ALL" || b.status === filter;
        const matchesSearch = b.tenant.firstName.toLowerCase().includes(search.toLowerCase()) ||
            b.tenant.lastName.toLowerCase().includes(search.toLowerCase()) ||
            b.hostel.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading Reservations...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-10 bg-background text-foreground transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-sm text-[8px] font-black uppercase tracking-[0.2em] border border-primary/20">
                            Ledger
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight uppercase italic leading-none mb-1">
                        Reservations <span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Real-time occupancy & tenant control.</p>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-border rounded-sm py-2.5 pl-10 pr-4 outline-none focus:border-primary transition-all font-bold text-xs uppercase tracking-tight placeholder:text-muted-foreground/50 shadow-sm"
                        placeholder="Search tenants..."
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-border">
                {["ALL", "PENDING_APPROVAL", "APPROVED", "CHECKED_IN", "CHECKED_OUT", "COMPLETED", "REJECTED"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            filter === f
                                ? "bg-foreground text-background shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {f === "PENDING_APPROVAL" ? "Pending" : f === "ALL" ? "All" : f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Content */}
            {filteredBookings?.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-16 text-center space-y-4">
                    <Calendar className="text-muted/20 mx-auto" size={40} />
                    <div className="max-w-xs mx-auto">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Zero Assets</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                            No reservations matching current view.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredBookings?.map((booking: any) => (
                        <div key={booking.id} className="group bg-card rounded-md border border-border p-5 hover:border-primary/30 transition-all duration-300 shadow-sm">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Tenant Info */}
                                <div className="lg:w-64 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center text-primary font-black text-lg uppercase border border-primary/20">
                                            {booking.tenant.firstName?.[0] || booking.tenant.email[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-sm uppercase tracking-tight text-foreground truncate">
                                                {booking.tenant.firstName} {booking.tenant.lastName}
                                            </h3>
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest truncate">
                                                {booking.tenant.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-[0.1em] border",
                                            booking.status === "PENDING_APPROVAL" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                                booking.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                    booking.status === "CONFIRMED" ? "bg-primary/10 text-primary border-primary/20" :
                                                        "bg-muted text-muted-foreground border-border"
                                        )}>
                                            {booking.status === "PENDING_APPROVAL" ? <Clock size={10} /> :
                                                booking.status === "APPROVED" || booking.status === "CONFIRMED" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                            {booking.status.replace("_", " ")}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[9px] font-black uppercase tracking-widest pl-1">
                                            <Calendar size={10} />
                                            <span>Inbound {new Date(booking.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 py-1 lg:border-l lg:pl-8 border-border">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                <Building2 size={10} /> Asset & Placement
                                            </p>
                                            <h4 className="font-black text-sm text-foreground uppercase italic">{booking.hostel.name}</h4>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{booking.items[0]?.room.name} • {booking.items[0]?.quantity} UNIT</p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                <DollarSign size={10} /> Gross Revenue
                                            </p>
                                            <p className="text-lg font-black text-foreground tracking-tighter">₵{((booking.items[0]?.unitPrice * booking.items[0]?.quantity) / 100).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Entry</p>
                                                <p className="font-black text-xs text-foreground uppercase">{new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <ChevronRight className="text-muted-foreground mt-3" size={14} />
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Exit</p>
                                                <p className="font-black text-xs text-muted-foreground uppercase">{new Date(booking.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="bg-muted/30 rounded-sm p-3 border border-border/50 flex gap-2">
                                                <MessageSquare size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                                                <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight italic">"{booking.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="lg:w-56 flex flex-col justify-center gap-2">
                                    {booking.payment?.status === "AWAITING_VERIFICATION" && (
                                        <div className="mb-2 p-3 bg-primary/5 rounded-sm border border-primary/10 space-y-3">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                                <DollarSign size={10} /> Settle Offline
                                            </p>
                                            <a
                                                href={booking.payment.offlineProofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full h-16 rounded-sm bg-muted overflow-hidden relative group/proof border border-border"
                                            >
                                                <img src={booking.payment.offlineProofUrl} alt="Proof" className="w-full h-full object-cover group-hover/proof:scale-105 transition-transform" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/proof:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-black uppercase tracking-widest">View</div>
                                            </a>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                <button
                                                    onClick={() => verifyOfflineMutation.mutate({ paymentId: booking.payment.id, status: "SUCCESS" })}
                                                    disabled={verifyOfflineMutation.isPending}
                                                    className="bg-primary text-background py-1.5 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-primary/90 transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => verifyOfflineMutation.mutate({ paymentId: booking.payment.id, status: "FAILED" })}
                                                    disabled={verifyOfflineMutation.isPending}
                                                    className="bg-background border border-border text-red-500 py-1.5 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-red-50 transition-all"
                                                >
                                                    Fail
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {booking.status === "PENDING_APPROVAL" && (
                                            <>
                                                <button
                                                    onClick={() => approveMutation.mutate(booking.id)}
                                                    disabled={approveMutation.isPending}
                                                    className="w-full bg-foreground text-background py-3 rounded-sm font-black text-[9px] uppercase tracking-[0.2em] shadow-sm hover:bg-foreground/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                >
                                                    {approveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                    Authorize
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt("Enter rejection reason (optional):");
                                                        if (reason !== null) rejectMutation.mutate({ id: booking.id, reason });
                                                    }}
                                                    disabled={rejectMutation.isPending}
                                                    className="w-full bg-background text-red-600 border border-border py-3 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-red-50 hover:border-red-500 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <X size={12} /> Reject
                                                </button>
                                            </>
                                        )}

                                        {(booking.status === "APPROVED" || booking.status === "CONFIRMED") && (
                                            <button
                                                onClick={() => checkInMutation.mutate(booking.id)}
                                                disabled={checkInMutation.isPending}
                                                className="w-full bg-primary text-background py-3 rounded-sm font-black text-[9px] uppercase tracking-[0.2em] hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                {checkInMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <LogIn size={12} />}
                                                Check In
                                            </button>
                                        )}

                                        {booking.status === "CHECKED_IN" && (
                                            <button
                                                onClick={() => checkOutMutation.mutate(booking.id)}
                                                disabled={checkOutMutation.isPending}
                                                className="w-full bg-background border border-border text-foreground py-3 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                {checkOutMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
                                                Check Out
                                            </button>
                                        )}

                                        {booking.status === "CHECKED_OUT" && (
                                            <button
                                                onClick={() => completeMutation.mutate(booking.id)}
                                                disabled={completeMutation.isPending}
                                                className="w-full bg-emerald-500 text-white py-3 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                {completeMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                                Finalize
                                            </button>
                                        )}
                                    </div>

                                    {/* More Actions */}
                                    {(booking.status !== "PENDING_APPROVAL" && booking.status !== "REJECTED") && (
                                        <div className="flex justify-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-muted-foreground hover:text-foreground p-1.5 rounded-sm transition-colors border border-transparent hover:border-border">
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52 rounded-sm p-1 shadow-xl border border-border bg-card">
                                                    {!booking.deletionRequested && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                const reason = prompt("Enter reason for deletion request:");
                                                                if (reason) requestDeletionMutation.mutate({ id: booking.id, reason });
                                                            }}
                                                            className="rounded-sm p-2 font-black text-[9px] uppercase tracking-widest cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            Request Purge
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
