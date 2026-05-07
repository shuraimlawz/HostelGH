"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    LayoutDashboard,
    Users,
    Building2,
    CalendarCheck,
    Settings,
    ShieldCheck,
    ChevronRight,
    BarChart3,
    AlertCircle,
    Activity,
    Trash2,
    CheckCircle2,
    Menu,
    X,
    CreditCard,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Support Tickets", href: "/admin/support", icon: MessageSquare },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Hostels", href: "/admin/hostels", icon: Building2 },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Statistics", href: "/admin/stats", icon: BarChart3 },
    { name: "Activity Logs", href: "/admin/logs", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

const deletionLink = { name: "Delete Requests", href: "/admin/deletions", icon: Trash2 };

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose = () => { } }: AdminSidebarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: alerts } = useQuery({
        queryKey: ["admin-alerts"],
        queryFn: async () => {
            const res = await api.get("/admin/alerts");
            return res.data;
        },
        retry: false,
        refetchInterval: 30000
    });

    const { data: counts } = useQuery({
        queryKey: ["admin-notifications-counts"],
        queryFn: async () => {
            const res = await api.get("/admin/notifications/counts");
            return res.data;
        },
        refetchInterval: 30000
    });

    const alertsList = Array.isArray(alerts) ? alerts : (alerts?.data || []);
    const hasCriticalAlerts = alertsList.length > 0;
    const activeAlert = hasCriticalAlerts ? alertsList[0] : null;

    const SidebarContent = () => (
        <>
            <div className="mb-8 px-2">
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="text-blue-500" size={16} />
                    <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Admin Dashboard</h2>
                </div>
                <p className="text-sm text-gray-500">Manage HostelGH Platform</p>
            </div>

            <nav className="space-y-1">
                {adminLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                                isActive
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <link.icon size={20} className={cn(isActive ? "text-white" : "text-gray-500 group-hover:text-blue-400")} />
                                <span className="font-bold text-sm tracking-tight">{link.name}</span>
                                {link.href === "/admin/hostels" && counts?.hostels > 0 && (
                                    <span className="flex h-2 w-2 rounded-full bg-red-500" />
                                )}

                            </div>
                            {isActive && <ChevronRight size={14} className="text-white/60" />}
                        </Link>
                    );
                })}

                <div className="pt-4 mt-4 border-t border-gray-800">
                    <Link
                        href={deletionLink.href}
                        onClick={onClose}
                        className={cn(
                            "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                            pathname === deletionLink.href
                                ? "bg-red-600 text-white shadow-xl shadow-red-900/40"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <deletionLink.icon size={20} className={cn(pathname === deletionLink.href ? "text-white" : "text-gray-500 group-hover:text-red-400")} />
                            <span className="font-bold text-sm tracking-tight">{deletionLink.name}</span>
                        </div>
                        {pathname === deletionLink.href && <ChevronRight size={14} className="text-white/60" />}
                    </Link>
                </div>
            </nav>

            <div className="mt-auto pt-10 px-2">
                {hasCriticalAlerts ? (
                    <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6 relative overflow-hidden group hover:bg-red-950/30 transition-colors cursor-help">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle size={14} className="text-red-500 animate-pulse" />
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Action Required</p>
                            </div>
                            <h3 className="font-bold text-xs text-gray-200 mb-1 leading-tight">{activeAlert?.message || "System Alert"}</h3>
                            <p className="text-[10px] text-gray-400">Please review immediately</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-6 relative overflow-hidden group hover:bg-emerald-950/30 transition-colors">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Healthy</p>
                            </div>
                            <h3 className="font-bold text-xs text-gray-200 mb-1 leading-tight">All systems operational</h3>
                            <p className="text-[10px] text-gray-400">No security threats detected</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={cn(
                    "lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-gray-950 border-r border-gray-800 p-6 gap-2 text-gray-300 z-50 flex flex-col transition-transform duration-300",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-gray-950 border-r border-gray-800 min-h-[calc(100vh-80px)] p-6 gap-2 text-gray-300">
                <SidebarContent />
            </aside>
        </>
    );
}
