"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, Loader2, CreditCard, ShieldCheck, ChevronLeft, Zap } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

function PaymentCallbackContent() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get("reference");

    useEffect(() => {
        if (reference) {
            const verify = async () => {
                try {
                    await api.post("/payments/paystack/verify", { reference });
                    setStatus("success");
                } catch (error) {
                    console.error("Verification failed", error);
                    setStatus("error");
                }
            };
            verify();
        } else {
            setStatus("error");
        }
    }, [reference]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-xl">
                <div className="bg-card border border-border shadow-2xl rounded-sm p-10 md:p-12 text-center animate-in zoom-in-95 duration-700">
                    
                    {/* Status Icon */}
                    <div className="relative w-24 h-24 mx-auto mb-10">
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
                            {status === 'loading' && <CreditCard className="text-primary animate-pulse" size={32} />}
                            {status === 'success' && <Check className="text-emerald-500 animate-in zoom-in duration-300" size={40} />}
                            {status === 'error' && <X className="text-red-500 animate-in zoom-in duration-300" size={40} />}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Transactional Registry</span>
                            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">
                                {status === 'loading' && "Verifying Asset Funding"}
                                {status === 'success' && "Deployment Authorized"}
                                {status === 'error' && "Funding Breach"}
                                <span className="text-primary NOT-italic">.</span>
                            </h1>
                            <div className="h-px w-16 bg-border mx-auto" />
                        </div>

                        <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed max-w-md mx-auto">
                            {status === 'loading' && "Authenticating payment reference with central gateway. Do not terminate session."}
                            {status === 'success' && "Payment verified. Room allocation secured and asset is now active. Confirmation dispatched to registered address."}
                            {status === 'error' && "Could not isolate payment reference. If funds were debited, automated reconciliation will occur within 24 hours."}
                        </div>

                        {status === "success" && (
                            <div className="pt-6 flex flex-col gap-4">
                                <button
                                    onClick={() => router.push("/tenant/bookings")}
                                    className="w-full bg-foreground text-background py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-foreground/10 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Zap size={14} />
                                    Access Operational Hub
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                                >
                                    Return to Overview
                                </button>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="pt-6 space-y-4">
                                <button
                                    onClick={() => router.push("/tenant/bookings")}
                                    className="w-full bg-red-500 text-white py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/10 hover:opacity-90 transition-all active:scale-[0.98]"
                                >
                                    Report Transaction Issue
                                </button>
                                <Link 
                                    href="/"
                                    className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors group"
                                >
                                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                    Back to Home
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center justify-center gap-2">
                        <ShieldCheck size={12} /> Encrypted Gateway Protocol • HosteGH Core
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-sm animate-spin mb-6" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">SYNCHRONIZING EXTERNAL HANDSHAKE...</p>
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    );
}
