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
        <header className="sticky top-0 z-50 bg-white border-b h-16 shadow-sm">
            <div className="container mx-auto px-4 md:px-10 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group relative h-full">
                    <LogoAnimation />
                    <span className="font-bold text-2xl tracking-tighter text-[#1877F2] flex overflow-hidden">
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
                    {!user && (
                        <Link
                            href="/auth/register?role=OWNER"
                            className="hidden md:block text-sm font-semibold px-4 py-2 rounded-lg bg-[#1877F2] text-white hover:bg-[#145CBF] transition-colors"
                        >
                            List your hostel
                        </Link>
                    )}

                    <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                        <Globe size={18} />
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 border border-gray-300 rounded-full pl-3 pr-1 py-1 hover:shadow-md transition-shadow ml-1 group"
                        >
                            <Menu size={18} className="ml-1 text-gray-600 group-hover:text-black" />
                            <div className="bg-gray-500 text-white rounded-full p-1 opacity-80 overflow-hidden">
                                {user ? (
                                    <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                                    </div>
                                ) : (
                                    <UserIcon size={24} className="fill-white text-gray-400 relative -bottom-1" />
                                )}
                            </div>
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-50">
                                {user ? (
                                    <>
                                        <div className="px-4 py-3 border-b mb-1">
                                            <div className="font-semibold text-sm truncate">{user.email}</div>
                                            <div className="text-xs text-gray-500 mt-1 capitalize">{user.role.toLowerCase()} Account</div>
                                        </div>

                                        <Link
                                            href={user.role === "ADMIN" ? "/admin" : user.role === "OWNER" ? "/owner" : "/account"}
                                            className="block px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-black transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {user.role === "ADMIN" ? "Admin Dashboard" : user.role === "OWNER" ? "Owner Dashboard" : "My Account"}
                                        </Link>
                                        <div className="border-t my-1" />
                                        <Link
                                            href={user.role === "OWNER" ? "/owner/bookings" : "/bookings"}
                                            className="block px-4 py-3 hover:bg-gray-50 text-sm transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            My Bookings
                                        </Link>
                                        <div className="border-t my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm transition-colors flex items-center gap-2"
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
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-semibold transition-colors"
                                        >
                                            Log in
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                open("register");
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm transition-colors"
                                        >
                                            Sign up
                                        </button>
                                        <div className="border-t my-1" />
                                        <Link
                                            href="/auth/register?role=OWNER"
                                            className="block px-4 py-3 hover:bg-gray-50 text-sm transition-colors"
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
