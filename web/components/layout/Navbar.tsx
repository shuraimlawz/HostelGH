"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import LogoAnimation from "./LogoAnimation";
import { Menu, User as UserIcon, LogOut } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useRouter } from "next/navigation";
import RegionSelector from "./RegionSelector";
import { Suspense } from "react";

export default function Navbar() {
    const { user, logout, isLoading } = useAuth();
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
        <header className="sticky top-0 z-50 bg-white border-b h-20">
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

                {/* Search Bar Link */}
                <Link href="/hostels" className="hidden md:flex shadow-sm hover:shadow-md transition-shadow border rounded-full px-4 py-2.5 items-center gap-4 cursor-pointer">
                    <div className="text-sm font-semibold px-2 border-r border-gray-300">Anywhere</div>
                    <div className="text-sm font-semibold px-2 border-r border-gray-300">Any week</div>
                    <div className="text-sm text-gray-500 px-2 font-light">Add guests</div>
                    <div className="bg-[#1877F2] p-2 rounded-full text-white">
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '12px', width: '12px', stroke: 'currentcolor', strokeWidth: '5.33333', overflow: 'visible' }}>
                            <g fill="none">
                                <path d="m13 24c6.0751322 0 11-4.9248678 11-11 0-6.07513225-4.9248678-11-11-11-6.07513225 0-11 4.92486775-11 11 0 6.0751322 4.92486775 11 11 11zm8-3 9 9"></path>
                            </g>
                        </svg>
                    </div>
                </Link>


                {/* User Menu */}
                <div className="flex items-center gap-2">
                    {!user && (
                        <Link
                            href="/auth/register?role=OWNER"
                            className="hidden md:block text-sm font-semibold px-4 py-3 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Host your home
                        </Link>
                    )}
                    <Suspense fallback={<div className="w-10 h-10" />}>
                        <RegionSelector />
                    </Suspense>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 border rounded-full pl-3 pr-1 py-1 hover:shadow-md transition-shadow ml-1"
                        >
                            <Menu size={18} className="ml-1" />
                            <div
                                className="bg-gray-500 text-white rounded-full p-1 opacity-80 overflow-hidden cursor-pointer hover:opacity-100 transition-opacity"
                                onClick={() => router.push("/account")}
                            >
                                {user ? (
                                    <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                                    </div>
                                ) : (
                                    <UserIcon size={24} className="fill-white text-gray-400 relative -bottom-1" />
                                )}
                            </div>
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                {user ? (
                                    <>
                                        <div className="px-4 py-3 border-b mb-1">
                                            <div className="font-semibold text-sm truncate">{user.email}</div>
                                            <div className="text-xs text-gray-500 mt-1 capitalize">{user.role.toLowerCase()} Account</div>
                                        </div>

                                        <Link
                                            href={user.role === "ADMIN" ? "/admin" : user.role === "OWNER" ? "/owner" : "/account"}
                                            className="block px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-blue-600 transition-colors"
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
                                        {/* <Link
                                            href="/help"
                                            className="block px-4 py-3 hover:bg-gray-50 text-sm transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Help Center
                                        </Link> */}
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
                                        {/* <Link
                                            href="/help"
                                            className="block px-4 py-3 hover:bg-gray-50 text-sm transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Help Center
                                        </Link> */}
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
