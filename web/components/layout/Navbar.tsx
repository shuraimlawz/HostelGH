"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import LogoAnimation from "./LogoAnimation";
import { Menu, User as UserIcon, Globe } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useRouter } from "next/navigation";
import RegionSelector from "./RegionSelector";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { open } = useAuthModal();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

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
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 h-20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
            <div className="container mx-auto px-4 md:px-10 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group relative h-full">
                    <LogoAnimation />
                    <span className="font-bold text-xl tracking-tighter text-[#1877F2] flex overflow-hidden">
                        {"HostelGH".split("").map((char, i) => (
                            <span
                                key={i}
                                className="inline-block animate-letter-reveal"
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                {char}
                            </span>
                        ))}
                    </span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-3 flex-1">
                    {/* Navigation Links */}
                    <Link
                        href="/hostels"
                        className="hidden lg:block text-sm font-semibold px-4 py-2 rounded-full text-foreground hover:bg-muted transition-all"
                    >
                        Browse
                    </Link>
                    <Link
                        href="/support"
                        className="hidden lg:block text-sm font-semibold px-4 py-2 rounded-full text-foreground hover:bg-muted transition-all"
                    >
                        How it works
                    </Link>

                    {!user && (
                        <Link
                            href="/auth/register?role=OWNER"
                            className="hidden md:block text-sm font-bold px-5 py-2.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            List your hostel
                        </Link>
                    )}

                    <Suspense fallback={<div className="w-10 h-10" />}>
                        <RegionSelector />
                    </Suspense>


                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "flex items-center gap-2.5 border rounded-full pl-3.5 pr-1.5 py-1.5 transition-all ml-1 group",
                                isOpen ? "border-black/20 shadow-md bg-zinc-50" : "border-black/10 hover:border-black/20 shadow-sm hover:shadow-md bg-white"
                            )}
                        >
                            <Menu size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                            <div className="bg-muted text-muted-foreground rounded-full p-1 opacity-90 overflow-hidden ring-2 ring-transparent group-hover:ring-black/5 transition-all">
                                {user ? (
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-black overflow-hidden shadow-inner">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()
                                        )}
                                    </div>
                                ) : (
                                    <UserIcon size={24} className="fill-current relative -bottom-1 text-muted-foreground/60" />
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
                                        <div className="px-5 py-3 border-b border-black/5 mb-2 bg-zinc-50/50">
                                            <div className="font-bold text-sm truncate text-foreground">{user.email}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-widest">{user.role.toLowerCase()} Account</div>
                                        </div>

                                        <Link
                                            href={user.role === "ADMIN" ? "/admin" : user.role === "OWNER" ? "/owner" : "/account"}
                                            className="block px-5 py-2.5 hover:bg-zinc-50 text-sm font-bold text-foreground transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {user.role === "ADMIN" ? "Admin Dashboard" : user.role === "OWNER" ? "Owner Dashboard" : "My Account"}
                                        </Link>
                                        <div className="border-t border-black/5 my-2 mx-5" />
                                        <Link
                                            href={user.role === "OWNER" ? "/owner/bookings" : "/bookings"}
                                            className="block px-5 py-2.5 hover:bg-zinc-50 text-sm font-medium transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            My Bookings
                                        </Link>
                                        <div className="border-t border-black/5 my-2 mx-5" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-5 py-2.5 hover:bg-red-50 hover:text-red-600 font-medium text-sm transition-colors flex items-center gap-2"
                                        >
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
                                            className="block px-5 py-3 hover:bg-zinc-50 text-sm font-medium transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Host your home
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
