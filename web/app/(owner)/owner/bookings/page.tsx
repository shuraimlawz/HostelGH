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
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                            Reservations
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-3">
                        Booking Requests <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Manage incoming reservation requests and tenant communication.</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-[2rem] py-4 pl-14 pr-6 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-gray-950 placeholder:text-gray-400 shadow-sm"
                        placeholder="Search tenants or hostels..."
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {["ALL", "PENDING_APPROVAL", "APPROVED", "CHECKED_IN", "CHECKED_OUT", "COMPLETED", "REJECTED"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                            filter === f
                                ? "bg-gray-950 text-white border-gray-950 shadow-lg shadow-gray-200"
                                : "bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600"
                        )}
                    >
                        {f === "PENDING_APPROVAL" ? "Pending" : f === "ALL" ? "All Requests" : f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Content */}
            {filteredBookings?.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-24 text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 transform -rotate-3 transition-transform hover:rotate-0">
                        <Calendar className="text-gray-300" size={48} />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h3 className="text-2xl font-black text-gray-950 tracking-tight mb-2">No bookings found</h3>
                        <p className="text-gray-500 font-medium">
                            {filter === "ALL"
                                ? "When students request a room in your hostels, they will appear here for your review."
                                : `No booking requests matching the '${filter.replace('_', ' ').toLowerCase()}' filter.`}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredBookings?.map((booking: any) => (
                        <div key={booking.id} className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300">
                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Tenant Info */}
                                <div className="lg:w-72 space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 font-black text-2xl uppercase shadow-inner border border-blue-100">
                                            {booking.tenant.firstName?.[0] || booking.tenant.email[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl leading-tight text-gray-950 mb-1">
                                                {booking.tenant.firstName} {booking.tenant.lastName}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-bold truncate max-w-[180px]">
                                                {booking.tenant.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                            booking.status === "PENDING_APPROVAL" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                booking.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    booking.status === "CONFIRMED" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        "bg-gray-100 text-gray-500 border-gray-200"
                                        )}>
                                            {booking.status === "PENDING_APPROVAL" ? <Clock size={12} /> :
                                                booking.status === "APPROVED" || booking.status === "CONFIRMED" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {booking.status.replace("_", " ")}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold pl-2">
                                            <Calendar size={14} />
                                            <span>Requested {new Date(booking.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* KYC Details */}
                                    {(booking.levelOfStudy || booking.guardianName) && (
                                        <div className="space-y-3 pt-4 border-t border-gray-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Student & Guardian Details</p>
                                            <div className="space-y-1.5 text-xs">
                                                {booking.levelOfStudy && <p className="flex justify-between"><span className="text-gray-500 font-bold">Level:</span> <span className="font-medium text-right">{booking.levelOfStudy}</span></p>}
                                                {booking.guardianName && <p className="flex justify-between"><span className="text-gray-500 font-bold">Guardian:</span> <span className="font-medium text-right truncate max-w-[120px]">{booking.guardianName}</span></p>}
                                                {booking.guardianPhone && <p className="flex justify-between"><span className="text-gray-500 font-bold">Guardian Tel:</span> <span className="font-medium text-right">{booking.guardianPhone}</span></p>}
                                            </div>
                                            {(booking.admissionDocUrl || booking.passportPhotoUrl) && (
                                                <div className="flex gap-2 mt-2">
                                                    {booking.admissionDocUrl && (
                                                        <a href={booking.admissionDocUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-gray-50 hover:bg-gray-100 border text-gray-600 rounded-xl py-2 font-bold text-[10px] uppercase tracking-widest transition-colors">
                                                            ID Doc
                                                        </a>
                                                    )}
                                                    {booking.passportPhotoUrl && (
                                                        <a href={booking.passportPhotoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-gray-50 hover:bg-gray-100 border text-gray-600 rounded-xl py-2 font-bold text-[10px] uppercase tracking-widest transition-colors">
                                                            Photo
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 py-2 lg:border-l lg:pl-10 border-gray-100">
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Building2 size={12} /> Property & Room
                                            </p>
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-950 group-hover:text-blue-600 transition-colors">{booking.hostel.name}</h4>
                                                <p className="text-sm font-semibold text-gray-500 mt-1">{booking.items[0]?.room.name} <span className="text-gray-300 mx-2">•</span> {booking.items[0]?.quantity} Bed(s)</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <DollarSign size={12} /> Total Value
                                            </p>
                                            <p className="text-2xl font-black text-gray-950 tracking-tight">₵{((booking.items[0]?.unitPrice * booking.items[0]?.quantity) / 100).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-8">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Move-in Date</p>
                                                <p className="font-bold text-base text-gray-950">{new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <ChevronRight className="text-gray-200 mt-5" size={20} />
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Move-out Date</p>
                                                <p className="font-bold text-base text-gray-400">{new Date(booking.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="bg-gray-50 rounded-2xl p-4 flex gap-3">
                                                <MessageSquare size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                                <p className="text-xs font-medium text-gray-600 leading-relaxed italic">"{booking.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="lg:w-60 flex flex-col justify-center gap-3">
                                    {booking.payment?.status === "AWAITING_VERIFICATION" && (
                                        <div className="space-y-4 p-5 bg-blue-50/50 rounded-[1.5rem] border border-blue-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                                <DollarSign size={12} /> Review Payment
                                            </p>
                                            <a
                                                href={booking.payment.offlineProofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full h-24 rounded-xl bg-gray-100 overflow-hidden relative group/proof ring-1 ring-gray-200"
                                            >
                                                <img src={booking.payment.offlineProofUrl} alt="Proof" className="w-full h-full object-cover group-hover/proof:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/proof:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase tracking-widest">Verify Proof</div>
                                            </a>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => verifyOfflineMutation.mutate({ paymentId: booking.payment.id, status: "SUCCESS" })}
                                                    disabled={verifyOfflineMutation.isPending}
                                                    className="bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => verifyOfflineMutation.mutate({ paymentId: booking.payment.id, status: "FAILED" })}
                                                    disabled={verifyOfflineMutation.isPending}
                                                    className="bg-white border text-red-500 py-2.5 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {booking.status === "PENDING_APPROVAL" && (
                                            <>
                                                <button
                                                    onClick={() => approveMutation.mutate(booking.id)}
                                                    disabled={approveMutation.isPending}
                                                    className="w-full bg-gray-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                >
                                                    {approveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                    Approve Request
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt("Enter rejection reason (optional):");
                                                        if (reason !== null) rejectMutation.mutate({ id: booking.id, reason });
                                                    }}
                                                    disabled={rejectMutation.isPending}
                                                    className="w-full bg-white text-red-600 border border-gray-100 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            </>
                                        )}

                                        {(booking.status === "APPROVED" || booking.status === "CONFIRMED") && (
                                            <button
                                                onClick={() => checkInMutation.mutate(booking.id)}
                                                disabled={checkInMutation.isPending}
                                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                {checkInMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                                                Check In Tenant
                                            </button>
                                        )}

                                        {booking.status === "CHECKED_IN" && (
                                            <button
                                                onClick={() => checkOutMutation.mutate(booking.id)}
                                                disabled={checkOutMutation.isPending}
                                                className="w-full bg-white border border-gray-200 text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                {checkOutMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                                                Result Check Out
                                            </button>
                                        )}

                                        {booking.status === "CHECKED_OUT" && (
                                            <button
                                                onClick={() => completeMutation.mutate(booking.id)}
                                                disabled={completeMutation.isPending}
                                                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                {completeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                Complete Booking
                                            </button>
                                        )}
                                    </div>

                                    {/* More Actions */}
                                    {(booking.status !== "PENDING_APPROVAL" && booking.status !== "REJECTED") && (
                                        <div className="flex justify-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-gray-400 hover:text-gray-900 p-2 rounded-lg transition-colors">
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-gray-100">
                                                    {!booking.deletionRequested && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                const reason = prompt("Enter reason for deletion request:");
                                                                if (reason) requestDeletionMutation.mutate({ id: booking.id, reason });
                                                            }}
                                                            className="rounded-xl p-3 font-bold text-xs cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        >
                                                            Request Data Deletion
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
