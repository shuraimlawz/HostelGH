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
        <div className="flex flex-col h-full bg-card">
            {/* Header */}
            <div className="mb-10 px-2 pt-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Zap size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Management</p>
                        <h2 className="text-sm font-black text-foreground tracking-tight">Proprietor Hub</h2>
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
                                    ? "bg-foreground text-background shadow-lg shadow-foreground/5"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-40" />
                            )}
                            <div className="flex items-center gap-3 relative z-10">
                                <link.icon size={18} className={cn(
                                    "transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                <span className="font-bold text-[13px] tracking-tight">{link.name}</span>
                                {link.href === "/owner/bookings" && counts?.bookings > 0 && (
                                    <span className="flex h-2 w-2 rounded-full bg-red-500" />
                                )}
                            </div>
                            {isActive && <ChevronRight size={14} className="text-blue-300 relative z-10" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-6">
                {/* PRO Card */}
                <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-[2rem] p-5 text-background relative overflow-hidden group/pro shadow-xl shadow-foreground/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover/pro:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-8 h-8 bg-background/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-background/20 mb-3">
                            <Zap size={16} className="text-primary" />
                        </div>
                        <h3 className="text-xs font-black mb-1 italic uppercase tracking-wider text-primary">Go Premium</h3>
                        <p className="text-[10px] text-background/60 font-medium leading-relaxed mb-4">
                            Unlock advanced analytics and featured listing status.
                        </p>
                        <Link href="/owner/subscription" className="inline-flex items-center gap-2 text-[10px] font-black text-white hover:text-blue-400 transition-colors">
                            VIEW PLANS <ChevronRight size={12} />
                        </Link>
                    </div>
                </div>

                {/* User Profile Chip */}
                <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between p-2 pl-3 bg-muted/50 rounded-2xl border border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-background text-xs font-black overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.firstName?.[0] || user?.email?.[0].toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black text-foreground truncate tracking-tight">{user?.firstName || "Proprietor"}</p>
                                <p className="text-[9px] font-bold text-muted-foreground truncate uppercase tracking-widest">Business Account</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
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
                    "md:hidden fixed top-0 left-0 bottom-0 w-72 bg-card border-r border-border p-6 z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-card border-r border-border h-screen sticky top-0 p-8">
                <SidebarContent />
            </aside>
        </>
    );
}
