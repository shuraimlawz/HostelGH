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

    const hasAvailableRooms = hostel.rooms?.some((r: any) => r.availableSlots > 0) ?? false;

    return (
        <Link href={`/hostels/${hostel.id}`} className="group block cursor-pointer space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                {hostel.images?.[0] ? (
                    <img
                        src={hostel.images[0]}
                        alt={hostel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}

                {/* Heart Button */}
                <button className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors z-10">
                    <Heart size={24} className="stroke-white stroke-[2px] fill-black/20" />
                </button>

                {/* Guest Favorite / Featured Badge (Airbnb style top left) */}
                {hostel.isFeatured && (
                    <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-border">
                        <span className="text-xs font-semibold text-foreground">Guest favorite</span>
                    </div>
                )}
                
                {/* Availability Badge */}
                {hasAvailableRooms && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-border">
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Rooms available</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-foreground truncate pr-4 text-[15px]">
                        {hostel.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm">
                        <Star size={12} className="fill-foreground stroke-foreground" />
                        <span>4.9</span>
                    </div>
                </div>

                <div className="text-[15px] text-muted-foreground leading-snug">
                    <p className="truncate">{hostel.distanceToCampus || "Near Campus"}</p>
                    <p className="truncate">{hostel.city}, {hostel.region}</p>
                </div>

                <div className="flex items-baseline gap-1 mt-1.5">
                    {minPrice ? (
                        <>
                            <span className="font-semibold text-foreground text-[15px]">From ₵{minPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground font-normal text-[15px]">per term</span>
                        </>
                    ) : (
                        <span className="font-semibold text-foreground text-[15px]">Price Unavailable</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
