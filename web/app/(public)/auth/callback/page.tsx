"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken") || searchParams.get("token");
        const userId = searchParams.get("userId") || searchParams.get("id");
        const role = searchParams.get("role");
        const email = searchParams.get("email");
        const isOnboarded = searchParams.get("isOnboarded") === "true";

        if (accessToken && userId && role && email) {
            login(accessToken, { id: userId, role, email, isOnboarded } as any);

            if (!isOnboarded) {
                router.push("/auth/onboarding");
            } else {
                toast.success("Identity Verified");
                router.push("/");
            }
        } else {
            console.error("Auth missing params");
            toast.error("Protocol Handshake Failed");
            router.push("/auth/login");
        }
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8 p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-2 border-primary/10 rounded-sm animate-spin" />
                    <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-sm animate-spin [animation-duration:1.5s]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="text-primary animate-pulse" size={24} />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-sm font-black text-foreground tracking-[0.3em] uppercase italic">
                        Authenticating Handshake
                    </h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Synchronizing session with primary registry...
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-sm animate-spin" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
