"use client";

import Link from "next/link";
import { Heart, Star, MapPin, Users, ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HostelCard({ hostel }: { hostel: any }) {
    const minPrice = hostel.minPrice
        ? hostel.minPrice / 100
        : (hostel.rooms?.length
            ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100
            : null);

    const hasAvailableRooms = hostel.rooms?.some((r: any) => r.availableSlots > 0) ?? false;

    return (
        <Link href={`/hostels/${hostel.id}`} className="group block h-full">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col h-full active:scale-[0.98]">
                {/* Media Section */}
                <div className="relative aspect-[16/11] overflow-hidden bg-gray-50">
                    {hostel.images?.[0] ? (
                        <img
                            src={hostel.images[0]}
                            alt={hostel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50 gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Visual Asset</span>
                        </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {hostel.isFeatured && (
                            <div className="h-6 px-2.5 flex items-center bg-blue-600/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg backdrop-blur-md shadow-sm border border-blue-500/50">
                                Premium
                            </div>
                        )}
                        {hasAvailableRooms && (
                            <div className="h-6 px-2.5 flex items-center bg-emerald-600/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg backdrop-blur-md shadow-sm border border-emerald-500/50">
                                Instant Stay
                            </div>
                        )}
                    </div>

                    {/* Interaction Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm border border-white/50 hover:bg-white transition-all z-10 text-gray-600 shadow-sm">
                        <Heart size={14} className="group-hover:text-red-500 transition-colors" />
                    </button>

                    {/* Verification Mark */}
                    {hostel.isVerifiedHostel && (
                        <div className="absolute bottom-3 right-3 w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/10 border border-emerald-400">
                            <ShieldCheck size={14} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                            <h3 className="font-bold text-gray-900 text-[15px] tracking-tight group-hover:text-blue-600 transition-colors leading-tight truncate">
                                {hostel.name}
                            </h3>
                            <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                <Star size={11} className="fill-blue-500 text-blue-500" />
                                <span className="text-[11px] font-bold text-gray-900">4.9</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest truncate">
                            <MapPin size={10} className="text-gray-300" />
                            <span>{hostel.city}</span>
                            <span className="text-gray-200 mx-0.5">•</span>
                            <span className="truncate">{hostel.distanceToCampus || "PRIME ZONE"}</span>
                        </div>
                    </div>

                    {/* Data Points */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Capacity</p>
                            <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <Users size={12} className="text-gray-400" /> {hostel._count?.rooms || "Multiple"} Units
                            </p>
                        </div>
                        <div className="space-y-0.5 text-right md:text-left">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Pricing</p>
                            <p className="text-xs font-bold text-gray-900">
                                {minPrice ? `₵${minPrice.toLocaleString()}` : "Contact for rate"}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-1 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Starts From</span>
                            <span className="text-sm font-bold text-gray-900 tracking-tight">₵{minPrice?.toLocaleString() || "---"} <span className="text-[10px] text-gray-400 font-medium">/ term</span></span>
                        </div>
                        <div className="h-9 px-4 rounded-xl bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:bg-blue-600 transition-all shadow-md shadow-gray-900/10">
                            Book Now <ArrowUpRight size={12} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
