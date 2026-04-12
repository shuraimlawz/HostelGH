"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Check, X, Loader2, Mail, ShieldCheck, ChevronLeft } from "lucide-react";
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
                setTimeout(() => router.replace("/auth/login?verified=1"), 2000);
            } catch {
                setStatus("error");
            }
        }

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-card border border-border shadow-2xl rounded-sm p-8 md:p-10 text-center animate-in zoom-in-95 duration-500">
                    
                    {/* Icon Ring */}
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className={cn(
                            "absolute inset-0 rounded-sm border-2 transition-all duration-700",
                            status === 'loading' ? "border-primary/10 animate-spin border-t-primary" : 
                            status === 'success' ? "border-emerald-500/20" : "border-red-500/20"
                        )} />
                        <div className={cn(
                            "absolute inset-2 rounded-sm border border-dashed transition-all duration-700 flex items-center justify-center",
                            status === 'loading' ? "border-primary/30" : 
                            status === 'success' ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"
                        )}>
                            {status === 'loading' && <Mail className="text-primary animate-pulse" size={32} />}
                            {status === 'success' && <Check className="text-emerald-500 animate-in zoom-in duration-300" size={32} />}
                            {status === 'error' && <X className="text-red-500 animate-in zoom-in duration-300" size={32} />}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Protocol</span>
                            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase italic">
                                {status === 'loading' && "Verifying Asset Access"}
                                {status === 'success' && "Verification Complete"}
                                {status === 'error' && "Protocol Violation"}
                                <span className="text-primary NOT-italic">.</span>
                            </h1>
                            <div className="h-px w-12 bg-border mx-auto" />
                        </div>

                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                            {status === 'loading' && "Authenticating token against primary registry. Please maintain session."}
                            {status === 'success' && "Session authorized. Identity confirmed. Auto-redirecting to primary interface."}
                            {status === 'error' && "The verification token has expired or is invalid. Manual investigation required."}
                        </div>

                        {status === 'error' && (
                            <div className="pt-4 space-y-3">
                                <Link 
                                    href="/auth/login" 
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-foreground text-background rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-foreground/10"
                                >
                                    Return to Auth
                                </Link>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                                >
                                    Retry Verification Attempt
                                </button>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="pt-4">
                                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 py-2 rounded-sm border border-emerald-500/20">
                                    <ShieldCheck size={12} /> Access Granted
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors group"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        HUB OVERVIEW
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-card border border-border rounded-sm p-10 text-center">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-sm animate-spin mx-auto mb-6" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Registry...</p>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
