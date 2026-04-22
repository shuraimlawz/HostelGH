"use client";

import Link from "next/link";
import HostelCard from "@/components/hostels/HostelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HostelSectionProps {
    title: string;
    subtitle?: string;
    badge?: string;
    badgeClassName?: string;
    icon?: React.ReactNode;
    hostels: any[];
    isLoading?: boolean;
    viewAllHref?: string;
    emptyMessage?: string;
    cardBadge?: (hostel: any) => React.ReactNode;
}

export default function HostelSection({
    title,
    subtitle,
    badge,
    badgeClassName = "bg-blue-600 text-white",
    icon,
    hostels,
    isLoading = false,
    viewAllHref,
    emptyMessage = "No hostels found right now.",
    cardBadge,
}: HostelSectionProps) {
    if (!isLoading && hostels.length === 0) return null;

    return (
        <div className="py-12 border-t border-gray-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div className="space-y-2">
                    {badge && (
                        <div className="flex items-center gap-2">
                            {icon && <span className="text-base">{icon}</span>}
                            <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-transparent shadow-sm", badgeClassName)}>
                                {badge}
                            </span>
                        </div>
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tighter text-gray-900 uppercase leading-tight">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-gray-400 font-medium text-xs uppercase tracking-widest max-w-xl">
                            {subtitle}
                        </p>
                    )}
                </div>

                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="group inline-flex items-center gap-2 h-10 px-5 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-700 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                        View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                )}
            </div>

            {/* Grid / Skeleton */}
            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-[16/11] w-full rounded-2xl" />
                            <Skeleton className="h-5 w-3/4 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : hostels.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
                    {hostels.map((hostel: any) => (
                        <div key={hostel.id} className="relative">
                            {cardBadge && (
                                <div className="absolute top-3 left-3 z-20">
                                    {cardBadge(hostel)}
                                </div>
                            )}
                            <HostelCard hostel={hostel} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm">
                    <Building2 size={32} className="mb-3 text-gray-200" />
                    {emptyMessage}
                </div>
            )}
        </div>
    );
}
