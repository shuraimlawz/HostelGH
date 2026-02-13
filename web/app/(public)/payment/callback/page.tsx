"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

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
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50/30">
            <div className="w-full max-w-xl bg-white rounded-[3rem] border border-gray-100 p-12 shadow-2xl shadow-gray-200/40 animate-in fade-in zoom-in duration-700">
                {status === "loading" && (
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">Verifying Payment...</h2>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed">Please wait while we secure your booking details.<br />Do not refresh this page.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-8">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Success! 🏡</h2>
                            <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                Your payment has been confirmed and room secured. A receipt has been sent to your email.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-col gap-4">
                            <Button
                                size="lg"
                                className="w-full bg-black text-white hover:opacity-90 h-16 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 active:scale-95 transition-all"
                                onClick={() => router.push("/tenant/bookings")}
                            >
                                Go to My Bookings
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-gray-400 font-bold hover:text-black uppercase tracking-widest text-xs"
                                onClick={() => router.push("/")}
                            >
                                Back to Home
                            </Button>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-8">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Verification Error</h2>
                            <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                We couldn't verify your payment reference. If you were debited, don't worry—our team will reach out within 24 hours.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Button
                                variant="outline"
                                className="w-full h-16 rounded-2xl border-gray-200 font-bold text-lg hover:bg-gray-50 active:scale-95 transition-all"
                                onClick={() => router.push("/tenant/bookings")}
                            >
                                Back to My Bookings
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">HostelGH Secure Payments • Powered by Paystack</p>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-16 h-16 text-primary animate-spin" /></div>}>
            <PaymentCallbackContent />
        </Suspense>
    );
}
