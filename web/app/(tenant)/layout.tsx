"use client";

import TenantSidebar from "@/components/tenant/TenantSidebar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

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
        <div className="flex min-h-screen bg-gray-50/50">
            <TenantSidebar />
            <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
                <div className="md:p-8 p-4 pb-24 md:pb-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
