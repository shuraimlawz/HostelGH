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
    ChevronLeft,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

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
            toast.success("Booking record deleted.");
        },
        onError: (err: any) => toast.error(err.message || "Deletion failure"),
    });

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center bg-white dark:bg-gray-900">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-red-600" size={40} />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Searching for requests...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-12 pb-20 pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-red-200">
                            Deletion Review
                        </span>
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={14} className="text-red-500" />
                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Admin approval required</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tighter uppercase leading-tight">
                        Deletion Requests <span className="text-red-600 opacity-40">/</span> Delete
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest max-w-sm">
                        Review and approve the permanent removal of stay records.
                    </p>
                </div>
                <Link href="/admin" className="h-12 px-6 rounded-xl bg-gray-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg">
                    <ChevronLeft size={16} /> Back to Hub
                </Link>
            </div>

            {requests?.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 rounded-3xl p-24 text-center space-y-6 shadow-sm">
                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100 shadow-sm">
                        <Check size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold uppercase tracking-tight text-gray-900 dark:text-white">All Clear</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">No pending deletion requests at the moment.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests?.map((req: any) => (
                        <div key={req.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:border-red-500/20 transition-all group">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0 border border-red-100 shadow-sm group-hover:scale-110 transition-transform">
                                <AlertTriangle size={32} />
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-xl text-gray-900 dark:text-white uppercase tracking-tight">{req.hostel.name}</h4>
                                        <span className="text-[9px] bg-gray-50 dark:bg-gray-950 border border-gray-100 px-3 py-1 rounded-lg font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                                            RECORD ID: #{req.id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><User size={12} className="text-blue-500" /> {req.tenant.firstName} {req.tenant.lastName}</span>
                                        <span className="flex items-center gap-1.5"><Building2 size={12} className="text-blue-500" /> {req.items[0]?.room.name}</span>
                                    </div>
                                </div>
                                <div className="p-5 bg-red-50/30 rounded-2xl border border-red-50/50 relative overflow-hidden">
                                    <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-1">Reason for Deletion</div>
                                    <p className="text-xs font-bold text-red-700 leading-relaxed uppercase tracking-tight">
                                        " {req.deletionReason || "NO REASON PROVIDED"} "
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0">
                                <button
                                    onClick={() => {
                                        if (confirm("Executing this will permanently delete the record. Continue?")) {
                                            confirmMutation.mutate(req.id);
                                        }
                                    }}
                                    disabled={confirmMutation.isPending}
                                    className="h-16 px-10 bg-red-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/10 flex items-center gap-4 active:scale-95 disabled:opacity-50"
                                >
                                    {confirmMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                    DELETE RECORD
                                </button>
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
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-red-600" size={40} />
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Loading...</p>
                </div>
            </div>
        }>
            <DeletionRequestsContent />
        </Suspense>
    );
}
