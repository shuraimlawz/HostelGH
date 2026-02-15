"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    CalendarCheck,
    Settings,
    CreditCard,
    ChevronRight,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { name: "My Profile", href: "/account", icon: User },
    { name: "My Bookings", href: "/bookings", icon: CalendarCheck },
    { name: "Payments", href: "/account/payments", icon: CreditCard },
    { name: "Settings", href: "/account/settings", icon: Settings },
];

export default function TenantSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-72 bg-white border-r min-h-[calc(100vh-80px)] p-6 gap-2">
            <div className="mb-6 px-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Dashboard</h2>
            </div>
            <nav className="space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                                isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <link.icon size={20} className={cn(isActive ? "text-blue-600" : "text-gray-400 group-hover:text-black")} />
                                <span className="font-semibold text-sm">{link.name}</span>
                            </div>
                            {isActive && <ChevronRight size={16} className="text-blue-600" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-10 px-2 text-center">
                <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="text-green-600" size={16} />
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Verified Student</p>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">
                        Your account is verified and secure. You can book hostels instantly.
                    </p>
                </div>
            </div>
        </aside>
    );
}
