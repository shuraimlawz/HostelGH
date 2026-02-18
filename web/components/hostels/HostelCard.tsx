"use client";

import Link from "next/link";
import { Heart, Star, MapPin, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HostelCard({ hostel }: { hostel: any }) {
    const minPrice = hostel.minPrice
        ? hostel.minPrice / 100
        : (hostel.rooms?.length
            ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100
            : null);

    return (
        <Link href={`/hostels/${hostel.id}`} className="group block cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100 mb-4 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                {hostel.images?.[0] ? (
                    <img
                        src={hostel.images[0]}
                        alt={hostel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                        <MapPin size={32} strokeWidth={1} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                    </div>
                )}

                {/* Glass Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    {hostel.isFeatured && (
                        <span className="bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 tracking-widest uppercase">
                            Recommended
                        </span>
                    )}
                </div>

                {/* Heart Button */}
                <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/40 transition-all z-20 active:scale-90">
                    <Heart size={18} className="fill-transparent stroke-white" />
                </button>

                {/* WhatsApp Quick Action */}
                {hostel.whatsappNumber && (
                    <a
                        href={`https://wa.me/233${hostel.whatsappNumber.replace(/^0/, '')}?text=Hi, I'm interested in ${hostel.name} on HostelGH.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-4 right-4 bg-green-500 text-white p-3 rounded-2xl shadow-xl hover:bg-green-400 hover:scale-110 transition-all z-20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
                    >
                        <MessageCircle size={20} className="fill-white/10" />
                    </a>
                )}
            </div>

            <div className="px-1">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-black text-lg text-gray-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                        {hostel.name}
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-yellow-50 text-yellow-700 font-bold text-xs shrink-0 self-center">
                        <Star size={12} className="fill-yellow-500 stroke-yellow-500" />
                        <span>4.9</span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">
                    <MapPin size={12} />
                    <span>{hostel.city}{hostel.region ? `, ${hostel.region}` : ""}</span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-xl text-blue-600">
                            {minPrice ? `₵${minPrice.toLocaleString()}` : "Price N/A"}
                        </span>
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">/ Term</span>
                    </div>

                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                        {hostel.distanceToCampus || "Near Campus"}
                    </p>
                </div>
            </div>
        </Link>
    );
}
