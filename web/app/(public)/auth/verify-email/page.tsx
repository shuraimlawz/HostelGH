"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Check, X, Loader2, Mail, ShieldCheck, ChevronLeft, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

function VerifyEmailContent() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        async function verify() {
            if (!token) {
                setStatus("error");
                return;
            }
            try {
                await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
                setStatus("success");
                setTimeout(() => router.replace("/auth/login?verified=1"), 2500);
            } catch {
                setStatus("error");
            }
        }

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl rounded-3xl p-10 md:p-12 text-center animate-in zoom-in-95 duration-700">
                    
                    {/* Icon Ring */}
                    <div className="relative w-28 h-28 mx-auto mb-10">
                        <div className={cn(
                            "absolute inset-0 rounded-2xl border-2 transition-all duration-700",
                            status === 'loading' ? "border-blue-600/10 animate-spin border-t-blue-600" : 
                            status === 'success' ? "border-emerald-500/20" : "border-red-500/20"
                        )} />
                        <div className={cn(
                            "absolute inset-3 rounded-2xl border border-dashed transition-all duration-1000 flex items-center justify-center",
                            status === 'loading' ? "border-blue-600/30" : 
                            status === 'success' ? "border-emerald-500/40 bg-emerald-50" : "border-red-500/40 bg-red-50"
                        )}>
                            {status === 'loading' && <Mail className="text-blue-600 animate-pulse" size={32} />}
                            {status === 'success' && <Check className="text-emerald-600 animate-in zoom-in duration-500" size={40} />}
                            {status === 'error' && <X className="text-red-600 animate-in zoom-in duration-500" size={40} />}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700 shadow-sm">
                                    Email Verification
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                                {status === 'loading' && "Verifying your email"}
                                {status === 'success' && "Verification Successful"}
                                {status === 'error' && "Verification Failed"}
                            </h1>
                            <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            {status === 'loading' && "We are checking your verification link. Please wait a moment..."}
                            {status === 'success' && "Your email has been successfully verified. You will be redirected to log in shortly."}
                            {status === 'error' && "The verification link has expired or is invalid. Please request a new one."}
                        </div>

                        {status === 'error' && (
                            <div className="pt-6 space-y-4">
                                <Link 
                                    href="/auth/login" 
                                    className="flex items-center justify-center gap-3 w-full h-14 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl active:scale-95"
                                >
                                    Go to Login
                                </Link>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="pt-6">
                                <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                                    <ShieldCheck size={18} /> Account Activated
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Link */}
                <div className="mt-10 text-center">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-6" size={40} />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">Loading verification data...</p>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
