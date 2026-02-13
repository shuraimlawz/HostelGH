"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ExternalLink, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Booking } from "@/types";

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
            case "PENDING_APPROVAL": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Approval</Badge>;
            case "APPROVED": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Awaiting Payment</Badge>;
            case "CONFIRMED": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
            case "REJECTED": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container px-6 py-12">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Your Bookings</h1>
                    <p className="text-muted-foreground mt-2">Manage your hostel reservations and payments</p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold">Hostel</TableHead>
                                <TableHead className="font-bold">Start Date</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(bookings) && bookings.map((booking: Booking) => (
                                <TableRow key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div>
                                            <p className="font-bold">{booking.hostel.name}</p>
                                            <p className="text-xs text-muted-foreground">{booking.hostel.city}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{format(new Date(booking.startDate), "MMM d, yyyy")}</TableCell>
                                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {booking.status === 'APPROVED' && (
                                                <Button
                                                    size="sm"
                                                    disabled={payMutation.isPending}
                                                    onClick={() => payMutation.mutate(booking.id)}
                                                    className="bg-primary hover:bg-primary/90 rounded-lg"
                                                >
                                                    {payMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Pay Now</>}
                                                </Button>
                                            )}
                                            <Link href={`/hostels/${booking.hostel.id}`}>
                                                <Button size="sm" variant="ghost" className="rounded-lg">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!Array.isArray(bookings) || bookings.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                        No bookings found. Start your discovery adventure!
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
