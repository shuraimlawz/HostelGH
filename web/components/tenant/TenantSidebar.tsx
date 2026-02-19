"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    CalendarCheck,
    Settings,
    CreditCard,
    ChevronRight,
    Shield,
    X,
    LogOut,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const links = [
    { name: "My Profile", href: "/account", icon: User },
    { name: "My Bookings", href: "/bookings", icon: CalendarCheck },
    { name: "Payments", href: "/account/payments", icon: CreditCard },
    { name: "Settings", href: "/account/settings", icon: Settings },
];

interface TenantSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function TenantSidebar({ isOpen = false, onClose = () => { } }: TenantSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="mb-10 px-2 pt-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Shield size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Portal</p>
                        <h2 className="text-sm font-black text-gray-900 tracking-tight">Student Hub</h2>
                    </div>
                </div>
            </div>

            {/* Main Nav */}
            <nav className="space-y-1.5 flex-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-50" />
                            )}
                            <div className="flex items-center gap-3 relative z-10">
                                <link.icon size={18} className={cn(
                                    "transition-colors",
                                    isActive ? "text-blue-400" : "text-gray-400 group-hover:text-gray-900"
                                )} />
                                <span className="font-bold text-[13px] tracking-tight">{link.name}</span>
                            </div>
                            {isActive && <ChevronRight size={14} className="text-blue-400 relative z-10" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-6">
                {/* Help Card */}
                <div className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 relative overflow-hidden group/help">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12 group-hover/help:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-gray-200 mb-3 shadow-sm">
                            <HelpCircle size={16} className="text-blue-600" />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 mb-1">Need assistance?</h3>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed mb-3">
                            Our support team is available 24/7 for you.
                        </p>
                        <Link href="/support" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                            Open Support Center
                        </Link>
                    </div>
                </div>

                {/* User Profile Chip */}
                <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between p-2 pl-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-950 rounded-xl flex items-center justify-center text-white text-xs font-black">
                                {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black text-gray-900 truncate tracking-tight">{user?.firstName || "Student"}</p>
                                <p className="text-[9px] font-bold text-gray-400 truncate uppercase tracking-widest">Verified Account</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={cn(
                    "md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white border-r p-6 z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r h-screen sticky top-0 p-8">
                <SidebarContent />
            </aside>
        </>
    );
}
