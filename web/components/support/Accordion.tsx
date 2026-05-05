"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Accordion({ items }: { items: { q: string; a: string }[] }) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div className="space-y-3">
            {items.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                    <div
                        key={idx}
                        className={cn(
                            "rounded-2xl border-2 transition-all duration-300",
                            isExpanded
                                ? "border-primary/40 bg-primary/5 shadow-sm"
                                : "border-border bg-card hover:border-border/80"
                        )}
                    >
                        <button
                            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left"
                        >
                            <span className={cn(
                                "text-base font-bold pr-4 leading-snug transition-colors",
                                isExpanded ? "text-primary" : "text-foreground"
                            )}>
                                {item.q}
                            </span>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                                isExpanded
                                    ? "bg-primary text-primary-foreground rotate-180"
                                    : "bg-muted text-muted-foreground"
                            )}>
                                <ChevronDown size={18} />
                            </div>
                        </button>
                        <div className={cn(
                            "grid transition-all duration-300 ease-in-out",
                            isExpanded ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                        )}>
                            <div className="overflow-hidden px-6">
                                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border pt-4">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
