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
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            {status === "loading" && (
                <div className="space-y-4">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                    <h2 className="text-2xl font-bold">Verifying your payment...</h2>
                    <p className="text-muted-foreground">This will only take a moment.</p>
                </div>
            )}

            {status === "success" && (
                <div className="space-y-6">
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold text-foreground">Payment Confirmed!</h2>
                        <p className="text-muted-foreground text-lg">Your booking is now confirmed. We've sent the details to your email.</p>
                    </div>
                    <Button size="lg" className="rounded-full px-10 h-12 font-bold" onClick={() => router.push("/tenant/bookings")}>
                        View My Bookings
                    </Button>
                </div>
            )}

            {status === "error" && (
                <div className="space-y-6">
                    <XCircle className="w-20 h-20 text-destructive mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold">Payment Verification Failed</h2>
                        <p className="text-muted-foreground text-lg">Something went wrong. Please contact support if your account was debited.</p>
                    </div>
                    <Button size="lg" variant="outline" className="rounded-full px-10 h-12 font-bold" onClick={() => router.push("/tenant/bookings")}>
                        Go Back
                    </Button>
                </div>
            )}
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
