"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import LogoAnimation from "./LogoAnimation";
import { Menu, User as UserIcon, LogOut } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useRouter } from "next/navigation";

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
                    <Link
                        href="/auth/register?role=OWNER"
                        className="hidden md:block text-sm font-semibold px-4 py-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        Host your home
                    </Link>
                    <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 cursor-pointer transition-colors mr-1">
                        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '16px', width: '16px', fill: 'currentcolor' }}><path d="m8.002.25a7.77 7.77 0 0 1 7.748 7.776 7.75 7.75 0 0 1 -7.521 7.72l-.246.004a7.75 7.75 0 0 1 -7.73-7.513l-.003-.245a7.75 7.75 0 0 1 7.752-7.742zm1.949 8.5h-3.903c.155 2.897 1.176 5.343 1.886 5.493l.068.007c.68-.002 1.72-2.522 1.953-5.5zm-6.703.447c.602 4.067 3.535 7.206 7.372 7.538l.38.016.37-.016c3.837-.332 6.77-3.471 7.373-7.538zm6.577-7.443a6.25 6.25 0 0 1 1.94 5.446h-3.922c.166-2.587 1.096-4.966 1.868-5.385zm-3.649.061c.704.402 1.56 2.502 1.764 4.885h-3.922a6.25 6.25 0 0 1 2.158-4.885zm4.845-.589a6.28 6.28 0 0 0 -1.025-.562c-1.168 2.05-2.269 5.353-2.392 6.095h4.204a6.24 6.24 0 0 0 -.787-5.534zm-9.088.563a6.28 6.28 0 0 0 -1.025.565 6.24 6.24 0 0 0 -.784 5.531h4.202c-.123-.742-1.224-4.045-2.393-6.096z"></path></svg>
                    </div>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 border rounded-full pl-3 pr-1 py-1 hover:shadow-md transition-shadow ml-1"
                        >
                            <Menu size={18} className="ml-1" />
                            <div className="bg-gray-500 text-white rounded-full p-1 opacity-80 overflow-hidden">
                                {user ? (
                                    <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                                    </div>
                                ) : (
                                    <UserIcon size={24} className="fill-white text-gray-500 relative -bottom-1" />
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
                                            href={user.role === "OWNER" ? "/owner" : "/account"}
                                            className="block px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-blue-600 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {user.role === "OWNER" ? "Owner Dashboard" : "My Account"}
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
