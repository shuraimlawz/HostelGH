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
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center space-y-10 p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-2 border-blue-600/10 rounded-2xl animate-spin" />
                    <div className="absolute inset-0 border-2 border-blue-600 border-t-transparent rounded-2xl animate-spin [animation-duration:1.5s]" />
                    <div className="absolute inset-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-lg shadow-blue-500/10">
                        <Zap className="text-blue-600 animate-pulse" size={28} />
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
                            Identity Verification
                        </span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tighter uppercase leading-tight">
                        Authenticating Handshake
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] animate-pulse">
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
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
