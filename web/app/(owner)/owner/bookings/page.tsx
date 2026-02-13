"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Booking {
    id: string;
    status: string;
    tenant: { email: string };
    hostel: { name: string };
    items: { roomId: string }[];
}

export default function OwnerBookingsPage() {
    const queryClient = useQueryClient();

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
            toast.success("Booking approved successfully");
        },
        onError: (err: { message: string }) => toast.error(err.message)
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/bookings/${id}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
            toast.success("Booking rejected");
        },
        onError: (err: { message: string }) => toast.error(err.message)
    });

    return (
        <div className="container px-6 py-12">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight">Booking Requests</h1>
                <p className="text-muted-foreground mt-2">Approve or reject incoming reservation requests</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="font-bold">Tenant</TableHead>
                                <TableHead className="font-bold">Hostel / Room</TableHead>
                                <TableHead className="font-bold text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(bookings) && bookings.filter((b: Booking) => b.status === "PENDING_APPROVAL").map((booking: Booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <p className="font-bold">{booking.tenant.email}</p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium">{booking.hostel.name}</p>
                                        <p className="text-xs text-muted-foreground">{booking.items?.[0]?.roomId}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-3">
                                            <Button
                                                size="sm"
                                                onClick={() => approveMutation.mutate(booking.id)}
                                                disabled={approveMutation.isPending}
                                                className="bg-green-600 hover:bg-green-700 rounded-lg px-4"
                                            >
                                                <Check className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => rejectMutation.mutate(booking.id)}
                                                disabled={rejectMutation.isPending}
                                                className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg px-4"
                                            >
                                                <X className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!Array.isArray(bookings) || bookings.filter((b: Booking) => b.status === "PENDING_APPROVAL").length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-48 text-center text-muted-foreground">
                                        No pending requests at the moment.
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
