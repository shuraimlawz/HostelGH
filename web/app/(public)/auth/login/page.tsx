"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === "OWNER") router.push("/owner");
            else if (user.role === "ADMIN") router.push("/admin");
            else router.push("/hostels");
        }
    }, [user, isLoading, router]);

    if (isLoading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 font-medium">Checking session...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Enter your email and password to access your account"
        >
            <LoginForm />
        </AuthLayout>
    );
}
