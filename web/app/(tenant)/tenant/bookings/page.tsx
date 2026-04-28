"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { 
    ExternalLink, 
    CreditCard, 
    Loader2, 
    Clock, 
    MessageCircle, 
    Info, 
    ArrowRight, 
    Building2, 
    ChevronRight,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Booking } from "@/types";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

function Countdown({ deadline }: { deadline: string }) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(deadline).getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft("PROTOCOL EXPIRED");
                clearInterval(timer);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [deadline]);

    if (timeLeft === "PROTOCOL EXPIRED") return <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Purged</span>;
    return <span className="text-orange-500 font-bold tabular-nums tracking-tighter truncate">{timeLeft}</span>;
}

export default function TenantBookingsPage() {
    const { data: bookings, isLoading, refetch } = useQuery({
        queryKey: ["tenant-bookings"],
        queryFn: async () => {
            const { data } = await api.get("/bookings/me");
            return Array.isArray(data) ? data : [];
        },
    });

    const payMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const { data } = await api.post(`/payments/paystack/init/${bookingId}`);
            return data;
        },
        onSuccess: (data) => {
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            }
        },
        onError: (err: any) => toast.error(err.message || "Failed to initialize payment")
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING": 
                return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "COMPLETED": 
                return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "CANCELLED": 
                return "bg-red-500/10 text-red-600 border-red-500/20";
            default: 
                return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-12 pb-20 pt-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-[0.2em]">
                            Activity Ledger
                        </span>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Encrypted History</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter uppercase leading-tight">
                        Reservations <span className="text-blue-600 opacity-40">/</span> Linkage
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-sm">
                        Monitor active stay protocols and placement validation.
                    </p>
                </div>

                <div className="hidden md:flex bg-white rounded-2xl border border-gray-100 p-6 items-center gap-8 shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Links</p>
                        <p className="text-3xl font-bold text-gray-900 tracking-tighter leading-none">
                            {Array.isArray(bookings) ? bookings.filter(b => b.status === "COMPLETED").length : 0}
                        </p>
                    </div>
                    <div className="w-px h-10 bg-gray-100" />
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Flow</p>
                        <p className="text-3xl font-bold text-gray-900 tracking-tighter leading-none">
                            {Array.isArray(bookings) ? bookings.filter(b => b.status === "PENDING").length : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-gray-950 text-white rounded-[1.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden group border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-40 group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md shrink-0">
                        <Info size={32} className="text-blue-400" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-bold uppercase tracking-tight leading-none text-white">Contact Reveal <span className="text-blue-500 opacity-40">.</span></h3>
                        <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest max-w-2xl">
                            Pay the platform fee to instantly reveal the hostel manager's contact details and confirm your stay directly with them.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6">
                        <Skeleton className="h-44 w-full rounded-[1.5rem]" />
                        <Skeleton className="h-44 w-full rounded-[1.5rem]" />
                    </div>
                ) : Array.isArray(bookings) && bookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {bookings.map((booking: Booking) => (
                            <div key={booking.id} className="bg-white rounded-[1.5rem] border border-gray-100 p-8 shadow-sm group hover:border-blue-500/20 transition-all">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                                    {/* Hostel Identity */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border",
                                                getStatusStyles(booking.status)
                                            )}>
                                                {booking.status.replace("_", " ")}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                <Calendar size={12} />
                                                COMMENCE: {format(new Date(booking.startDate), "MMM d, yyyy").toUpperCase()}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-tighter leading-none">
                                                {booking.hostel.name} <span className="text-blue-600 opacity-40">/</span> {booking.items?.[0]?.room.name || "UNASSIGNED"}
                                            </h2>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Building2 size={12} /> NODE ID: #{booking.id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="hidden lg:block w-px h-16 bg-gray-50" />

                                    {/* Deadline / Countdown */}
                                    <div className="w-full lg:w-48 space-y-2 text-center lg:text-left">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-1.5 leading-none mb-1">
                                            <Clock size={12} /> Expiry
                                        </p>
                                        <div className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                                            {booking.status === 'PENDING' ? (
                                                <span className="text-orange-500 text-sm">Action Needed</span>
                                            ) : (
                                                <span className="opacity-20">—</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
                                        {booking.status === 'PENDING' && (
                                            <button
                                                disabled={payMutation.isPending}
                                                onClick={() => payMutation.mutate(booking.id)}
                                                className="h-14 px-8 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                                            >
                                                {payMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard size={16} />}
                                                PAY TO REVEAL CONTACT
                                            </button>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {booking.status === 'COMPLETED' && booking.hostel.whatsappNumber && (
                                                <a
                                                    href={`https://wa.me/233${booking.hostel.whatsappNumber.replace(/^0/, '')}?text=Hi, I'm ${booking.tenant?.firstName || ''}, I booked a room at ${booking.hostel.name}.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                                                    title="Operational Support"
                                                >
                                                    <MessageCircle size={20} />
                                                </a>
                                            )}
                                            <Link 
                                                href={`/hostels/${booking.hostel.id}`} 
                                                className="w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                                                title="View Asset"
                                            >
                                                <ChevronRight size={20} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] border border-dashed border-gray-100 p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                            <Clock size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold uppercase tracking-tighter">Archive Status Detected</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No active stay protocols detected in the network.</p>
                        </div>
                        <Link href="/hostels" className="inline-flex items-center gap-4 px-10 py-5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
                            EXPLORE ASSETS <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
