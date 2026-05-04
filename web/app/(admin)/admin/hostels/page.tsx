"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Building2,
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Star,
    ExternalLink,
    MapPin,
    Users as UsersIcon,
    Filter,
    ArrowUpRight,
    ChevronRight as ChevronRightIcon
} from "lucide-react";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function AdminHostelsContent() {
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

    const { data: hostelsData, isLoading } = useQuery({
        queryKey: ["admin-hostels", page, search, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", "8"); 
            if (search) params.append("search", search);
            if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);

            const res = await api.get(`/admin/hostels?${params.toString()}`);
            return res.data;
        }
    });

    const hostels = hostelsData?.data || [];
    const meta = hostelsData?.meta || { total: 0, totalPages: 1 };

    const { data: pendingData } = useQuery({
        queryKey: ["admin-hostels-pending"],
        queryFn: async () => {
            const res = await api.get("/admin/hostels?status=pending&limit=3");
            return res.data;
        }
    });
    const pendingHostels = pendingData?.data || [];

    const updateHostelMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => api.patch(`/admin/hostels/${id}`, data),
        onSuccess: () => {
            toast.success("Hostel status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-hostels"] });
            queryClient.invalidateQueries({ queryKey: ["admin-hostels-pending"] });
        },
        onError: () => toast.error("Failed to update hostel")
    });

    const verifyHostelMutation = useMutation({
        mutationFn: async (id: string) => api.patch(`/admin/hostels/${id}/verify`),
        onSuccess: () => {
            toast.success("Hostel verified and published");
            queryClient.invalidateQueries({ queryKey: ["admin-hostels"] });
            queryClient.invalidateQueries({ queryKey: ["admin-hostels-pending"] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const rejectHostelMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason?: string }) => api.patch(`/admin/hostels/${id}/reject`, { reason }),
        onSuccess: () => {
            toast.success("Hostel submission rejected");
            queryClient.invalidateQueries({ queryKey: ["admin-hostels"] });
            queryClient.invalidateQueries({ queryKey: ["admin-hostels-pending"] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const toggleFeatureMutation = useMutation({
        mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => api.patch(`/admin/hostels/${id}/feature`, { featured }),
        onSuccess: (_, variables) => {
            toast.success(variables.featured ? "Hostel featured" : "Hostel unfeatured");
            queryClient.invalidateQueries({ queryKey: ["admin-hostels"] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const deleteHostelMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/hostels/${id}`),
        onSuccess: () => {
            toast.success("Hostel removed from platform");
            queryClient.invalidateQueries({ queryKey: ["admin-hostels"] });
            queryClient.invalidateQueries({ queryKey: ["admin-hostels-pending"] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 pt-4 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset Moderation</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Hostel Audit Panel</h1>
                    <p className="text-gray-500 text-sm max-w-md">Verify property legitimacy, manage featured assets, and monitor platform inventory.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl px-6 py-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Live Inventory</p>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight">{meta.total}</p>
                    </div>
                </div>
            </div>

            {/* Pending Verification Section */}
            {pendingHostels.length > 0 && (
                <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-200">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Critical Verification Queue</h2>
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                                    Action Required: {pendingData?.meta?.total || pendingHostels.length} First-time listings
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingHostels.map((hostel: any) => (
                            <div key={hostel.id} className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-colors">
                                <div className="relative z-10 flex flex-col h-full space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs uppercase border border-gray-100">
                                                {hostel.owner?.firstName?.[0] || 'O'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-gray-900 truncate pr-2">{hostel.name}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{hostel.city}</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[8px] font-bold uppercase tracking-widest">Pending</span>
                                    </div>

                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <UsersIcon size={12} />
                                            <span className="font-medium">Owner: <strong className="text-gray-900">{hostel.owner?.firstName}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <MapPin size={12} />
                                            <span className="font-medium truncate">{hostel.addressLine}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={() => verifyHostelMutation.mutate(hostel.id)}
                                            disabled={verifyHostelMutation.isPending}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 font-bold text-[9px] uppercase tracking-widest transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50"
                                        >
                                            {verifyHostelMutation.isPending ? "..." : "Approve Site"}
                                        </button>
                                        <button
                                            onClick={() => rejectHostelMutation.mutate({ id: hostel.id })}
                                            disabled={rejectHostelMutation.isPending}
                                            className="bg-white border border-red-100 text-red-600 hover:bg-red-50 rounded-lg py-2 font-bold text-[9px] uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
                <div className="md:col-span-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full h-12 bg-white border border-gray-100 rounded-xl pl-12 pr-4 outline-none focus:border-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm text-sm"
                            placeholder="Find assets by name, city, or proprietor..."
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full h-12 bg-white border border-gray-100 rounded-xl pl-12 pr-10 outline-none focus:border-blue-500 transition-all font-bold text-gray-900 shadow-sm text-sm appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Listing Status</option>
                            <option value="published">Published Assets</option>
                            <option value="unpublished">Internal Drafts</option>
                            <option value="pending">Verification Queue</option>
                        </select>
                        <ChevronRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            {/* Asset Grid */}
            {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <p className="text-sm font-medium text-gray-400">Syncing infrastructure log...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {hostels.map((hostel: any) => (
                            <div key={hostel.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all flex flex-col">
                                {/* Image Logic */}
                                <div className="relative h-56 bg-gray-50 overflow-hidden border-b border-gray-50">
                                    {hostel.images?.[0] ? (
                                        <img src={hostel.images[0]} alt={hostel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                            <Building2 size={32} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Image Unavailable</span>
                                        </div>
                                    )}

                                    {/* Overlay Status */}
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                        <span className={cn(
                                            "h-6 px-2.5 flex items-center rounded-lg text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border",
                                            hostel.isPublished
                                                ? "bg-emerald-600/90 text-white border-emerald-500/50"
                                                : "bg-gray-900/90 text-white border-gray-800"
                                        )}>
                                            {hostel.isPublished ? "Live" : "Draft"}
                                        </span>
                                        {hostel.isFeatured && (
                                            <span className="h-6 px-2.5 flex items-center bg-blue-600/90 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-blue-500/50">
                                                Featured
                                            </span>
                                        )}
                                    </div>

                                    {/* Admin Dropdown */}
                                    <div className="absolute top-3 right-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 hover:bg-white backdrop-blur-sm transition-all shadow-sm border border-white/50 text-gray-600">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl border-gray-100 p-2 shadow-xl w-52">
                                                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 py-2">Property Control</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => updateHostelMutation.mutate({ id: hostel.id, data: { published: !hostel.isPublished } })}
                                                    className="rounded-lg font-bold text-[10px] gap-3 py-2.5 cursor-pointer uppercase tracking-wide"
                                                >
                                                    {hostel.isPublished ? <XCircle size={14} className="text-orange-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                                                    {hostel.isPublished ? "Unpublish Asset" : "Publish Asset"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => toggleFeatureMutation.mutate({ id: hostel.id, featured: !hostel.isFeatured })}
                                                    className="rounded-lg font-bold text-[10px] gap-3 py-2.5 cursor-pointer uppercase tracking-wide"
                                                >
                                                    <Star size={14} className="text-blue-500" />
                                                    {hostel.isFeatured ? "Revoke Featured" : "Promote Featured"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-gray-50 my-1" />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/hostels/${hostel.slug || hostel.id}`} target="_blank" className="rounded-lg font-bold text-[10px] gap-3 py-2.5 flex items-center cursor-pointer uppercase tracking-wide">
                                                        <ExternalLink size={14} className="text-gray-400" /> View External Listing
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (confirm(`Authorize terminal deletion of ${hostel.name}? This action is irreversible.`)) {
                                                            deleteHostelMutation.mutate(hostel.id);
                                                        }
                                                    }}
                                                    className="rounded-lg font-bold text-[10px] gap-3 py-2.5 text-red-600 hover:bg-red-50 cursor-pointer uppercase tracking-wide"
                                                >
                                                    <XCircle size={14} /> Purge Asset
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Property Info */}
                                <div className="p-5 flex-1 flex flex-col space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-bold text-gray-900 text-[15px] tracking-tight truncate leading-tight">
                                                {hostel.name}
                                            </h3>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Star size={12} className={cn("text-blue-500", (hostel.averageRating || 0) > 0 && "fill-blue-500")} />
                                                <span className="text-xs font-bold text-gray-900">
                                                    {(hostel.averageRating || 0) > 0 ? hostel.averageRating.toFixed(1) : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest truncate">
                                            {hostel.city}, {hostel.region}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Inventory</p>
                                            <p className="text-xs font-bold text-gray-900">{hostel._count?.rooms || 0} Units</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Demand</p>
                                            <p className="text-xs font-bold text-gray-900">{hostel._count?.bookings || 0} Stays</p>
                                        </div>
                                    </div>

                                    <div className="pt-1 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                            <UsersIcon size={12} />
                                            <span>{hostel.owner?.firstName}</span>
                                        </div>
                                        <Link href={`/admin/hostels/${hostel.id}`} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1">
                                            Audit <ArrowUpRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Assets */}
                    {hostels.length === 0 && (
                        <div className="py-32 text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-200 border border-gray-100 shadow-inner">
                                <Building2 size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Zero Asset Hits</h3>
                                <p className="text-gray-400 text-sm font-medium">No properties found matching your moderation parameters.</p>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="px-1 py-8 flex items-center justify-between border-t border-gray-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Analyzing page {page} of {meta.totalPages || 1} Strategic Assets
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-30 shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => handlePageChange(Math.min(meta.totalPages, page + 1))}
                                disabled={page === meta.totalPages || meta.totalPages === 0}
                                className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-30 shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminHostelsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400">Initializing asset log...</p>
                </div>
            </div>
        }>
            <AdminHostelsContent />
        </Suspense>
    );
}
