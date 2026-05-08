"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    CalendarDays,
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
    CreditCard,
    Building2,
    User,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";

function AdminBookingsContent() {
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

    const { data: bookingsData, isLoading } = useQuery({
        queryKey: ["admin-bookings", page, search, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", "10");
            if (search) params.append("search", search);
            if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);

            const res = await api.get(`/admin/bookings?${params.toString()}`);
            return res.data;
        }
    });

    const bookings = bookingsData?.data || [];
    const meta = bookingsData?.meta || { total: 0, totalPages: 1 };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "PENDING": return "bg-orange-50 text-orange-600 border-orange-100";
            case "CANCELLED": return "bg-red-50 text-red-600 border-red-100";
            case "COMPLETED": return "bg-blue-50 text-blue-600 border-blue-100";
            default: return "bg-gray-50 dark:bg-gray-950 text-gray-600 border-gray-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "CONFIRMED": return <CheckCircle2 size={14} />;
            case "PENDING": return <Clock size={14} />;
            case "CANCELLED": return <XCircle size={14} />;
            case "COMPLETED": return <CheckCircle2 size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20 pt-4 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-violet-100">
                            Reservation Log
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                            <CalendarDays size={12} className="text-violet-400" /> Booking Management
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight leading-none mb-3">
                        Bookings <span className="text-violet-600 opacity-40">/</span> Archive
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">Monitor reservation flow, status, and financial records.</p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-100 rounded-2xl flex items-center justify-center px-8 py-4 gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
                        <CalendarDays size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 leading-none mb-1">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-950 tracking-tight">{meta.total}</p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                        <input
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-100 rounded-2xl py-4 pl-16 pr-8 outline-none focus:border-violet-500 transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:text-gray-500 shadow-sm text-sm"
                            placeholder="Search by booking ID or tenant email..."
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full h-full bg-white dark:bg-gray-900 border border-gray-100 rounded-2xl pl-14 pr-8 outline-none focus:border-violet-500 transition-all font-bold text-gray-900 dark:text-white shadow-sm text-xs uppercase tracking-widest appearance-none cursor-pointer"
                        >
                            <option value="ALL">Status: All</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-violet-600" size={40} />
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Syncing Reservation Data...</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Context</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Tenant Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Hostel Asset</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Financials</th>
                                    <th className="px-8 py-6 text-[10px) font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {bookings.map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-950 transition-all group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white font-mono text-[10px] mb-1">#{booking.id.substring(0, 12).toUpperCase()}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                                    <Clock size={10} /> {format(new Date(booking.createdAt), "dd MMM yyyy")}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-950 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold text-xs uppercase border border-gray-100">
                                                    {booking.tenant?.firstName?.[0] || 'T'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                        {booking.tenant?.firstName} {booking.tenant?.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">{booking.tenant?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-gray-300" />
                                                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{booking.hostel?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={14} className="text-gray-400 dark:text-gray-500" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                                                    GH₵ {((booking.payment?.amount || 0) / 100).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest w-fit ml-auto shadow-sm",
                                                getStatusColor(booking.status)
                                            )}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {bookings.length === 0 && (
                            <div className="p-32 text-center">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-center justify-center mx-auto mb-8 text-gray-200">
                                    <CalendarDays size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-950 uppercase tracking-tight mb-2">No Reservations</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">No bookings match the current criteria.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                <div className="px-10 py-8 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Page {page} of {meta.totalPages || 1}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="w-12 h-12 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-all shadow-sm disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-400 dark:text-gray-500"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => handlePageChange(Math.min(meta.totalPages || 1, page + 1))}
                            disabled={page === (meta.totalPages || 1)}
                            className="w-12 h-12 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-all shadow-sm disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-400 dark:text-gray-500"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminBookingsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-violet-600" size={40} />
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Loading Bookings...</p>
                </div>
            </div>
        }>
            <AdminBookingsContent />
        </Suspense>
    );
}
