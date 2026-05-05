"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { ListFilter } from "lucide-react";

export default function SortBar({ total }: { total: number }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSort = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", val);
        router.push(`/hostels?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 mb-8 border-b border-border gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                    <ListFilter size={18} />
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Results</p>
                    <p className="text-sm font-black text-foreground">
                        Found <span className="text-primary">{total}</span> Hostels
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap hidden md:block">Sort by:</span>
                <Select defaultValue={searchParams.get("sort") || "newest"} onValueChange={handleSort}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl border-border bg-card font-bold text-xs shadow-sm hover:border-primary transition-all outline-none text-foreground">
                        <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border shadow-xl p-1 bg-card text-foreground">
                        <SelectItem value="relevance" className="rounded-lg text-xs font-bold py-2.5 focus:bg-muted">Popularity</SelectItem>
                        <SelectItem value="rating" className="rounded-lg text-xs font-bold py-2.5 focus:bg-muted">Top Rated</SelectItem>
                        <SelectItem value="price_asc" className="rounded-lg text-xs font-bold py-2.5 focus:bg-muted">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc" className="rounded-lg text-xs font-bold py-2.5 focus:bg-muted">Price: High to Low</SelectItem>
                        <SelectItem value="newest" className="rounded-lg text-xs font-bold py-2.5 focus:bg-muted">Newest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
