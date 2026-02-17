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
            <h3 className="text-2xl font-bold mb-6 tracking-tight text-gray-900">Explore Top Cities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cities.map((city: any) => (
                    <Link key={city.name} href={`/hostels?city=${city.name}`}>
                        <div className="group cursor-pointer">
                            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 mb-3">
                                <img
                                    src={city.image}
                                    alt={city.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <h4 className="font-semibold text-gray-900">{city.name}</h4>
                            <p className="text-sm text-gray-500">{city.count}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
