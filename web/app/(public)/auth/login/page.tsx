"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Enter your email and password to access your account"
        >
            <LoginForm />
        </AuthLayout>
    );
}
