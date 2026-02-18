"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const NAV_LINKS = [
    { name: "Help Center", href: "/support/help-center" },
    { name: "Terms of Service", href: "/support/terms" },
    { name: "Privacy Policy", href: "/support/privacy" },
    { name: "Safety Guidelines", href: "/support/safety" },
];

export default function SupportNav() {
    const pathname = usePathname();

    return (
        <nav className="space-y-8">
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                    Support
                </h3>
                <ul className="space-y-1">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "group flex items-center justify-between py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:pl-5"
                                    )}
                                >
                                    <span>{link.name}</span>
                                    {!isActive && (
                                        <ChevronRight
                                            size={14}
                                            className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                                        />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}
