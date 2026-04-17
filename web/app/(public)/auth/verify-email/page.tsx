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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-10 md:p-12 text-center animate-in zoom-in-95 duration-700">
                    
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
                                <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
                                    Identity Protocol
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tighter uppercase leading-tight">
                                {status === 'loading' && "Verifying Asset Access"}
                                {status === 'success' && "Verification Complete"}
                                {status === 'error' && "Protocol Violation"}
                            </h1>
                            <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            {status === 'loading' && "Authenticating token against primary registry. Please maintain session sync..."}
                            {status === 'success' && "Session authorized. Identity confirmed. Auto-redirecting to primary interface."}
                            {status === 'error' && "The verification token has expired or is invalid. Manual investigation required."}
                        </div>

                        {status === 'error' && (
                            <div className="pt-6 space-y-4">
                                <Link 
                                    href="/auth/login" 
                                    className="flex items-center justify-center gap-3 w-full h-14 bg-gray-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                                >
                                    Return to Authentication
                                </Link>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                                >
                                    Retry Verification Attempt
                                </button>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="pt-6">
                                <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 py-4 rounded-2xl border border-emerald-100 animate-pulse">
                                    <ShieldCheck size={16} /> Access Granted
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Link */}
                <div className="mt-10 text-center">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Archive Hub
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">SYNCHRONIZING REGISTRY...</p>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
