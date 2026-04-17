"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    LayoutDashboard,
    Home,
    CalendarCheck,
    Settings,
    PlusCircle,
    ChevronRight,
    CreditCard,
    X,
    LogOut,
    Zap,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const links = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "My Hostels", href: "/owner/hostels", icon: Home },
    { name: "Bookings", href: "/owner/bookings", icon: CalendarCheck },
    { name: "Add Hostel", href: "/owner/hostels/new", icon: PlusCircle },
    { name: "Payouts", href: "/owner/payouts", icon: CreditCard },
    // { name: "Subscription", href: "/owner/subscription", icon: Zap },
    { name: "Settings", href: "/owner/account", icon: Settings },
];

interface OwnerSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function OwnerSidebar({ isOpen = false, onClose = () => { } }: OwnerSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const { data: counts } = useQuery({
        queryKey: ["owner-notifications-counts"],
        queryFn: async () => {
            const res = await api.get("/hostels/owner/counts");
            return res.data;
        },
        enabled: !!user,
        refetchInterval: 30000
    });

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white text-gray-900 px-6 py-8">
            {/* Header / Logo Section */}
            <div className="mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Zap size={20} className="fill-current" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">Proprietor</p>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-none uppercase">
                            {(() => {
                                if (!user) return "Proprietor";
                                const prefix = user.gender === "MALE" ? "Mr." : (user.gender === "FEMALE" ? "Mrs." : "");
                                const name = user.lastName || user.firstName || "Proprietor";
                                return `${prefix} ${name}`.trim();
                            })()}
                            <span className="text-blue-600">.</span>
                        </h2>
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
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <div className="flex items-center gap-3.5">
                                <link.icon size={18} className={cn(
                                    "transition-colors",
                                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                )} />
                                <span className={cn(
                                    "text-sm font-semibold tracking-tight transition-transform duration-200",
                                    isActive ? "translate-x-0.5" : "group-hover:translate-x-0.5"
                                )}>{link.name}</span>
                                {link.href === "/owner/bookings" && (counts?.bookings > 0 || counts?.notStartedBookings > 0) && (
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                )}
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-6">
                {/* Launch Mode Badge */}
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-100 relative overflow-hidden group/pro">
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200 shadow-sm">
                            <Zap size={18} className="text-emerald-600 fill-emerald-600" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-gray-900">Beta Launch Partner</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                You have 100% platform access. All listing & feature fees are waived.
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Profile Chip */}
                <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between p-2 pl-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold border border-blue-200 uppercase">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.firstName?.[0] || user?.email?.[0].toUpperCase() || "P"
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate leading-none mb-1">
                                    {(() => {
                                        if (!user) return "Proprietor";
                                        const prefix = user.gender === "MALE" ? "Mr." : (user.gender === "FEMALE" ? "Mrs." : "");
                                        const name = user.lastName || user.firstName || "Proprietor";
                                        return `${prefix} ${name}`.trim();
                                    })()}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate font-medium">Verified Property Manager</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-all"
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
                    "md:hidden fixed top-0 left-0 bottom-0 w-64 bg-white border-r z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
                <SidebarContent />
            </aside>
        </>
    );
}
