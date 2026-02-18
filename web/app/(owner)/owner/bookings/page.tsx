"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Check,
    X,
    Calendar,
    User,
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
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function OwnerBookingsPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<string>("ALL");

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

    const filteredBookings = bookings?.filter((b: any) => filter === "ALL" || b.status === filter);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-gray-400 font-medium animate-pulse">Loading reservations...</p>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Booking Requests</h1>
                    <p className="text-gray-500">Manage incoming reservation requests and tenant communication.</p>
                </div>

                <div className="flex gap-2 bg-white p-1.5 rounded-2xl border shadow-sm overflow-x-auto no-scrollbar">
                    {["ALL", "PENDING_APPROVAL", "APPROVED", "CHECKED_IN", "CHECKED_OUT", "COMPLETED", "REJECTED"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                filter === f
                                    ? "bg-black text-white shadow-lg shadow-black/10"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                            )}
                        >
                            {f === "PENDING_APPROVAL" ? "Pending" : f === "ALL" ? "All" : f.replace('_', ' ').toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings?.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-[3rem] p-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="text-gray-300" size={40} />
                    </div>
                    <div className="max-w-xs mx-auto">
                        <h3 className="text-xl font-bold">No bookings found</h3>
                        <p className="text-gray-500 mt-2">When students request a room in your hostels, they will appear here for your review.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredBookings?.map((booking: any) => (
                        <div key={booking.id} className="group bg-white rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden">
                            <div className="p-8 md:p-10">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Left: Tenant and Status */}
                                    <div className="md:w-64 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 font-bold text-xl uppercase tracking-widest shadow-inner">
                                                {booking.tenant.firstName?.[0] || booking.tenant.email[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">
                                                    {booking.tenant.firstName} {booking.tenant.lastName}
                                                </h3>
                                                <p className="text-xs text-gray-400 font-medium truncate max-w-[150px]">
                                                    {booking.tenant.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm",
                                                booking.status === "PENDING_APPROVAL" ? "bg-orange-500 text-white" :
                                                    booking.status === "APPROVED" ? "bg-green-500 text-white" :
                                                        booking.status === "CONFIRMED" ? "bg-blue-600 text-white" : "bg-gray-400 text-white"
                                            )}>
                                                {booking.status === "PENDING_APPROVAL" ? <Clock size={12} /> :
                                                    booking.status === "APPROVED" || booking.status === "CONFIRMED" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {booking.status.replace("_", " ")}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold pl-1">
                                                <Calendar size={14} />
                                                <span>Requested {new Date(booking.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {booking.deletionRequested && (
                                                <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest pl-1">
                                                    <XCircle size={12} />
                                                    <span>Deletion Requested</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Middle: Property & Dates */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 py-2 border-l md:pl-10">
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Building2 size={12} /> Hostel & Room
                                                </p>
                                                <h4 className="font-bold text-xl group-hover:text-blue-600 transition-colors">{booking.hostel.name}</h4>
                                                <p className="text-sm font-semibold text-gray-600">{booking.items[0]?.room.name} × {booking.items[0]?.quantity}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    <DollarSign size={12} /> Estimated Income
                                                </p>
                                                <p className="text-xl font-bold text-green-600">₵{((booking.items[0]?.unitPrice * booking.items[0]?.quantity) / 100).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Move-in</p>
                                                    <p className="font-black text-lg">{new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                                <ChevronRight className="text-gray-200 mt-4" size={24} />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Move-out</p>
                                                    <p className="font-black text-lg text-gray-400">{new Date(booking.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>

                                            {booking.notes && (
                                                <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 italic">
                                                    <MessageSquare size={16} className="text-gray-300 shrink-0" />
                                                    <p className="text-xs text-gray-500 line-clamp-2">{booking.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="md:w-48 flex flex-col justify-center gap-3">
                                        {booking.payment?.status === "AWAITING_VERIFICATION" && (
                                            <div className="space-y-4 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Review Payment Proof</p>
                                                <a
                                                    href={booking.payment.offlineProofUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full h-32 rounded-xl bg-gray-100 overflow-hidden relative group/proof"
                                                >
                                                    <img src={booking.payment.offlineProofUrl} alt="Proof" className="w-full h-full object-cover group-hover/proof:scale-110 transition-transform" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/proof:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">VIEW FULL IMAGE</div>
                                                </a>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => verifyOfflineMutation.mutate({ paymentId: booking.payment.id, status: "SUCCESS" })}
                                                        disabled={verifyOfflineMutation.isPending}
                                                        className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all"
                                                    >
                                                        {verifyOfflineMutation.isPending ? "..." : "Approve"}
                                                    </button>
                                                    <button
                                                        onClick={() => verifyOfflineMutation.mutate({ paymentId: booking.payment.id, status: "FAILED" })}
                                                        disabled={verifyOfflineMutation.isPending}
                                                        className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-xs hover:bg-red-100 active:scale-95 transition-all"
                                                    >
                                                        {verifyOfflineMutation.isPending ? "..." : "Reject"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {booking.status === "PENDING_APPROVAL" && (
                                            <>
                                                <button
                                                    onClick={() => approveMutation.mutate(booking.id)}
                                                    disabled={approveMutation.isPending}
                                                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {approveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt("Enter rejection reason (optional):");
                                                        if (reason !== null) rejectMutation.mutate({ id: booking.id, reason });
                                                    }}
                                                    disabled={rejectMutation.isPending}
                                                    className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold text-sm hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {rejectMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {(booking.status === "APPROVED" || booking.status === "CONFIRMED") && (
                                            <button
                                                onClick={() => checkInMutation.mutate(booking.id)}
                                                disabled={checkInMutation.isPending}
                                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                {checkInMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                                                Check In
                                            </button>
                                        )}
                                        {booking.status === "CHECKED_IN" && (
                                            <button
                                                onClick={() => checkOutMutation.mutate(booking.id)}
                                                disabled={checkOutMutation.isPending}
                                                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-orange-200 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                {checkOutMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                                                Check Out
                                            </button>
                                        )}
                                        {booking.status === "CHECKED_OUT" && (
                                            <button
                                                onClick={() => completeMutation.mutate(booking.id)}
                                                disabled={completeMutation.isPending}
                                                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-green-200 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                {completeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                Complete
                                            </button>
                                        )}
                                        {(booking.status === "REJECTED" || booking.status === "CANCELLED" || booking.status === "COMPLETED") && (
                                            <div className="space-y-3">
                                                <div className="text-center py-4 bg-gray-50 rounded-2xl">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                                        {booking.status.replace('_', ' ')}
                                                    </p>
                                                </div>
                                                {!booking.deletionRequested && (
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt("Enter reason for deletion request:");
                                                            if (reason) requestDeletionMutation.mutate({ id: booking.id, reason });
                                                        }}
                                                        className="w-full text-red-500 text-[10px] font-bold uppercase tracking-widest hover:underline"
                                                    >
                                                        Request Deletion
                                                    </button>
                                                )}
                                            </div>
                                        )}
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
