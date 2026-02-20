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
            <div className="py-20">
                <div className="flex items-center gap-3 mb-10">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="aspect-[4/5] w-full rounded-[2rem]" />
                    ))}
                </div>
            </div>
        );
    }

    if (!Array.isArray(cities) || cities.length === 0) return null;

    return (
        <div className="py-20">
            <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                    <Map size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground leading-none">Popular <span className="text-primary">Cities</span></h3>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Explore by local hubs</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {cities.map((city: any) => (
                    <Link key={city.name} href={`/hostels?city=${city.name}`}>
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500">
                            <img
                                src={city.image || `https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=400&fit=crop`}
                                alt={city.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            />

                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute bottom-6 left-6 right-6">
                                <h4 className="font-black text-white text-xl tracking-tight mb-1">{city.name}</h4>
                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                    {city.count} Properties
                                </div>
                            </div>

                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/40 rounded-[2.5rem] transition-all duration-500" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
