import Link from "next/link";
import Image from "next/image";
import { Heart, Star, MapPin, Users, ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HostelCard({ hostel, compact = false }: { hostel: any, compact?: boolean }) {
    const minPrice = hostel.minPrice
        ? hostel.minPrice / 100
        : (hostel.rooms?.length
            ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100
            : null);

    const hasAvailableRooms = hostel.rooms?.some((r: any) => r.availableSlots > 0) ?? false;

    if (compact) {
        return (
            <Link href={`/hostels/${hostel.id}`} className="group block h-full">
                <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex items-center p-3 gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        {hostel.images?.[0] ? (
                            <Image 
                                src={hostel.images[0]} 
                                alt={hostel.name} 
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <MapPin size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                            {hostel.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate mt-0.5">
                            {hostel.city} {hostel.distanceToCampus ? `• ${hostel.distanceToCampus}` : ""}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-foreground">
                                ₵{minPrice?.toLocaleString() || "---"}
                                <span className="text-[8px] text-muted-foreground uppercase ml-1">/ Term</span>
                            </span>
                            <div className="flex items-center gap-1">
                                <Star size={10} className="text-primary fill-primary" />
                                <span className="text-[10px] font-bold text-foreground">{hostel.averageRating?.toFixed(1) || "0.0"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/hostels/${hostel.id}`} className="group block h-full">
            <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full active:scale-[0.98]">
                {/* Media Section */}
                <div className="relative aspect-[16/11] overflow-hidden bg-muted">
                    {hostel.images?.[0] ? (
                        <Image
                            src={hostel.images[0]}
                            alt={hostel.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest">No Visual Asset</span>
                        </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                        {hostel.isFeatured && (
                            <div className="h-6 px-2.5 flex items-center bg-blue-600/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg backdrop-blur-md shadow-sm border border-blue-500/50">
                                Premium
                            </div>
                        )}
                        {hasAvailableRooms ? (
                            (() => {
                                const totalAvailable = hostel.rooms?.reduce((acc: number, r: any) => acc + (r.availableSlots || 0), 0) || 0;
                                if (totalAvailable < 5 && totalAvailable > 0) {
                                    return (
                                        <div className="h-6 px-2.5 flex items-center bg-orange-600/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg backdrop-blur-md shadow-sm border border-orange-500/50 animate-pulse">
                                            High Demand: {totalAvailable} Left
                                        </div>
                                    );
                                }
                                return (
                                    <div className="h-6 px-2.5 flex items-center bg-emerald-600/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg backdrop-blur-md shadow-sm border border-emerald-500/50">
                                        Instant Stay
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="h-6 px-2.5 flex items-center bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg backdrop-blur-md shadow-sm border border-red-500/50">
                                Fully Booked
                            </div>
                        )}
                    </div>

                    {/* Interaction Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-card transition-all z-10 text-foreground shadow-sm">
                        <Heart size={14} className="group-hover:text-destructive transition-colors" />
                    </button>

                    {/* Verification Mark */}
                    {hostel.isVerifiedHostel && (
                        <div className="absolute bottom-3 right-3 w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/10 border border-emerald-400 z-10">
                            <ShieldCheck size={14} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                            <h3 className="font-bold text-foreground text-[15px] tracking-tight group-hover:text-primary transition-colors leading-tight truncate">
                                {hostel.name}
                            </h3>
                            <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 bg-muted rounded-md border border-border">
                                <Star size={11} className={cn("text-primary", hostel.averageRating > 0 && "fill-primary")} />
                                <span className="text-[11px] font-bold text-foreground">
                                    {hostel.averageRating?.toFixed(1) || "0.0"}
                                </span>
                                {hostel.totalReviews > 0 && (
                                    <span className="text-[9px] text-muted-foreground font-medium ml-0.5">
                                        ({hostel.totalReviews})
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest truncate">
                            <MapPin size={10} className="text-muted-foreground/60" />
                            <span>{hostel.city}</span>
                            <span className="text-muted-foreground/40 mx-0.5">•</span>
                            <span className="truncate">{hostel.distanceToCampus || "PRIME ZONE"}</span>
                        </div>
                    </div>

                    {/* Data Points */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Capacity</p>
                            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Users size={12} className="text-muted-foreground" /> {hostel._count?.rooms || "Multiple"} Units
                            </p>
                        </div>
                        <div className="space-y-0.5 text-right md:text-left">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Pricing</p>
                            <p className="text-xs font-bold text-foreground">
                                {minPrice ? `₵${minPrice.toLocaleString()}` : "Contact for rate"}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-1 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Starts From</span>
                            <span className="text-sm font-black text-foreground tracking-tight">₵{minPrice?.toLocaleString() || "---"} <span className="text-[10px] text-muted-foreground font-medium">/ term</span></span>
                        </div>
                        <div className="h-9 px-4 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all shadow-md">
                            Book Now <ArrowUpRight size={12} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

