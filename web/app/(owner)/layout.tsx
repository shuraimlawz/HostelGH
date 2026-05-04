"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { Menu } from "lucide-react";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === "ADMIN") {
                router.replace("/admin");
            } else if (user.role === "TENANT") {
                router.replace("/account");
            }
        } else if (!isLoading && !user) {
            router.push("/auth/login");
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== "OWNER") {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <div className="flex flex-1">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden fixed top-5 left-4 z-40 p-2.5 bg-background text-foreground rounded-lg shadow-lg border border-border hover:bg-accent transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={18} />
                </button>

                <OwnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
