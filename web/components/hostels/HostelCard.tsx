"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HostelCard({ hostel }: { hostel: any }) {
    const minPrice = hostel.minPrice
        ? hostel.minPrice / 100
        : (hostel.rooms?.length
            ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100
            : null);

    return (
        <Link href={`/hostels/${hostel.id}`} className="group block cursor-pointer">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 mb-3">
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

                {/* Guest Favorite Badge - Only if rating > 4.8 or featured */}
                {hostel.isFeatured && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                        Guest favorite
                    </div>
                )}

                {/* Heart Button */}
                <button className="absolute top-3 right-3 text-white/70 hover:scale-110 transition-transform">
                    <Heart size={24} className="fill-black/50 stroke-white" />
                </button>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-[15px] leading-5 text-gray-900 truncate pr-2">
                        {hostel.name}
                    </h3>
                    <p className="text-gray-500 text-[15px] leading-5">
                        {hostel.region ? `${hostel.city}, ${hostel.region}` : hostel.city}
                    </p>
                    <p className="text-gray-500 text-[15px] leading-5">
                        {hostel.distanceToCampus ? `${hostel.distanceToCampus} to campus` : "Near campus"}
                    </p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-semibold text-black text-[15px]">
                            {minPrice ? `₵${minPrice.toLocaleString()}` : "Price N/A"}
                        </span>
                        <span className="text-gray-900 text-[15px]"> per term</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-[15px]">
                    <Star size={14} className="fill-black text-black" />
                    <span>4.9</span>
                </div>
            </div>
        </Link>
    );
}
