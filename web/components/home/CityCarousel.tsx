"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "lucide-react";

export default function CityCarousel() {
    const { data: cities, isLoading } = useQuery({
        queryKey: ["city-stats"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/city-stats");
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="py-12">
                <div className="flex items-center gap-3 mb-8">
                    <Skeleton className="h-8 w-40 rounded-sm" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="aspect-[3/4] w-full rounded-sm" />
                    ))}
                </div>
            </div>
        );
    }

    if (!Array.isArray(cities) || cities.length === 0) return null;

    return (
        <div className="py-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-sm bg-primary/10 text-primary border border-primary/20">
                    <Map size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tighter text-foreground uppercase">
                        Hubs
                    </h3>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-0.5">Explore by location</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cities.map((city: any) => (
                    <Link key={city.name} href={`/hostels?city=${city.name}`}>
                        <div className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-muted cursor-pointer border border-border/50 shadow-sm hover:shadow-lg transition-all duration-500">
                            <img
                                src={city.image || `https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=400&fit=crop`}
                                alt={city.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="absolute bottom-4 left-4 right-4">
                                <h4 className="font-black text-white text-base md:text-lg tracking-tight mb-1 uppercase">{city.name}</h4>
                                <div className="text-white/60 text-[8px] font-black uppercase tracking-widest">
                                    {city.count} Properties
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
