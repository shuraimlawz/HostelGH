"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export default function HostelFilters() {
    const router = useRouter();
    const params = useSearchParams();

    const initialCity = params.get("city") ?? "";
    const [city, setCity] = useState(initialCity);

    const query = useMemo(() => {
        const p = new URLSearchParams(params.toString());
        if (city) p.set("city", city);
        else p.delete("city");
        return p.toString();
    }, [params, city]);

    return (
        <div className="rounded-3xl border bg-white p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Filters</h3>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="city-filter" className="text-sm font-bold">City</Label>
                    <Input
                        id="city-filter"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="rounded-xl h-11"
                        placeholder="e.g. Accra"
                    />
                </div>

                <Button
                    onClick={() => router.push(`/hostels${query ? `?${query}` : ""}`)}
                    className="w-full rounded-xl h-11 font-bold bg-black text-white hover:bg-black/90 transition-colors"
                >
                    Apply Filters
                </Button>
            </div>
        </div>
    );
}
