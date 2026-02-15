"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ExternalLink, CreditCard, Loader2, Clock, MessageCircle, Info } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Booking } from "@/types";
import { useState, useEffect } from "react";

function Countdown({ deadline }: { deadline: string }) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(deadline).getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft("EXPIRED");
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

    if (timeLeft === "EXPIRED") return <span className="text-red-500 font-black">EXPIRED</span>;
    return <span className="text-orange-500 font-black tabular-nums">{timeLeft}</span>;
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING_APPROVAL": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px] font-black tracking-widest px-3">Pending Owner</Badge>;
            case "APPROVED": return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase text-[10px] font-black tracking-widest px-3">Awaiting Payment</Badge>;
            case "CONFIRMED": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px] font-black tracking-widest px-3">Paid & Confirmed</Badge>;
            case "REJECTED": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px] font-black tracking-widest px-3">Rejected</Badge>;
            case "EXPIRED": return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200 uppercase text-[10px] font-black tracking-widest px-3">Expired</Badge>;
            default: return <Badge variant="outline" className="uppercase text-[10px] font-black tracking-widest px-3">{status}</Badge>;
        }
    };

    return (
        <div className="container px-6 py-12">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">My Reservations</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Track your applications and complete payments.</p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] mb-10 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                    <Info size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900">24-Hour Payment Policy</h3>
                    <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                        Once your booking is <strong>Approved</strong>, you must complete payment within 24 hours.
                        Failure to pay within this timeframe will result in your slot being automatically released to other students.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-xl shadow-gray-100/50">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-b">
                                <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 px-8">Hostel & Location</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 px-8">Deadline</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 px-8">Status</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 px-8 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(bookings) && bookings.map((booking: Booking) => (
                                <TableRow key={booking.id} className="hover:bg-gray-50/30 transition-colors border-b last:border-0">
                                    <TableCell className="py-6 px-8">
                                        <div>
                                            <p className="font-black uppercase text-sm tracking-tight">{booking.hostel.name}</p>
                                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
                                                <Clock size={10} /> Applied {format(new Date(booking.startDate), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        {booking.status === 'APPROVED' && booking.paymentDeadline ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    <Clock size={12} className="text-orange-400" /> Time Remaining
                                                </div>
                                                <Countdown deadline={booking.paymentDeadline} />
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-6 px-8">{getStatusBadge(booking.status)}</TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            {booking.status === 'APPROVED' && (
                                                <Button
                                                    size="sm"
                                                    disabled={payMutation.isPending}
                                                    onClick={() => payMutation.mutate(booking.id)}
                                                    className="bg-black hover:bg-black/90 text-white rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-4 shadow-lg shadow-black/10 transition-all active:scale-95"
                                                >
                                                    {payMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Pay Now</>}
                                                </Button>
                                            )}
                                            {booking.hostel.whatsappNumber && (
                                                <a
                                                    href={`https://wa.me/233${booking.hostel.whatsappNumber.replace(/^0/, '')}?text=Hi, I'm ${booking.tenant.firstName}, I booked a room at ${booking.hostel.name}.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
                                                    title="Chat with owner"
                                                >
                                                    <MessageCircle size={18} />
                                                </a>
                                            )}
                                            <Link href={`/hostels/${booking.hostel.id}`}>
                                                <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl border-gray-100 hover:bg-gray-50 flex items-center justify-center">
                                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!Array.isArray(bookings) || bookings.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="font-bold text-lg">No reservations yet.</p>
                                            <Link href="/hostels" className="text-blue-600 font-bold hover:underline uppercase text-[10px] tracking-widest">Explore Hostels</Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
