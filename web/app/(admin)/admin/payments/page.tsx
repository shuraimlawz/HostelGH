"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    CreditCard,
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Wallet,
    AlertCircle
} from "lucide-react";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";

function AdminPaymentsContent() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const initialPage = parseInt(searchParams.get("page") || "1");
    const [page, setPage] = useState(initialPage);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");

    const updateUrlParams = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
        updateUrlParams("search", val || null);
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        setPage(1);
        updateUrlParams("status", val === "ALL" ? null : val);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateUrlParams("page", newPage.toString());
    };

    // Fetch Payments History
    const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
        queryKey: ["admin-payments", page, search, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", "10");
            if (search) params.append("search", search);
            if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);

            const res = await api.get(`/admin/payments?${params.toString()}`);
            return res.data;
        }
    });

    const payments = paymentsData?.data || [];
    const meta = paymentsData?.meta || { total: 0, totalPages: 1 };

    // Fetch Pending Payouts
    const { data: pendingPayouts, isLoading: payoutsLoading } = useQuery({
        queryKey: ["admin-payouts-pending"],
        queryFn: async () => {
            const res = await api.get("/payouts/requests/all");
            return res.data.filter((r: any) => r.status === "PENDING");
        }
    });

    const updatePayoutMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string; action: "APPROVE" | "REJECT" }) => {
            return api.patch(`/payouts/requests/${id}/process`, { action });
        },
        onSuccess: (_, variables) => {
            toast.success(`Payout request ${variables.action === 'APPROVE' ? 'approved' : 'rejected'}`);
            queryClient.invalidateQueries({ queryKey: ["admin-payouts-pending"] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "PAID": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "PENDING": return "bg-orange-50 text-orange-600 border-orange-100";
            case "FAILED": return "bg-red-50 text-red-600 border-red-100";
            case "REJECTED": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS": return <CheckCircle2 size={14} />;
            case "PAID": return <CheckCircle2 size={14} />;
            case "PENDING": return <Clock size={14} />;
            case "FAILED": return <AlertCircle size={14} />;
            case "REJECTED": return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20 pt-4 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                            Financial Management
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <Wallet size={12} className="text-emerald-400" /> Transaction List
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight leading-none mb-3">
                        Finance <span className="text-emerald-600 opacity-40">/</span> Revenue
                    </h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Manage incoming payments and withdrawal rules.</p>
                </div>
            </div>

            {/* Pending Payouts Section */}
            {pendingPayouts && pendingPayouts.length > 0 && (
                <div className="bg-gray-950 text-white rounded-3xl p-10 space-y-8 shadow-xl border border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10 backdrop-blur-md">
                                <ArrowUpRight size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold uppercase tracking-tight">Withdrawal Requests</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Action Required: {pendingPayouts.length} Active Requests
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingPayouts.map((payout: any) => (
                            <div key={payout.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Request Amount</p>
                                        <p className="text-2xl font-bold tracking-tight text-white">
                                            GH₵ {((payout.amount || 0) / 100).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-orange-500/20">Pending</span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xs uppercase overflow-hidden border border-white/10">
                                            {payout.owner?.avatarUrl ? (
                                                <img src={payout.owner.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                payout.owner?.firstName?.[0] || 'O'
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{payout.owner?.firstName} {payout.owner?.lastName}</p>
                                            <p className="text-[10px] text-gray-400 truncate tracking-tight">{payout.owner?.email}</p>
                                        </div>
                                    </div>
                                    {payout.payoutMethodDetails && (
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Destination</p>
                                            <p className="text-xs font-bold text-gray-300">
                                                {payout.payoutMethodDetails.provider} - {payout.payoutMethodDetails.accountNumber}
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{payout.payoutMethodDetails.accountName}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => updatePayoutMutation.mutate({ id: payout.id, action: "APPROVE" })}
                                        disabled={updatePayoutMutation.isPending}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {updatePayoutMutation.isPending ? "..." : "Approve"}
                                    </button>
                                    <button
                                        onClick={() => updatePayoutMutation.mutate({ id: payout.id, action: "REJECT" })}
                                        disabled={updatePayoutMutation.isPending}
                                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payments History */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-950 tracking-tight">Transaction History</h3>
                </div>

                {/* Search & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-16 pr-8 outline-none focus:border-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-400 shadow-sm text-sm"
                                placeholder="Search by reference or email..."
                            />
                        </div>
                        <div className="relative min-w-[200px]">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full h-full bg-white border border-gray-100 rounded-2xl pl-14 pr-8 outline-none focus:border-blue-500 transition-all font-bold text-gray-900 shadow-sm text-xs uppercase tracking-widest appearance-none cursor-pointer"
                            >
                                <option value="ALL">Status: All</option>
                                <option value="SUCCESS">Success</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                    {paymentsLoading ? (
                        <div className="flex h-[400px] items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-blue-600" size={40} />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading transactions...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Reference</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Paid By</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Context</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {payments.map((payment: any) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="font-bold text-gray-900 font-mono text-xs mb-1">{payment.reference}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                                        <Clock size={10} /> {format(new Date(payment.createdAt), "dd MMM yyyy HH:mm")}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xs uppercase border border-gray-100">
                                                        {payment.booking?.tenant?.firstName?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">
                                                            {payment.booking?.tenant?.firstName}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{payment.booking?.tenant?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <ArrowDownLeft size={14} className="text-gray-300" />
                                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">
                                                        {payment.booking?.hostel?.name || "N/A"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard size={14} className="text-gray-400" />
                                                    <span className="text-sm font-bold text-gray-900 tracking-tight">
                                                        GH₵ {((payment.amount || 0) / 100).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest w-fit ml-auto shadow-sm",
                                                    getStatusColor(payment.status)
                                                )}>
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {payments.length === 0 && (
                                <div className="p-32 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-gray-200">
                                        <Wallet size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-950 uppercase tracking-tight mb-2">No results</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No financial records found for this search.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Page {page} of {meta.totalPages || 1}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-400"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => handlePageChange(Math.min(meta.totalPages || 1, page + 1))}
                                disabled={page === (meta.totalPages || 1)}
                                className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-400"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminPaymentsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading...</p>
                </div>
            </div>
        }>
            <AdminPaymentsContent />
        </Suspense>
    );
}
