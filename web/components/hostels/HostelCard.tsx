"use client";

import Link from "next/link";
import { Hostel } from "@/types";

// Hostel interface is now imported from @/types

export default function HostelCard({ hostel }: { hostel: Hostel }) {
    return (
        <Link href={`/hostels/${hostel.id}`} className="group">
            <div className="rounded-3xl border bg-white overflow-hidden hover:shadow-sm transition">
                <div className="h-44 bg-gray-100" />
                <div className="p-4">
                    <div className="font-bold group-hover:underline text-lg">{hostel.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                        {hostel.city}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 line-clamp-1">{hostel.addressLine}</div>
                </div>
            </div>
        </Link>
    );
}
