"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OwnerSidebar from "@/components/owner/OwnerSidebar";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "OWNER")) {
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
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <div className="flex flex-1">
                <OwnerSidebar />
                <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
