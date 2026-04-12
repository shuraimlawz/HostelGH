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
            <div className="mb-8 px-2 pt-0">
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-sm border border-primary/10">
                    <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center text-background">
                        <Zap size={14} className="fill-current" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5">HUB</p>
                        <h2 className="text-xs font-black text-foreground tracking-tight uppercase">Proprietor</h2>
                    </div>
                </div>
            </div>

            {/* Main Nav */}
            <nav className="space-y-1 flex-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-sm transition-all duration-200 group relative",
                                isActive
                                    ? "bg-foreground text-background shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <link.icon size={16} className={cn(
                                    "transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                <span className="font-black text-[11px] uppercase tracking-wider">{link.name}</span>
                                {link.href === "/owner/bookings" && counts?.bookings > 0 && (
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                )}
                            </div>
                            {isActive && <ChevronRight size={12} className="relative z-10" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-4">
                {/* PRO Card - Slimmer */}
                <div className="bg-muted/50 rounded-sm p-4 border border-border relative overflow-hidden group/pro">
                    <div className="relative z-10">
                        <div className="w-6 h-6 bg-primary/10 rounded-sm flex items-center justify-center border border-primary/20 mb-2">
                            <Zap size={12} className="text-primary fill-primary" />
                        </div>
                        <h3 className="text-[10px] font-black mb-1 uppercase tracking-widest text-foreground">Pro Tier</h3>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase leading-relaxed mb-3">
                            Advanced analytics & exposure.
                        </p>
                        <Link href="/owner/subscription" className="inline-flex items-center gap-1 text-[9px] font-black text-primary hover:underline transition-colors uppercase tracking-widest">
                            UPGRADE <ChevronRight size={10} />
                        </Link>
                    </div>
                </div>

                {/* User Profile Chip */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between p-1.5 bg-muted/50 rounded-sm border border-border">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-foreground text-background rounded-sm flex items-center justify-center text-[10px] font-black overflow-hidden uppercase">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.firstName?.[0] || user?.email?.[0].toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-foreground truncate tracking-tight uppercase">{user?.firstName || "Member"}</p>
                                <p className="text-[8px] font-bold text-muted-foreground truncate uppercase tracking-[0.05em]">Business</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2 text-muted-foreground hover:text-primary transition-all"
                            title="Sign out"
                        >
                            <LogOut size={14} />
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
