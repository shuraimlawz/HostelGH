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
        <Link href={`/hostels/${hostel.id}`} className="group block cursor-pointer">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted border border-border shadow-sm transition-all duration-300 group-hover:border-foreground/20 group-hover:shadow-md">
                {hostel.images?.[0] ? (
                    <img
                        src={hostel.images[0]}
                        alt={hostel.name}
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                        <span className="text-[10px] font-black uppercase tracking-widest italic">No Visual</span>
                    </div>
                )}

                {/* Heart Button - Sharp */}
                <button className="absolute top-2 right-2 p-1.5 rounded-sm bg-background/80 backdrop-blur-md border border-border hover:bg-background transition-all z-10">
                    <Heart size={14} className="text-foreground fill-none stroke-[2.5px]" />
                </button>

                {/* Minimal Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {hostel.isFeatured && (
                        <div className="bg-foreground text-background text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest backdrop-blur-sm shadow-sm border border-foreground/10">
                            Featured
                        </div>
                    )}
                    {hasAvailableRooms && (
                        <div className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest backdrop-blur-sm shadow-sm border border-emerald-400">
                            Available
                        </div>
                    )}
                </div>

                {/* Verified - Sharp */}
                {hostel.isVerifiedHostel && (
                    <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm text-primary p-1 rounded-sm shadow-sm border border-primary/30">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="mt-2.5 space-y-1 px-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-foreground truncate text-[13px] uppercase tracking-tight italic">
                        {hostel.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-black bg-muted px-1.5 py-0.5 rounded-sm border border-border/50">
                        <Star size={10} className="fill-primary stroke-primary" />
                        <span>4.9</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    <span className="truncate">{hostel.distanceToCampus || "PRIME ZONE"}</span>
                    <span className="text-[8px] opacity-30">•</span>
                    <span className="truncate">{hostel.city}</span>
                </div>

                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-border">
                    {minPrice ? (
                        <div className="flex items-baseline gap-1">
                            <span className="font-black text-foreground text-[14px] tracking-tighter italic">₵{minPrice.toLocaleString()}</span>
                            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">/ term</span>
                        </div>
                    ) : (
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Pricing Pending</span>
                    )}
                    <div className="text-[9px] font-black text-primary uppercase tracking-[0.2em] group-hover:underline transition-all">
                        DEPLOY →
                    </div>
                </div>
            </div>
        </Link>
    );
}
