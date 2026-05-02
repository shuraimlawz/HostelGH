"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import LogoAnimation from "./LogoAnimation";
import { 
    Menu, 
    User as UserIcon, 
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
    Wallet,
    Plus,
    X
} from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useRouter, usePathname } from "next/navigation";
import RegionSelector from "./RegionSelector";
import { cn } from "@/lib/utils";
import StickySearch from "./StickySearch";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { open } = useAuthModal();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showStickySearch, setShowStickySearch] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb7lvGb8kyyFC81FOs1B";

    // Scroll listener for dynamic styling and sticky search
    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY;
            setScrolled(scrollPos > 20);
            
            // Show sticky search only on homepage when hero search is out of view
            if (pathname === "/") {
                setShowStickySearch(scrollPos > 500);
            } else {
                setShowStickySearch(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [pathname]);

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
                { label: "Reservations", href: "/owner/bookings", icon: Calendar },

                { label: "Profile", href: "/owner/account", icon: UserIcon },
            ];
        }
        return [
            { label: "Dashboard", href: "/tenant", icon: LayoutDashboard },
            { label: "My Bookings", href: "/tenant/bookings", icon: Calendar },

            { label: "My Account", href: "/account", icon: UserIcon },
            { label: "Settings", href: "/account/settings", icon: Settings },
        ];
    };

    const navItems = getNavItems();

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

    const isActive = (path: string) => pathname === path;

    return (
        <header 
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-500 ease-in-out",
                scrolled 
                    ? "py-2 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]" 
                    : "py-4 bg-transparent border-b border-transparent"
            )}
        >
            <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo Section */}
                <Link href="/" className={cn(
                    "flex items-center gap-3 group relative transition-all duration-500",
                    showStickySearch ? "opacity-100 md:opacity-100" : "opacity-100"
                )}>
                    <LogoAnimation />
                    <div className="flex flex-col -space-y-1">
                        <span className="font-black text-lg md:text-xl tracking-tighter text-gray-900 flex overflow-hidden">
                            HostelGH
                        </span>
                        <div className="hidden lg:block h-[2px] w-0 group-hover:w-full bg-blue-600 transition-all duration-300 rounded-full" />
                    </div>
                </Link>
                
                {/* Sticky Search Pillar — Airbnb Style */}
                <StickySearch isVisible={showStickySearch} />

                {/* Right Navigation & Control Center */}
                <div className="flex items-center justify-end gap-3 md:gap-6">
                    {/* Desktop Main Links — Hidden when sticky search is active */}
                    <nav className={cn(
                        "hidden lg:flex items-center space-x-2 bg-gray-50/50 p-1 rounded-2xl border border-gray-100/50 backdrop-blur-md transition-all duration-500",
                        showStickySearch ? "opacity-0 -translate-y-4 pointer-events-none absolute scale-95" : "opacity-100 translate-y-0"
                    )}>
                        <Link
                            href="/hostels"
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl transition-all duration-300",
                                isActive("/hostels") 
                                    ? "bg-white text-blue-600 shadow-sm border border-gray-100" 
                                    : "text-gray-400 hover:text-gray-900"
                            )}
                        >
                            Explore
                        </Link>
                        <Link
                            href="/support"
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl transition-all duration-300",
                                isActive("/support") 
                                    ? "bg-white text-blue-600 shadow-sm border border-gray-100" 
                                    : "text-gray-400 hover:text-gray-900"
                            )}
                        >
                            Support
                        </Link>
                    </nav>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-3">
                        <a
                            href={WHATSAPP_CHANNEL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-green-500/20 bg-emerald-500/10 px-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300 transition hover:bg-emerald-500/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                            aria-label="Chat with HostelGH on WhatsApp"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.672.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.672-1.611-.92-2.207-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12.004 2.008c-5.523 0-9.995 4.472-9.995 9.995 0 1.76.462 3.496 1.34 5.02l-1.397 4.98 5.107-1.344a9.937 9.937 0 0 0 4.944 1.205h.006c5.523 0 9.995-4.472 9.995-9.995s-4.472-9.995-9.995-9.995zm0 18.195h-.005c-1.585 0-3.136-.415-4.49-1.2l-.322-.193-3.035.8.81-2.88-.209-.32a8.757 8.757 0 0 1-1.31-4.63c0-4.839 3.93-8.77 8.77-8.77 4.84 0 8.77 3.931 8.77 8.77 0 4.84-3.93 8.77-8.77 8.77z" />
                            </svg>
                            <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                        {!user && (
                            <Link
                                href="/auth/register?role=OWNER"
                                className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] px-6 py-3 rounded-2xl bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:shadow-gray-200 transition-all active:scale-95 group"
                            >
                                <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span>List Hostel</span>
                            </Link>
                        )}

                        <Suspense fallback={<div className="w-10 h-10 rounded-2xl bg-gray-50 animate-pulse" />}>
                            <RegionSelector />
                        </Suspense>

                        {/* Control Center Pill */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={cn(
                                    "flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-[1.5rem] transition-all duration-500 border border-transparent shadow-sm",
                                    isOpen 
                                        ? "bg-gray-900 text-white shadow-xl scale-105" 
                                        : "bg-white hover:bg-gray-50 text-gray-900 border-gray-100"
                                )}
                            >
                                {isOpen ? <X size={18} className="animate-in fade-in spin-in-90 duration-300" /> : <Menu size={18} />}
                                
                                <div className={cn(
                                    "w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-500 flex items-center justify-center text-[10px] font-bold",
                                    isOpen ? "border-blue-500/50 scale-110" : "border-gray-50 shadow-inner bg-gray-100"
                                )}>
                                    {user ? (
                                        user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className={cn(isOpen ? "text-white" : "text-gray-400")}>
                                                {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                                            </span>
                                        )
                                    ) : (
                                        <UserIcon size={16} className="text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isOpen && (
                                <div className="absolute right-0 top-[calc(100%+1rem)] w-72 bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-gray-100 py-3 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 overflow-hidden z-50">
                                    <div className="lg:hidden px-2 mb-2">
                                        <Link
                                            href="/hostels"
                                            className="flex items-center gap-3 px-5 py-3 rounded-2xl hover:bg-gray-50 text-xs font-bold text-gray-900 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Home size={16} className="text-gray-400" />
                                            Browse Listings
                                        </Link>
                                    </div>

                                    {user ? (
                                        <>
                                            <div className="px-5 py-4 bg-gray-50/50 border-y border-gray-100/50 mb-2">
                                                <div className="font-bold text-sm truncate text-gray-900">{user.email}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.role} Hub</span>
                                                </div>
                                            </div>

                                            <div className="max-h-[60vh] overflow-y-auto px-2 space-y-1">
                                                {navItems.map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all group",
                                                            isActive(item.href) 
                                                                ? "bg-blue-50 text-blue-600 shadow-sm" 
                                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                        )}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        <item.icon size={16} className={cn(isActive(item.href) ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>

                                            <div className="mt-4 px-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="px-2 space-y-1">
                                            <button
                                                onClick={() => { setIsOpen(false); open("login"); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-gray-900 hover:bg-gray-50 transition-all"
                                            >
                                                <UserIcon size={16} className="text-gray-400" />
                                                Log In
                                            </button>
                                            <button
                                                onClick={() => { setIsOpen(false); open("register"); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                            >
                                                <CreditCard size={16} className="text-gray-400" />
                                                Join Now
                                            </button>
                                            <div className="h-px bg-gray-50 my-2 mx-3" />
                                            <Link
                                                href="/auth/register?role=OWNER"
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Building2 size={16} />
                                                List your property
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
