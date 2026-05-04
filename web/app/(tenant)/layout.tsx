"use client";

import TenantSidebar from "@/components/tenant/TenantSidebar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Menu } from "lucide-react";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === "ADMIN") {
                router.replace("/admin");
            } else if (user.role === "OWNER") {
                router.replace("/owner");
            }
        }
    }, [user, isLoading, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    // Show loading while redirecting non-tenant users
    if (user && user.role !== "TENANT") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden fixed top-5 left-4 z-40 p-2.5 bg-background text-foreground rounded-lg shadow-lg border border-border hover:bg-accent transition-colors"
                aria-label="Open menu"
            >
                <Menu size={18} />
            </button>

            <TenantSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
                <div className="md:p-8 p-4 pb-24 md:pb-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
