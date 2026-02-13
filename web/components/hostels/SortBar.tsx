"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SortBar({ total }: { total: number }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSort = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", val);
        router.push(`/hostels?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 mb-6 border-b gap-4">
            <div>
                <p className="text-muted-foreground text-sm font-medium">
                    Showing <span className="text-foreground font-bold">{total}</span> results
                </p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
                <Select defaultValue="newest" onValueChange={handleSort}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="newest">Newest first</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
