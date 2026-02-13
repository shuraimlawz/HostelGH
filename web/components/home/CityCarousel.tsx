"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
                <h3 className="text-3xl font-bold mb-8 tracking-tight">Explore Top Cities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!Array.isArray(cities) || cities.length === 0) return null;

    return (
        <div className="py-12">
            <h3 className="text-3xl font-bold mb-8 tracking-tight">Explore Top Cities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {cities.map((city: any) => (
                    <Link key={city.name} href={`/hostels?city=${city.name}`}>
                        <Card className="group relative h-48 overflow-hidden rounded-2xl cursor-pointer border-none transition-transform hover:-translate-y-2">
                            <img
                                src={city.image}
                                alt={city.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="text-xl font-extrabold">{city.name}</p>
                                <p className="text-sm opacity-90">{city.count}</p>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
