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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-xl">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-12 text-center animate-in zoom-in-95 duration-700">
                    
                    {/* Status Icon */}
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
                            {status === 'loading' && <CreditCard className="text-blue-600 animate-pulse" size={32} />}
                            {status === 'success' && <Check className="text-emerald-600 animate-in zoom-in duration-500" size={44} />}
                            {status === 'error' && <X className="text-red-600 animate-in zoom-in duration-500" size={44} />}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2">
                                <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
                                    Network Registry
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tighter uppercase leading-tight">
                                {status === 'loading' && "Verifying Asset Funding"}
                                {status === 'success' && "Deployment Authorized"}
                                {status === 'error' && "Funding Breach"}
                            </h1>
                            <div className="h-1.5 w-16 bg-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
                            {status === 'loading' && "Authenticating payment reference with central gateway. Maintaining session connection..."}
                            {status === 'success' && "Payment verified. Room allocation secured and asset is now active. Confirmation dispatched to registered terminal."}
                            {status === 'error' && "Could not isolate payment reference. If funds were debited, automated reconciliation will occur within 24 cycles."}
                        </div>

                        {status === "success" && (
                            <div className="pt-8 flex flex-col gap-4">
                                <button
                                    onClick={() => router.push("/tenant/bookings")}
                                    className="w-full h-16 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <Zap size={18} />
                                    Access Operational Hub
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                                >
                                    Return to Overview
                                </button>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="pt-8 space-y-4">
                                <button
                                    onClick={() => router.push("/tenant/bookings")}
                                    className="w-full h-16 bg-red-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-[0.98]"
                                >
                                    Report Transaction Issue
                                </button>
                                <Link 
                                    href="/"
                                    className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors group"
                                >
                                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    Back to Archive
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 flex items-center justify-center gap-3">
                        <ShieldCheck size={14} className="text-blue-500" /> Secure Protocol • HostelGH Internal Core
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">SYNCHRONIZING EXTERNAL HANDSHAKE...</p>
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    );
}
