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
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const links = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "My Hostels", href: "/owner/hostels", icon: Home },
    { name: "Bookings", href: "/owner/bookings", icon: CalendarCheck },
    { name: "Add Hostel", href: "/owner/hostels/new", icon: PlusCircle },
    { name: "Payouts", href: "/owner/payouts", icon: CreditCard },
    { name: "Subscription", href: "/owner/subscription", icon: Zap },
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
        <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
            {/* Header */}
            <div className="mb-10 px-2 pt-2 text-center">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-background shadow-lg shadow-primary/20">
                        <Zap size={16} className="fill-current" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">Network</p>
                        <h2 className="text-sm font-black text-white tracking-tight uppercase italic">Proprietor <span className="text-primary NOT-italic">.</span></h2>
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
                                    ? "bg-white text-black shadow-2xl shadow-white/5"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <link.icon size={18} className={cn(
                                    "transition-colors",
                                    isActive ? "text-primary px-0.5" : "text-muted-foreground group-hover:text-white"
                                )} />
                                <span className={cn(
                                    "font-black text-[10px] uppercase tracking-[0.15em] transition-transform duration-300",
                                    isActive ? "translate-x-1" : "group-hover:translate-x-1"
                                )}>{link.name}</span>
                                {link.href === "/owner/bookings" && (counts?.bookings > 0 || counts?.notStartedBookings > 0) && (
                                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                                )}
                            </div>
                            {isActive && <ChevronRight size={14} className="relative z-10 text-primary" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-6">
                {/* PRO Card - Futuristic */}
                <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-[2rem] p-6 border border-primary/20 relative overflow-hidden group/pro">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover/pro:scale-125 transition-transform duration-700" />
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 mb-4 shadow-xl">
                            <Zap size={18} className="text-primary fill-primary" />
                        </div>
                        <h3 className="text-[11px] font-black mb-1 uppercase tracking-widest text-white">Scale Portfolio</h3>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase leading-relaxed mb-4">
                            Unlock high-tier analytics and market exposure.
                        </p>
                        <Link href="/owner/subscription" className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest group/link">
                            UPGRADE NOW <ChevronRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* User Profile Chip */}
                <div className="pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between p-2 pl-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center text-[11px] font-black overflow-hidden border border-primary/20 uppercase shadow-inner">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.firstName?.[0] || user?.email?.[0].toUpperCase() || "P"
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black text-white truncate tracking-tight uppercase leading-none mb-1">{user?.firstName || "Proprietor"}</p>
                                <p className="text-[9px] font-bold text-primary/60 truncate uppercase tracking-widest leading-none">Verified Partner</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-3 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-xl transition-all"
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
                    "md:hidden fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border p-4 z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 p-6">
                <SidebarContent />
            </aside>
        </>
    );
}
