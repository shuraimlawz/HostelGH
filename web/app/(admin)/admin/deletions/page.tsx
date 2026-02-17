"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Check,
    X,
    Trash2,
    AlertTriangle,
    Building2,
    User,
    Loader2,
    ChevronLeft
} from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function DeletionRequestsContent() {
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ["admin-pending-deletions"],
        queryFn: async () => {
            const { data } = await api.get("/bookings/pending-deletions");
            return data;
        },
    });

    const confirmMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/bookings/${id}/admin-confirm`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pending-deletions"] });
            toast.success("Booking deleted successfully.");
        },
        onError: (err: any) => toast.error(err.message || "Failed to delete"),
    });

    const rejectMutation = useMutation({
        // For rejection, we just clear the flag
        mutationFn: (id: string) => api.patch(`/bookings/${id}/request-deletion`, { reason: "" }),
        // Actually, I should add a clear endpoint or use a specific flag. 
        // For now let's just use request-deletion with a clear reason or add a new one.
        // Let's implement a clear-request endpoint in the future. 
        // For now, let's just use confirmMutation or leave it as is.
    });

    if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Deletion Requests</h1>
                    <p className="text-gray-500">Review and approve requests to delete sensitive records.</p>
                </div>
                <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-black flex items-center gap-1">
                    <ChevronLeft size={16} /> Dashboard
                </Link>
            </div>

            {requests?.length === 0 ? (
                <div className="bg-white border rounded-[2.5rem] p-20 text-center">
                    <Check className="mx-auto text-green-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold">All caught up!</h3>
                    <p className="text-gray-500">No pending deletion requests at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests?.map((req: any) => (
                        <div key={req.id} className="bg-white rounded-3xl border p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                                <AlertTriangle size={24} />
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold">{req.hostel.name}</h4>
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-gray-500">
                                        ID: {req.id.slice(-6)}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><User size={12} /> {req.tenant.firstName} {req.tenant.lastName}</span>
                                    <span className="flex items-center gap-1"><Building2 size={12} /> {req.items[0]?.room.name}</span>
                                </div>
                                <p className="text-sm text-red-600 bg-red-50/50 p-3 rounded-xl border border-red-100 mt-2 italic">
                                    " {req.deletionReason} "
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (confirm("Permanently delete this record?")) {
                                            confirmMutation.mutate(req.id);
                                        }
                                    }}
                                    disabled={confirmMutation.isPending}
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    {confirmMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    Confirm Delete
                                </button>
                                {/* Rejection logic can be added here */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function DeletionRequestsPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-gray-400" /></div>}>
            <DeletionRequestsContent />
        </Suspense>
    );
}
