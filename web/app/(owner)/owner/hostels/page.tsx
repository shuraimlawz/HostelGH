"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import {
    Plus,
    Building2,
    MapPin,
    Users,
    MoreVertical,
    Edit2,
    Eye,
    Trash2,
    CalendarCheck,
    Star,
    Loader2,
    Search,
    Clock,
    LayoutDashboard,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";

export default function OwnerHostelsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { data: hostels, isLoading } = useQuery({
        queryKey: ["owner-hostels"],
        queryFn: async () => {
            const res = await api.get("/hostels/my-hostels");
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/hostels/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-hostels"] });
            toast.success("Property removed from your portfolio");
        },
        onError: (err: any) => toast.error(err.message || "Failed to delete hostel")
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Permanently remove ${name}? This action cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredHostels = hostels?.filter((h: any) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Properties...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                            Proprietor Hub
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-3">
                        My Hostels <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Manage and track your property portfolio performance.</p>
                </div>
                <Link
                    href="/owner/hostels/new"
                    className="flex items-center gap-3 bg-gray-950 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 group active:scale-[0.98]"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                    <span>List New Property</span>
                </Link>
            </div>

            {/* Search & Controls */}
            {hostels?.length > 0 && (
                <div className="relative max-w-lg">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-gray-950 placeholder:text-gray-400 shadow-sm"
                        placeholder="Search your properties..."
                    />
                </div>
            )}

            {/* Grid */}
            {filteredHostels?.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <Building2 className="text-gray-300" size={40} />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h3 className="text-2xl font-black text-gray-950 tracking-tight mb-2">No properties found</h3>
                        <p className="text-gray-500 font-medium">Start building your portfolio by adding your first hostel property to the platform.</p>
                    </div>
                    {hostels?.length === 0 && (
                        <Link
                            href="/owner/hostels/new"
                            className="inline-flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest hover:underline mt-4"
                        >
                            Create first listing <Plus size={14} />
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredHostels?.map((hostel: any) => (
                        <div key={hostel.id} className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col relative">
                            {/* Image Area */}
                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                {hostel.images?.[0] ? (
                                    <img
                                        src={hostel.images[0]}
                                        alt={hostel.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                        <Building2 size={48} />
                                    </div>
                                )}

                                <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm",
                                        hostel.isPublished
                                            ? "bg-emerald-500/90 text-white border-emerald-400"
                                            : hostel.pendingVerification
                                                ? "bg-amber-500/90 text-white border-amber-400"
                                                : "bg-gray-900/90 text-gray-400 border-gray-800"
                                    )}>
                                        {hostel.isPublished ? "Live" : hostel.pendingVerification ? "Pending Approval" : "Draft"}
                                    </span>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors text-gray-900 shadow-sm border border-white/20">
                                                <MoreVertical size={16} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-gray-100">
                                            <DropdownMenuItem asChild className="rounded-xl p-3 font-bold text-xs cursor-pointer focus:bg-gray-50">
                                                <Link href={`/hostels/${hostel.id}`} target="_blank" className="flex items-center gap-3">
                                                    <Eye size={16} className="text-blue-500" />
                                                    View Public Listing
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-xl p-3 font-bold text-xs cursor-pointer focus:bg-gray-50">
                                                <Link href={`/owner/hostels/${hostel.id}/rooms`} className="flex items-center gap-3">
                                                    <LayoutDashboard size={16} className="text-purple-500" />
                                                    Manage Rooms
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-xl p-3 font-bold text-xs cursor-pointer focus:bg-gray-50">
                                                <Link href={`/owner/hostels/${hostel.id}/edit`} className="flex items-center gap-3">
                                                    <Edit2 size={16} className="text-gray-900" />
                                                    Edit Details
                                                </Link>
                                            </DropdownMenuItem>
                                            {!hostel.isFeatured && (
                                                <DropdownMenuItem
                                                    onClick={() => toast.info("Upgrade to Pro to unlock featured listings!")}
                                                    className="rounded-xl p-3 font-bold text-xs cursor-pointer focus:bg-orange-50 text-orange-600 focus:text-orange-700"
                                                >
                                                    <Star size={16} className="mr-3" />
                                                    Promote to Featured
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator className="bg-gray-50" />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(hostel.id, hostel.name)}
                                                className="rounded-xl p-3 font-bold text-xs cursor-pointer focus:bg-red-50 text-red-600 focus:text-red-700"
                                            >
                                                <Trash2 size={16} className="mr-3" />
                                                Delete Property
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-gray-950 tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                        {hostel.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                                        <MapPin size={12} className="text-blue-500" />
                                        <span>{hostel.city}, {hostel.addressLine}</span>
                                    </div>
                                </div>

                                {hostel.pendingVerification && (
                                    <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                            <Clock size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-tight">Waiting for Verification</p>
                                            <p className="text-[10px] font-bold text-amber-700">An admin will review your listing shortly.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-transparent hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Users size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Inventory</span>
                                        </div>
                                        <p className="text-xl font-black text-gray-950 tracking-tighter">{hostel._count.rooms}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-transparent hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <CalendarCheck size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Bookings</span>
                                        </div>
                                        <p className="text-xl font-black text-gray-950 tracking-tighter">{hostel._count.bookings}</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Link
                                        href={`/owner/hostels/${hostel.id}/rooms`}
                                        className="w-full bg-blue-600 text-white py-3 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all gap-2"
                                    >
                                        <Zap size={14} />
                                        Manage Pricing & Rooms
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
