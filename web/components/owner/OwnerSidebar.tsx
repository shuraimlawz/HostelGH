"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Home,
    CalendarCheck,
    Settings,
    PlusCircle,
    ChevronRight,
    CreditCard,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const links = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "My Hostels", href: "/owner/hostels", icon: Home },
    { name: "Bookings", href: "/owner/bookings", icon: CalendarCheck },
    { name: "Add Hostel", href: "/owner/hostels/new", icon: PlusCircle },
    { name: "Payouts", href: "/owner/payouts", icon: CreditCard },
    { name: "Subscription", href: "/owner/subscription", icon: PlusCircle },
    { name: "Settings", href: "/owner/account", icon: Settings },
];

interface OwnerSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function OwnerSidebar({ isOpen = false, onClose = () => { } }: OwnerSidebarProps) {
    const pathname = usePathname();

    const SidebarContent = () => (
        <>
            <div className="mb-6 px-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Management</h2>
            </div>
            <nav className="space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
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
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-left overflow-hidden relative shadow-lg shadow-blue-200">
                    <div className="relative z-10">
                        <p className="text-xs font-medium text-blue-100 mb-1">New Feature</p>
                        <h3 className="font-bold text-sm mb-3">Instant Booking is here!</h3>
                        <button className="bg-white text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                            LEARN MORE
                        </button>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={cn(
                    "md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white border-r p-6 gap-2 z-50 flex flex-col transition-transform duration-300",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r min-h-[calc(100vh-80px)] p-6 gap-2">
                <SidebarContent />
            </aside>
        </>
    );
}
