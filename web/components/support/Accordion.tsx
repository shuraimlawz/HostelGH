"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
    items: {
        q: string;
        a: string;
    }[];
}

export default function Accordion({ items }: AccordionProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            {items.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                    <div
                        key={idx}
                        className={cn(
                            "rounded-2xl border transition-all duration-300",
                            isExpanded
                                ? "border-blue-500 bg-blue-50/20"
                                : "border-gray-100 bg-white hover:border-gray-200"
                        )}
                    >
                        <button
                            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left"
                        >
                            <span className="text-base font-bold text-gray-900 pr-4">{item.q}</span>
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                                    isExpanded ? "bg-blue-600 text-white rotate-180" : "bg-gray-50 text-gray-400"
                                )}
                            >
                                <ChevronDown size={18} />
                            </div>
                        </button>
                        <div
                            className={cn(
                                "grid transition-all duration-300 ease-in-out",
                                isExpanded ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                            )}
                        >
                            <div className="overflow-hidden px-6">
                                <div className="text-gray-600 text-base leading-relaxed whitespace-pre-line border-t border-blue-100/50 pt-4">
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
