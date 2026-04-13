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

    if (timeLeft === "PROTOCOL EXPIRED") return <span className="text-red-500 font-black italic uppercase tracking-widest text-[10px]">Purged</span>;
    return <span className="text-orange-500 font-black tabular-nums tracking-tighter truncate">{timeLeft}</span>;
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
            case "PENDING_APPROVAL": 
                return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "APPROVED": 
                return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "CONFIRMED": 
                return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "REJECTED": 
                return "bg-red-500/10 text-red-600 border-red-500/20";
            case "EXPIRED": 
                return "bg-gray-500/10 text-gray-500 border-gray-500/20";
            default: 
                return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-white/10">
                            Activity Ledger
                        </span>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Encrypted History</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Reservations <span className="text-blue-600 NOT-italic opacity-40">.</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-sm">
                        Monitor your stay protocols and active network placements.
                    </p>
                </div>

                <div className="hidden md:flex bg-white rounded-3xl border border-muted p-6 items-center gap-6 shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Links</p>
                        <p className="text-2xl font-black italic tracking-tighter leading-none">
                            {Array.isArray(bookings) ? bookings.filter(b => b.status === "CONFIRMED").length : 0}
                        </p>
                    </div>
                    <div className="w-px h-10 bg-muted" />
                    <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pending Flow</p>
                        <p className="text-2xl font-black italic tracking-tighter leading-none">
                            {Array.isArray(bookings) ? bookings.filter(b => ["APPROVED", "PENDING_APPROVAL"].includes(b.status)).length : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-black text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/20 backdrop-blur-md shrink-0 ring-4 ring-white/5">
                        <Info size={32} className="text-blue-400" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-black italic uppercase tracking-tight leading-none text-white">24-Hour Settlement Protocol <span className="text-blue-500 NOT-italic">.</span></h3>
                        <p className="text-[11px] text-white/40 font-bold leading-relaxed uppercase tracking-widest max-w-2xl">
                            Upon approval, payment must be finalized within the <span className="text-white">24-hour window</span>. Failure to settle will result in automatic slot purging from the matrix.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6">
                        <Skeleton className="h-40 w-full rounded-[2.5rem]" />
                        <Skeleton className="h-40 w-full rounded-[2.5rem]" />
                    </div>
                ) : Array.isArray(bookings) && bookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {bookings.map((booking: Booking) => (
                            <div key={booking.id} className="bg-white rounded-[3rem] border border-muted p-8 md:p-10 shadow-sm group hover:border-black/10 transition-all">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                                    {/* Hostel Identity */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border",
                                                getStatusStyles(booking.status)
                                            )}>
                                                {booking.status.replace("_", " ")}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                                <Calendar size={12} />
                                                STAY START: {format(new Date(booking.startDate), "MMM d, yyyy").toUpperCase()}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                                                {booking.hostel.name} <span className="text-blue-600 NOT-italic opacity-40">/</span> {booking.items?.[0]?.room.name || "UNASSIGNED"}
                                            </h2>
                                            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                                                <Building2 size={12} /> HOSTEL ID: #{booking.id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="hidden lg:block w-px h-16 bg-muted" />

                                    {/* Deadline / Countdown */}
                                    <div className="w-full lg:w-48 space-y-2">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 leading-none mb-1">
                                            <Clock size={12} /> Settlement Clock
                                        </p>
                                        <div className="text-xl font-black text-foreground uppercase tracking-tight">
                                            {booking.status === 'APPROVED' && booking.paymentDeadline ? (
                                                <Countdown deadline={booking.paymentDeadline} />
                                            ) : (
                                                <span className="opacity-20">—</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Responsive Actions */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {booking.status === 'APPROVED' && (
                                            <button
                                                disabled={payMutation.isPending}
                                                onClick={() => payMutation.mutate(booking.id)}
                                                className="h-16 px-10 bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center gap-4 hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 group/pay"
                                            >
                                                {payMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5 group-hover/pay:scale-110 transition-transform" /> AUTHORIZE PAYMENT</>}
                                            </button>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {booking.hostel.whatsappNumber && (
                                                <a
                                                    href={`https://wa.me/233${booking.hostel.whatsappNumber.replace(/^0/, '')}?text=Hi, I'm ${booking.tenant.firstName}, I booked a room at ${booking.hostel.name}.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-16 h-16 bg-white border border-muted rounded-2xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-xl"
                                                >
                                                    <MessageCircle size={24} />
                                                </a>
                                            )}
                                            <Link href={`/hostels/${booking.hostel.id}`} className="w-16 h-16 bg-white border border-muted rounded-2xl flex items-center justify-center text-blue-600 hover:bg-black hover:text-white transition-all shadow-sm hover:shadow-xl">
                                                <ChevronRight size={24} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3.5rem] border border-dashed border-muted p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                            <Clock size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Negative History <span className="text-blue-600 NOT-italic">.</span></h3>
                            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">No active stay protocols detected in the network.</p>
                        </div>
                        <Link href="/hostels" className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-xl">
                            EXPLORE HOSTELS <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
