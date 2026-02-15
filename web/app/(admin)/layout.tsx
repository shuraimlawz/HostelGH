"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2, ShieldAlert, Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === "OWNER") {
                router.replace("/owner");
            } else if (user.role === "TENANT") {
                router.replace("/account");
            }
        } else if (!isLoading && !user) {
            router.push("/");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
                    <p className="text-gray-500 font-medium animate-pulse">Verifying Admin Access...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== "ADMIN") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-red-100 border border-red-50 text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="text-red-500" size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-500">You do not have administrative privileges to access this area.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-[calc(100vh-80px)]">
            {/* Mobile Menu Button - Positioned in navbar area */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed top-5 left-4 z-40 p-2.5 bg-gray-950 text-white rounded-lg shadow-lg border border-gray-800 hover:bg-gray-900 transition-colors"
                aria-label="Open menu"
            >
                <Menu size={18} />
            </button>

            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
