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
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 pl-4">
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
                                        "group flex items-center justify-between py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary border-l-4 border-primary pl-3"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted hover:pl-5"
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
