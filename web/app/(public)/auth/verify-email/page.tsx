"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

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
                setTimeout(() => router.replace("/auth/login?verified=1"), 1500);
            } catch {
                setStatus("error");
            }
        }

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6">
            <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl shadow-xl p-10 text-center space-y-4">
                {status === "loading" && (
                    <>
                        <h1 className="text-xl font-black">Verifying your email...</h1>
                        <p className="text-sm text-slate-500">Please wait a moment.</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <h1 className="text-xl font-black text-emerald-600">Email verified</h1>
                        <p className="text-sm text-slate-500">Redirecting to login...</p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <h1 className="text-xl font-black text-red-600">Verification failed</h1>
                        <p className="text-sm text-slate-500">The link is invalid or expired.</p>
                        <Link href="/auth/login" className="inline-flex justify-center items-center mt-2 text-xs font-black uppercase tracking-widest text-blue-600">
                            Back to login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6">
                <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl shadow-xl p-10 text-center space-y-4">
                    <h1 className="text-xl font-black">Loading...</h1>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
