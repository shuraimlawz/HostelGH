"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Calendar,
    MapPin,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    ChevronRight,
    Building2,
    CalendarCheck,
    ArrowRight,
    ShieldCheck,
    Smartphone,
    Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ReceiptModal from "@/components/bookings/ReceiptModal";

export default function TenantBookingsPage() {
    const queryClient = useQueryClient();
    const [receiptBookingId, setReceiptBookingId] = useState<string | null>(null);

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["tenant-bookings"],
        queryFn: async () => {
            const { data } = await api.get("/bookings/me");
            return Array.isArray(data) ? data : [];
        },
    });

    const initPaymentMutation = useMutation({
        mutationFn: (bookingId: string) => api.post(`/payments/paystack/init/${bookingId}`),
        onSuccess: (res) => {
            const { authorizationUrl } = res.data;
            if (authorizationUrl) {
                toast.loading("Redirecting to secure payment...");
                window.location.href = authorizationUrl;
            } else {
                toast.error("Could not initiate payment. Please try again.");
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Payment initiation failed");
        }
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100";
            case "PAYMENT_SECURED": return "bg-blue-50 text-blue-700 border-blue-100";
            case "RESERVED": return "bg-indigo-50 text-indigo-700 border-indigo-100";
            case "CHECKED_IN": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "COMPLETED": return "bg-gray-50 text-gray-700 border-gray-100";
            case "CANCELLED": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-gray-50 text-gray-500 border-gray-200";
        }
    };

    const tenantCheckInMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/bookings/${id}/tenant-check-in`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-bookings"] });
            toast.success("Check-in confirmed! Waiting for manager confirmation.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to confirm check-in")
    });

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-sm font-medium text-gray-400">Syncing your stays...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 pb-20 pt-4 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Itinerary</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
                    <p className="text-gray-500 text-sm max-w-md">Track your applications, payments, and stay history in real-time.</p>
                </div>

                <Link
                    href="/"
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/5 self-start md:self-auto"
                >
                    <PlusCircle className="w-4 h-4" />
                    Book New Stay
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {bookings?.length === 0 ? (
                    <div className="bg-white border border-gray-100 border-dashed rounded-2xl p-20 text-center space-y-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto text-gray-300">
                            <CalendarCheck size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">No active bookings</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">Your future stays will appear here. Start exploring and find your perfect hostel.</p>
                        </div>
                        <Link
                            href="/"
                            className="inline-flex h-11 px-8 items-center bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all"
                        >
                            Explore Listings
                        </Link>
                    </div>
                ) : (
                    bookings?.map((booking: any) => (
                        <div key={booking.id} className="group bg-white rounded-2xl border border-gray-100 p-1.5 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/20 transition-all duration-300 overflow-hidden">
                            <div className="flex flex-col lg:flex-row">
                                {/* Visual Context */}
                                <div className="p-4 md:p-6 flex-1">
                                    <div className="flex flex-col md:flex-row gap-6 md:items-center">
                                        <div className="w-full md:w-40 h-40 rounded-xl bg-gray-50 overflow-hidden relative shrink-0">
                                            {booking.hostel.images?.[0] ? (
                                                <img
                                                    src={booking.hostel.images[0]}
                                                    alt={booking.hostel.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                                    <Building2 className="text-blue-200" size={32} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight border shadow-none", getStatusStyles(booking.status))}>
                                                        {booking.status.replace(/_/g, " ")}
                                                    </Badge>
                                                    {booking.payment?.status === "SUCCESS" && (
                                                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight">
                                                            Paid
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{booking.hostel.name}</h3>
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <MapPin size={14} className="text-blue-500" />
                                                    <span className="text-xs font-semibold">{booking.hostel.city}, {booking.hostel.addressLine}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                                    <Clock size={16} className="text-blue-500 mt-0.5" />
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</p>
                                                        <p className="text-xs font-bold text-gray-700 truncate">
                                                            {format(new Date(booking.startDate), "MMM d, yyyy")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                                    <Smartphone size={16} className="text-blue-500 mt-0.5" />
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Units</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {booking.items?.map((item: any, idx: number) => (
                                                                <span key={item.id} className="text-xs font-bold text-gray-700">
                                                                    {item.quantity}x {item.room?.name || "Room"}{idx < (booking.items?.length || 0) - 1 ? "," : ""}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Ledger / Actions */}
                                <div className="bg-gray-50/50 p-6 md:p-8 lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100">
                                    <div className="mb-6 lg:mb-0 space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Base Price</p>
                                            <p className="text-sm font-bold text-gray-700">
                                                ₵{(booking.items?.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        
                                        {booking.status === "PENDING" && (
                                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="text-gray-400">Processing Fee</span>
                                                    <span className="text-blue-600">+ ₵{(Math.ceil((booking.items?.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0) / 0.9805) - (booking.items?.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0))) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                                                    <span>Grand Total</span>
                                                    <span className="text-lg">
                                                        ₵{(Math.ceil(booking.items?.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0) / 0.9805) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {booking.payment?.status === "SUCCESS" && (
                                            <div className="pt-3 border-t border-gray-100">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Payment Confirmed</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    ₵{(booking.payment.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2.5">
                                        {booking.status === "PENDING" && (
                                            <button
                                                onClick={() => initPaymentMutation.mutate(booking.id)}
                                                disabled={initPaymentMutation.isPending}
                                                className="w-full h-12 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/10 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                {initPaymentMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                                                Secure Payment
                                            </button>
                                        )}

                                        {booking.status === "RESERVED" && !booking.userCheckedIn && (
                                            <button
                                                onClick={() => tenantCheckInMutation.mutate(booking.id)}
                                                disabled={tenantCheckInMutation.isPending}
                                                className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/10 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                {tenantCheckInMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                Confirm Check-in
                                            </button>
                                        )}

                                        {booking.userCheckedIn && !booking.managerConfirmed && (
                                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                                    <Clock size={16} className="text-amber-600" />
                                                </div>
                                                <p className="text-[10px] font-bold text-amber-700 leading-tight uppercase tracking-tight">Awaiting management verification</p>
                                            </div>
                                        )}

                                        {(booking.status === "CHECKED_IN" || booking.status === "COMPLETED") && (
                                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                                    <ShieldCheck size={16} className="text-emerald-600" />
                                                </div>
                                                <p className="text-[10px] font-bold text-emerald-700 leading-tight uppercase tracking-tight">Verified & Secured Stay</p>
                                            </div>
                                        )}

                                        <Link
                                            href={`/hostels/${booking.hostel.id}`}
                                            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 transition-all"
                                        >
                                            View Listing <ChevronRight size={14} />
                                        </Link>

                                        {/* Receipt button — shown for any booking with a successful payment */}
                                        {booking.payment?.status === "SUCCESS" && (
                                            <button
                                                onClick={() => setReceiptBookingId(booking.id)}
                                                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all"
                                            >
                                                <Receipt size={14} /> View Receipt
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Receipt Modal */}
            {receiptBookingId && (
                <ReceiptModal
                    bookingId={receiptBookingId}
                    onClose={() => setReceiptBookingId(null)}
                />
            )}

            {/* Support Disclaimer */}
            <div className="bg-gray-900 p-8 rounded-2xl text-white relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                        <CalendarCheck size={28} className="text-blue-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h4 className="text-lg font-bold tracking-tight">Stay Protection Protocol</h4>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-2xl">
                            All bookings are protected by our secure settlement policy. Funds are only disbursed to managers after your check-in is verified. For disputes or assistance, contact our 24/7 Support Hub.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlusCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
        </svg>
    );
}
