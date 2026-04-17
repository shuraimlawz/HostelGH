"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import LogoAnimation from "./LogoAnimation";
import { 
    Menu, 
    User as UserIcon, 
    Globe, 
    LayoutDashboard, 
    Home, 
    Users, 
    Calendar, 
    CreditCard, 
    BarChart, 
    Activity, 
    Settings,
    LogOut,
    Building2,
    Wallet
} from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useRouter, usePathname } from "next/navigation";
import RegionSelector from "./RegionSelector";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { open } = useAuthModal();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Define navigation items based on role
    const getNavItems = () => {
        if (!user) return [];

        if (user.role === "ADMIN") {
            return [
                { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
                { label: "Hostels", href: "/admin/hostels", icon: Building2 },
                { label: "Users", href: "/admin/users", icon: Users },
                { label: "Bookings", href: "/admin/bookings", icon: Calendar },
                { label: "Payments", href: "/admin/payments", icon: CreditCard },
                { label: "Analytics", href: "/admin/stats", icon: BarChart },
                { label: "System Logs", href: "/admin/logs", icon: Activity },
                { label: "Settings", href: "/admin/settings", icon: Settings },
            ];
        }

        if (user.role === "OWNER") {
            return [
                { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
                { label: "My Hostels", href: "/owner/hostels", icon: Home },
                { label: "My Rooms", href: "/owner/rooms", icon: Building2 },
                { label: "Reservation List", href: "/owner/bookings", icon: Calendar },
                { label: "Payouts", href: "/owner/payouts", icon: Wallet },
                { label: "Subscription", href: "/owner/subscription", icon: CreditCard },
                { label: "Profile Settings", href: "/owner/account", icon: UserIcon },
            ];
        }

        return [
            { label: "Dashboard", href: "/tenant", icon: LayoutDashboard },
            { label: "My Bookings", href: "/tenant/bookings", icon: Calendar },
            { label: "Payments", href: "/account/payments", icon: CreditCard },
            { label: "My Account", href: "/account", icon: UserIcon },
            { label: "Settings", href: "/account/settings", icon: Settings },
        ];
    };

    const navItems = getNavItems();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm h-16 transition-all duration-300">
            <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1.5 group relative">
                    <LogoAnimation />
                    <span className="font-black text-lg tracking-tighter text-primary flex overflow-hidden">
                        HostelGH
                    </span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-2 flex-1">
                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center">
                        <Link
                            href="/hostels"
                            className="text-xs font-black uppercase tracking-widest px-4 py-2 text-muted-foreground hover:text-foreground transition-all"
                        >
                            Browse
                        </Link>
                        <Link
                            href="/support"
                            className="text-xs font-black uppercase tracking-widest px-4 py-2 text-muted-foreground hover:text-foreground transition-all"
                        >
                            Support
                        </Link>
                    </div>

                    {!user && (
                        <Link
                            href="/auth/register?role=OWNER"
                            className="hidden md:block text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98]"
                        >
                            List Hostel
                        </Link>
                    )}

                    <Suspense fallback={<div className="w-8 h-8" />}>
                        <RegionSelector />
                    </Suspense>


                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "flex items-center gap-2 border rounded-xl px-2 py-1.5 transition-all ml-1 group",
                                isOpen ? "border-primary/30 shadow-md bg-accent" : "border-border hover:border-primary/20 bg-background"
                            )}
                        >
                            <Menu size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                            <div className="bg-gray-100 text-gray-500 rounded-lg p-0.5 overflow-hidden transition-all border border-gray-100">
                                {user ? (
                                    <div className="w-7 h-7 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-inner">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()
                                        )}
                                    </div>
                                ) : (
                                    <UserIcon size={18} className="text-gray-400" />
                                )}
                            </div>
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 top-[calc(100%+0.5rem)] w-64 bg-card text-card-foreground rounded-2xl shadow-2xl border border-black/5 py-3 animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-50">
                                {/* Navigation items for all users */}
                                <Link
                                    href="/hostels"
                                    className="block px-5 py-2.5 hover:bg-zinc-50 text-sm font-bold text-foreground transition-colors lg:hidden"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Browse Hostels
                                </Link>
                                <Link
                                    href="/support"
                                    className="block px-5 py-2.5 hover:bg-zinc-50 text-sm font-bold text-foreground transition-colors lg:hidden"
                                    onClick={() => setIsOpen(false)}
                                >
                                    How it works
                                </Link>

                                {user ? (
                                    <>
                                        <div className="border-t border-black/5 my-2 mx-5" />
                                        <div className="px-5 py-3 border-b border-black/5 mb-1 bg-zinc-50/50">
                                            <div className="font-bold text-sm truncate text-foreground">{user.email}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-widest">{user.role.toLowerCase()} Account Type</div>
                                        </div>

                                        <div className="max-h-[60vh] overflow-y-auto">
                                            {navItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50 text-sm font-bold transition-colors",
                                                        pathname === item.href ? "text-[#1877F2] bg-blue-50/50" : "text-foreground"
                                                    )}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <item.icon size={16} className={cn(pathname === item.href ? "text-[#1877F2]" : "text-muted-foreground")} />
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="border-t border-black/5 my-2 mx-5" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-5 py-2.5 hover:bg-red-50 hover:text-red-600 font-bold text-sm transition-colors flex items-center gap-3"
                                        >
                                            <LogOut size={16} />
                                            Log out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                open("login");
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-zinc-50 text-sm font-bold transition-colors"
                                        >
                                            Log in
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                open("register");
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-zinc-50 text-sm font-medium transition-colors"
                                        >
                                            Sign up
                                        </button>
                                        <div className="border-t border-black/5 my-2 mx-5" />
                                        <Link
                                            href="/auth/register?role=OWNER"
                                            className="block px-5 py-3 hover:bg-zinc-50 text-sm font-bold transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            List your hostel
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
