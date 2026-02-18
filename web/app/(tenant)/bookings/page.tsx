"use client";

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
    MoreVertical,
    ChevronRight,
    Building2,
    CalendarCheck,
    ArrowRight,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function TenantBookingsPage() {
    const queryClient = useQueryClient();

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
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Payment initiation failed");
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING_APPROVAL": return "bg-orange-50 text-orange-700 border-orange-100";
            case "APPROVED": return "bg-blue-50 text-blue-700 border-blue-100";
            case "CONFIRMED": return "bg-green-50 text-green-700 border-green-100";
            case "CHECKED_IN": return "bg-purple-50 text-purple-700 border-purple-100";
            case "COMPLETED": return "bg-gray-50 text-gray-700 border-gray-100";
            case "REJECTED":
            case "CANCELLED": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="mb-10">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-2">My Bookings</h1>
                <p className="text-gray-500 font-medium text-base">Manage your payments and booking history</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {bookings?.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-24 text-center space-y-8">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <CalendarCheck className="text-gray-200" size={48} />
                        </div>
                        <div className="max-w-xs mx-auto space-y-4">
                            <h3 className="text-2xl font-bold text-gray-900">No bookings yet</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">Your future stays will appear here. Start exploring and find your perfect hostel.</p>
                            <Link
                                href="/hostels"
                                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95"
                            >
                                Explore Hostels <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                ) : (
                    bookings?.map((booking: any) => (
                        <div key={booking.id} className="group bg-white rounded-[2.5rem] border p-2 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 overflow-hidden">
                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x">
                                {/* Hostel Image/Info Section */}
                                <div className="p-6 md:p-8 flex-1">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="w-full md:w-48 h-48 rounded-[2rem] bg-gray-100 overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                                            {booking.hostel.images?.[0] ? (
                                                <img
                                                    src={booking.hostel.images[0]}
                                                    alt={booking.hostel.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                                    <Building2 className="text-blue-200" size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", getStatusColor(booking.status))}>
                                                    {booking.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{booking.hostel.name}</h3>
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <MapPin size={14} className="text-blue-500" />
                                                    <span className="text-sm font-semibold">{booking.hostel.city}, {booking.hostel.addressLine}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Clock size={12} className="text-gray-400" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date Range</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-700">
                                                        {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Calendar size={12} className="text-gray-400" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Room Types</span>
                                                    </div>
                                                    {booking.items?.map((item: any, idx: number) => (
                                                        <p key={item.id} className="text-xs font-bold text-gray-700">
                                                            {item.quantity}x {item.room?.name || "Room"} {idx < booking.items.length - 1 ? ", " : ""}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment/Actions Section */}
                                <div className="p-8 lg:w-80 flex flex-col justify-between bg-gray-50/30">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Price</span>
                                            {booking.payment?.status === "SUCCESS" && (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle2 size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Paid</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-gray-500">₵</span>
                                            <span className="text-4xl font-black text-gray-900 tracking-tight">
                                                {(booking.items?.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0) / 100).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {booking.status === "APPROVED" && (
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => initPaymentMutation.mutate(booking.id)}
                                                    disabled={initPaymentMutation.isPending}
                                                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {initPaymentMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                                                    Pay with Card/Momo
                                                </button>
                                                <button
                                                    onClick={() => {/* Open Offline Modal */ }}
                                                    className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold text-sm border shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Info size={18} className="text-blue-500" />
                                                    Upload Transfer Receipt
                                                </button>
                                            </div>
                                        )}

                                        {booking.payment?.status === "AWAITING_VERIFICATION" && (
                                            <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl border border-blue-100 flex items-center justify-center gap-2">
                                                <Loader2 size={18} className="animate-spin" />
                                                <span className="font-bold text-sm">Verifying Proof...</span>
                                            </div>
                                        )}

                                        {booking.status === "CONFIRMED" && (
                                            <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 flex items-center justify-center gap-2">
                                                <CheckCircle2 size={18} />
                                                <span className="font-bold text-sm">Booking Confirmed</span>
                                            </div>
                                        )}

                                        {booking.status === "PENDING_APPROVAL" && (
                                            <div className="bg-orange-50 text-orange-700 p-4 rounded-2xl border border-orange-100 flex items-center justify-center gap-2 italic">
                                                <Clock size={18} />
                                                <span className="font-bold text-sm">Waiting for selection</span>
                                            </div>
                                        )}

                                        <Link
                                            href={`/hostels/${booking.hostel.id}`}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                                        >
                                            View Property <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
