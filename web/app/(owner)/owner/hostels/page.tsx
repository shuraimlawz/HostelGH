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
    Loader2,
    Search,
    Zap,
    ArrowUpRight,
    LayoutGrid,
    ChevronRight,
    Settings2,
    ShieldCheck,
    PlusCircle
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
            toast.success("Property listing removed from portfolio.");
        },
        onError: (err: any) => toast.error(err.message || "Removal failed")
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to completely remove ${name} from your portfolio?`)) {
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
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Syncing portfolio assets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Property Network</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Portfolio</h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm max-w-md">Enterprise-grade control over your property fleet and operational network.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-950 border border-gray-100 rounded-xl py-3 pl-12 pr-6 outline-none focus:bg-white dark:bg-gray-900 focus:border-blue-500 transition-all font-bold text-xs shadow-sm w-full sm:w-64"
                            placeholder="Find property..."
                        />
                    </div>
                    <Link
                        href="/owner/hostels/new"
                        className="h-12 px-8 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 group"
                    >
                        <PlusCircle size={18} />
                        Deploy Listing
                    </Link>
                </div>
            </div>

            {/* Matrix View Selection */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-blue-600">
                    <LayoutGrid size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Portfolio Grid</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Active Listings: <span className="text-gray-900 dark:text-white">{hostels?.length || 0}</span>
                </div>
            </div>

            {/* Portfolio Matrix */}
            {filteredHostels?.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 border-dashed rounded-2xl p-20 text-center space-y-6">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-950 rounded-xl flex items-center justify-center mx-auto text-gray-300">
                        <Building2 size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No properties found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-sm mx-auto">Either you haven't listed any hostels yet or no assets match your search.</p>
                    </div>
                    <Link
                        href="/owner/hostels/new"
                        className="inline-flex h-11 px-8 items-center bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all"
                    >
                        List First Property
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredHostels?.map((hostel: any) => (
                        <div key={hostel.id} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                            {/* Visual Layer */}
                            <div className="aspect-[16/10] bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
                                {hostel.images?.[0] ? (
                                    <img
                                        src={hostel.images[0]}
                                        alt={hostel.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-blue-100">
                                        <Building2 size={48} />
                                    </div>
                                )}

                                {/* Overlays */}
                                <div className="absolute inset-x-3 top-3 flex justify-between items-start">
                                    <div className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight shadow-sm backdrop-blur-md border",
                                        hostel.isPublished
                                            ? "bg-emerald-500/90 text-white border-emerald-400/20"
                                            : hostel.pendingVerification
                                                ? "bg-amber-500/90 text-white border-amber-400/20"
                                                : "bg-gray-900/80 text-white border-white/10"
                                    )}>
                                        {hostel.isPublished ? "Active" : hostel.pendingVerification ? "Verification" : "Draft"}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-900/80 hover:bg-white dark:bg-gray-900 backdrop-blur-md rounded-lg transition-all text-gray-900 dark:text-white shadow-sm border border-white/40">
                                                <MoreVertical size={16} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border border-gray-100 bg-white dark:bg-gray-900">
                                            <DropdownMenuItem asChild className="rounded-lg p-2.5 font-bold text-xs cursor-pointer hover:bg-gray-50 dark:bg-gray-950 flex items-center gap-3">
                                                <Link href={`/hostels/${hostel.id}`} target="_blank">
                                                    <ArrowUpRight size={14} className="text-blue-600" /> Preview Listing
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-lg p-2.5 font-bold text-xs cursor-pointer hover:bg-gray-50 dark:bg-gray-950 flex items-center gap-3">
                                                <Link href={`/owner/hostels/${hostel.id}/edit`}>
                                                    <Settings2 size={14} className="text-gray-500 dark:text-gray-400 dark:text-gray-500" /> Operational Config
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-1.5" />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(hostel.id, hostel.name)}
                                                className="rounded-lg p-2.5 font-bold text-xs cursor-pointer text-red-600 hover:bg-red-50 flex items-center gap-3"
                                            >
                                                <Trash2 size={14} /> Remove Listing
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="bg-white dark:bg-gray-900/95 backdrop-blur-md rounded-xl p-3 border border-white shadow-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <MapPin size={12} className="text-blue-600 shrink-0" />
                                            <span className="text-[10px] font-bold text-gray-900 dark:text-white truncate">{hostel.city}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Info Layer */}
                            <div className="p-6 flex-1 flex flex-col space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate group-hover:text-blue-600 transition-colors">
                                        {hostel.name}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">UID: {hostel.id.slice(-6).toUpperCase()}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 border border-gray-100 space-y-0.5">
                                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                                            <Users size={12} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Total Rooms</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{hostel._count.rooms}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 border border-gray-100 space-y-0.5">
                                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                                            <CalendarCheck size={12} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Bookings</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{hostel._count.bookings}</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/owner/hostels/${hostel.id}/rooms`}
                                    className="w-full h-11 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-xs hover:bg-blue-600 transition-all gap-2 shadow-sm active:scale-95 group/btn"
                                >
                                    <PlusCircle size={14} />
                                    Manage Inventory
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Support Disclaimer */}
            <div className="bg-blue-600 p-8 rounded-2xl text-white relative overflow-hidden group shadow-xl shadow-blue-500/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-gray-900/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-14 h-14 bg-white dark:bg-gray-900/10 border border-white/20 rounded-xl flex items-center justify-center">
                        <ShieldCheck size={28} className="text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h4 className="text-lg font-bold tracking-tight">Property Management Security</h4>
                        <p className="text-xs text-blue-50 font-medium leading-relaxed max-w-2xl">
                            All operational protocols are monitored. Property data is encrypted and synced with the HostelGH network in real-time. Contact our Enterprise Support for assistance with scale onboarding or compliance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
