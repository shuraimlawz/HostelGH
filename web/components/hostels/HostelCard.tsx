"use client";

import Link from "next/link";
import { Heart, Star, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HostelCard({ hostel }: { hostel: any }) {
    const minPrice = hostel.minPrice
        ? hostel.minPrice / 100
        : (hostel.rooms?.length
            ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100
            : null);

    return (
        <Link href={`/hostels/${hostel.id}`} className="group block cursor-pointer">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-200 mb-2">
                {hostel.images?.[0] ? (
                    <img
                        src={hostel.images[0]}
                        alt={hostel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-xs">No Image</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {hostel.isFeatured && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                            RECOMMENDED
                        </span>
                    )}
                </div>

                {/* Heart Button */}
                <button className="absolute top-2 right-2 text-white/70 hover:scale-110 transition-transform z-20">
                    <Heart size={20} className="fill-black/50 stroke-white" />
                </button>

                {/* WhatsApp Button */}
                {hostel.whatsappNumber && (
                    <a
                        href={`https://wa.me/233${hostel.whatsappNumber.replace(/^0/, '')}?text=Hi, I'm interested in ${hostel.name} on HostelGH.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-2 right-2 bg-[#25D366] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-20"
                    >
                        <MessageCircle size={18} />
                    </a>
                )}
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-sm text-gray-900 truncate pr-2 group-hover:text-[#1877F2] transition-colors">
                        {hostel.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                        {hostel.region ? `${hostel.city}, ${hostel.region}` : hostel.city}
                    </p>
                    <p className="text-gray-500 text-xs">
                        {hostel.distanceToCampus ? `${hostel.distanceToCampus} to campus` : "Near campus"}
                    </p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-bold text-gray-900 text-sm">
                            {minPrice ? `₵${minPrice.toLocaleString()}` : "Price N/A"}
                        </span>
                        <span className="text-gray-500 text-xs"> / term</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">
                    <Star size={12} className="fill-orange-400 text-orange-400" />
                    <span>4.9</span>
                </div>
            </div>
        </Link>
    );
}
