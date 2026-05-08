"use client";

import { useState, useEffect, Suspense } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, ShieldCheck, Check, ChevronLeft, Zap, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            router.push("/auth/login");
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setSuccess(true);
            toast.success("Password successfully updated");
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid or expired token");
            toast.error("Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white dark:bg-gray-950 border border-gray-100 shadow-2xl dark:shadow-none rounded-3xl p-10 md:p-12 animate-in zoom-in-95 duration-700">

                    <div className="mb-10 space-y-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
                                Login
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tighter uppercase leading-tight">
                                Reset Password
                            </h1>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                                Please enter your new password below.
                            </p>
                        </div>
                        <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    {success ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-sm">
                                <Check size={40} />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">Password Updated</h3>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">Your password has been successfully reset. You can now log in.</p>
                            </div>
                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center gap-3 w-full h-16 bg-blue-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 active:scale-95"
                            >
                                <Zap size={18} />
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 pr-14 h-14 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white transition-colors outline-none z-10"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-14 pr-14 h-14 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 text-[10px] bg-red-50 text-red-600 font-bold uppercase tracking-widest px-5 py-4 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full h-16 bg-blue-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>UPDATING...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            <span>Reset Password</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Link */}
                <div className="mt-10 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:text-white transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        BACK TO HOME
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">LOADING...</p>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
