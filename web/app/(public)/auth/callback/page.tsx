"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken") || searchParams.get("token");
        // refresh token stored in HttpOnly cookie
        const userId = searchParams.get("userId") || searchParams.get("id");
        const role = searchParams.get("role");
        const email = searchParams.get("email");
        const isOnboarded = searchParams.get("isOnboarded") === "true";

        if (accessToken && userId && role && email) {
            login(accessToken, { id: userId, role, email, isOnboarded } as any);

            if (!isOnboarded) {
                router.push("/auth/onboarding");
            } else {
                toast.success("Login successful!");
                router.push("/");
            }
        } else {
            console.error("Auth missing params. AccessToken:", !!accessToken, "UserId:", !!userId, "Role:", !!role, "Email:", !!email);
            toast.error("Authentication failed. Missing necessary information.");
            router.push("/auth/login");
        }
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium">Completing authentication...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
