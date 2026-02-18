"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { name: "Help Center", href: "/support/help" },
    { name: "Terms of Service", href: "/support/terms" },
    { name: "Privacy Policy", href: "/support/privacy" },
    { name: "Safety Guidelines", href: "/support/safety" },
];

export default function SupportLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-white">
            {/* Minimal Sub-header for Support Navigation */}
            <div className="border-b bg-gray-50/50 sticky top-16 z-40 backdrop-blur-md">
                <div className="container mx-auto px-6 h-14 flex items-center justify-between overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-8 shrink-0">
                        <Link href="/" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1.5 text-sm font-medium">
                            <ChevronLeft size={16} />
                            Back to Home
                        </Link>
                        <nav className="flex items-center gap-6">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors relative h-14 flex items-center",
                                        pathname === link.href
                                            ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                                            : "text-gray-500 hover:text-black"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            <main className="pb-20">
                {children}
            </main>
        </div>
    );
}
