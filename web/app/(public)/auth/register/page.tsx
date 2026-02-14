"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import { Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === "OWNER") router.push("/owner");
            else if (user.role === "ADMIN") router.push("/admin");
            else router.push("/hostels");
        }
    }, [user, isLoading, router]);

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Sign up to book hostels or list your space"
        >
            <Suspense fallback={
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Loading form...</p>
                </div>
            }>
                <RegisterForm />
            </Suspense>
        </AuthLayout>
    );
}
