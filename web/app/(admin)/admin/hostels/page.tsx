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
    Bed
} from "lucide-react";
import { useState } from "react";
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

export default function AdminHostelsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const { data: hostels, isLoading } = useQuery({
        queryKey: ["admin-hostels"],
        queryFn: async () => {
            const res = await api.get("/admin/hostels");
            return res.data;
        }
    });

    const updateHostelMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return api.patch(`/hostels/${id}`, data);
        },
        onSuccess: () => {
            toast.success("Hostel status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-hostels"] });
        },
        onError: () => toast.error("Failed to update hostel")
    });

    const deleteHostelMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/hostels/${id}`);
        },
        onSuccess: () => {
            toast.success("Hostel removed from platform");
            queryClient.invalidateQueries({ queryKey: ["admin-hostels"] });
        },
        onError: () => toast.error("Operation failed")
    });

    const filteredHostels = hostels?.filter((h: any) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase()) ||
        h.owner.email.toLowerCase().includes(search.toLowerCase())
    );

    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil((filteredHostels?.length || 0) / ITEMS_PER_PAGE);
    const paginatedHostels = filteredHostels?.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (isLoading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Analyzing Asset Registry...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        Asset Moderation
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <Building2 size={12} className="text-emerald-400" /> Infrastructure Panel
                    </div>
                </div>
                <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-3">
                    Verified Hostels <span className="text-emerald-600">.</span>
                </h1>
                <p className="text-gray-500 font-medium text-lg">Manage platform inventory, verify listings, and feature top accommodations.</p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 placeholder:text-gray-400 shadow-sm"
                        placeholder="Search by name, city, or proprietor email..."
                    />
                </div>
                <div className="bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center px-8 gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Total Assets</p>
                        <p className="text-2xl font-black text-gray-950 tracking-tighter">{hostels?.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {paginatedHostels?.map((hostel: any) => (
                    <div key={hostel.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                            {hostel.images?.[0] ? (
                                <img src={hostel.images[0]} alt={hostel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Building2 size={48} />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm",
                                    hostel.isPublished
                                        ? "bg-emerald-500/90 text-white border-emerald-400"
                                        : "bg-gray-900/90 text-gray-400 border-gray-800"
                                )}>
                                    {hostel.isPublished ? "Live" : "Draft"}
                                </span>
                                {hostel.isFeatured && (
                                    <span className="bg-blue-600/90 text-white border-blue-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm flex items-center gap-1">
                                        <Star size={10} fill="currentColor" /> Featured
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-black text-gray-950 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                    {hostel.name}
                                </h3>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                                            <MoreVertical size={18} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 p-2 shadow-xl">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 py-2">
                                            Moderation Mode
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => updateHostelMutation.mutate({ id: hostel.id, data: { isPublished: !hostel.isPublished } })} className="rounded-lg font-bold text-xs gap-3 py-2.5">
                                            {hostel.isPublished ? <XCircle size={16} className="text-orange-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                                            {hostel.isPublished ? "Unpublish Asset" : "Publish Asset"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateHostelMutation.mutate({ id: hostel.id, data: { isFeatured: !hostel.isFeatured } })} className="rounded-lg font-bold text-xs gap-3 py-2.5">
                                            <Star size={16} className="text-blue-500" />
                                            {hostel.isFeatured ? "Remove Featured" : "Feature Asset"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-gray-50 my-1" />
                                        <DropdownMenuItem asChild>
                                            <Link href={`/hostels/${hostel.id}`} target="_blank" className="rounded-lg font-bold text-xs gap-3 py-2.5 flex items-center">
                                                <ExternalLink size={16} className="text-gray-400" />
                                                Review Listing
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (confirm(`Completely purge ${hostel.name}? This cannot be undone.`)) {
                                                    deleteHostelMutation.mutate(hostel.id);
                                                }
                                            }}
                                            className="rounded-lg font-bold text-xs gap-3 py-2.5 text-red-600 hover:bg-red-50"
                                        >
                                            <XCircle size={16} />
                                            Terminate Listing
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                                <MapPin size={12} className="text-blue-400" /> {hostel.city}, {hostel.region}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Bed size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Inventory</span>
                                    </div>
                                    <p className="text-lg font-black text-gray-950 tracking-tighter">{hostel._count.rooms} Types</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <UsersIcon size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Demand</span>
                                    </div>
                                    <p className="text-lg font-black text-gray-950 tracking-tighter">{hostel._count.bookings} Bookings</p>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-50">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Proprietor Identity</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-[10px]">
                                        {hostel.owner.firstName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-gray-950 truncate">
                                            {hostel.owner.firstName} {hostel.owner.lastName}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium truncate">{hostel.owner.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Assets */}
            {paginatedHostels?.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <Building2 className="mx-auto text-gray-200 mb-6" size={64} />
                    <h3 className="text-2xl font-black text-gray-950 italic uppercase tracking-tighter mb-2">Zero Infrastructure Located</h3>
                    <p className="text-gray-400 text-sm font-medium">Platform inventory is currently offline or search returned empty.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-10 border-t border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Page {page} of {totalPages} Strategic Assets
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-950 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-950 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
