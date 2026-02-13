"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus, Building2, MapPin, Users, MoreVertical, Edit2, Eye, Trash2, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function OwnerHostelsPage() {
    const { data: hostels, isLoading } = useQuery({
        queryKey: ["owner-hostels"],
        queryFn: async () => {
            const res = await api.get("/hostels/my-hostels");
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-3xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">My Hostels</h1>
                    <p className="text-gray-500">Manage and track all your hostel properties.</p>
                </div>
                <Link
                    href="/owner/hostels/new"
                    className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] shadow-md shadow-black/10"
                >
                    <Plus size={20} />
                    <span>Add New Hostel</span>
                </Link>
            </div>

            {hostels?.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-[2rem] p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <Building2 className="text-gray-400" size={32} />
                    </div>
                    <div className="max-w-xs mx-auto">
                        <h3 className="text-lg font-bold">No hostels found</h3>
                        <p className="text-gray-500 text-sm mt-1">Start by adding your first hostel property to start receiving bookings.</p>
                    </div>
                    <Link
                        href="/owner/hostels/new"
                        className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                    >
                        Create your first listing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-2xl font-bold">
                    {hostels?.map((hostel: any) => (
                        <div key={hostel.id} className="group bg-white rounded-[2rem] border overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col">
                            {/* Image Placeholder or Actual */}
                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                {hostel.images?.[0] ? (
                                    <img
                                        src={hostel.images[0]}
                                        alt={hostel.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Building2 size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
                                        hostel.isPublished ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                                    )}>
                                        {hostel.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold line-clamp-1">{hostel.name}</h3>
                                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                            <MapPin size={14} />
                                            <span>{hostel.city}, {hostel.addressLine}</span>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border">
                                            <DropdownMenuItem asChild className="rounded-lg">
                                                <Link href={`/hostels/${hostel.id}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                                                    <Eye size={16} />
                                                    <span>View Listing</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-lg">
                                                <Link href={`/owner/hostels/${hostel.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                                    <Edit2 size={16} />
                                                    <span>Edit Details</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <div className="h-px bg-gray-100 my-1" />
                                            <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600 rounded-lg cursor-pointer">
                                                <Trash2 size={16} />
                                                <span>Delete Hostel</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-2xl p-3">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Users size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Rooms</span>
                                        </div>
                                        <p className="font-bold">{hostel._count.rooms}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <CalendarCheck size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Bookings</span>
                                        </div>
                                        <p className="font-bold">{hostel._count.bookings}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

