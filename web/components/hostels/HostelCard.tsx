"use client";

import Link from "next/link";
import { Hostel } from "@/types";
import { MapPin, School, Wifi, Wind, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const AMENITY_ICONS: Record<string, any> = {
    "WiFi": Wifi,
    "AC": Wind,
    "Security": ShieldCheck,
};

export default function HostelCard({ hostel }: { hostel: Hostel }) {
    const minPrice = hostel.rooms?.length
        ? Math.min(...hostel.rooms.map(r => r.pricePerTerm)) / 100
        : null;

    return (
        <Link href={`/hostels/${hostel.id}`} className="group block h-full">
            <div className="rounded-[2.5rem] border bg-white overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 h-full flex flex-col">
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {hostel.images?.[0] ? (
                        <img
                            src={hostel.images[0]}
                            alt={hostel.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Star size={48} className="animate-pulse" />
                        </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {hostel.university && (
                            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                <School size={12} className="text-blue-600" />
                                {hostel.university}
                            </span>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl flex gap-1.5">
                            {hostel.amenities?.slice(0, 3).map((a) => {
                                const Icon = AMENITY_ICONS[a];
                                if (!Icon) return null;
                                return <Icon key={a} size={14} className="text-white" />;
                            })}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                            {hostel.name}
                        </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                        <MapPin size={14} className="text-red-400" />
                        <span className="font-medium">{hostel.city}, {hostel.addressLine}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Starting from</p>
                            <p className="text-2xl font-black text-black">
                                {minPrice ? `₵${minPrice.toLocaleString()}` : "Price N/A"}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

import { ArrowUpRight } from "lucide-react";
