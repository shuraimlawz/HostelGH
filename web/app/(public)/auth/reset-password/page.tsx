"use client";

import { useState, useEffect, Suspense } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import LogoAnimation from "@/components/layout/LogoAnimation";

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

    // Auto-redirect if no token
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
            setError("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setSuccess(true);
            toast.success("Password reset successfully!");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password. The link might be expired.");
            toast.error("Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center group relative inline-flex justify-center w-full">
                    <div className="transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <LogoAnimation />
                    </div>
                </div>

                <h2 className="mt-8 text-center text-3xl font-black text-gray-900 tracking-tight">
                    Set <span className="text-[#1877F2]">New Password</span>
                </h2>
                <p className="mt-2 text-center text-sm font-medium text-gray-500">
                    Your new password must be securely created.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10">
                <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl shadow-gray-200/50 sm:rounded-[2.5rem] sm:px-12 border border-white/50">

                    {success ? (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 shadow-inner">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Password Reset Complete!</h3>
                            <p className="text-sm text-gray-500 leading-relaxed px-2">
                                Your account is secure and your password has been updated. You can now sign in using your new credentials.
                            </p>

                            <div className="pt-6">
                                <Link
                                    href="/auth/login"
                                    className="w-full inline-flex justify-center items-center gap-2 rounded-2xl border border-transparent bg-[#1877F2] px-4 py-4 text-sm font-black text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-[0_8px_16px_rgba(24,119,242,0.2)] hover:shadow-[0_12px_24px_rgba(24,119,242,0.3)] transition-all active:scale-[0.98]"
                                >
                                    Proceed to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-1.5 group">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-[#1877F2] transition-colors">
                                    New Password
                                </label>
                                <div className="mt-1 relative group/input">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 hover:border-gray-300 rounded-2xl outline-none focus:bg-white focus:border-[#1877F2]/30 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm shadow-sm pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1877F2] transition-colors outline-none z-10"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-[#1877F2] transition-colors">
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative group/input">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 hover:border-gray-300 rounded-2xl outline-none focus:bg-white focus:border-[#1877F2]/30 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm shadow-sm pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1877F2] transition-colors outline-none z-10"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm bg-red-50 text-red-600 font-bold px-4 py-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl text-sm font-black text-white bg-[#1877F2] hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-[0_8px_16px_rgba(24,119,242,0.2)] hover:shadow-[0_12px_24px_rgba(24,119,242,0.3)] transition-all active:scale-[0.98] disabled:opacity-70 overflow-hidden"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                            <span className="ml-1 tracking-wide">Updating...</span>
                                        </div>
                                    ) : (
                                        "Secure My Account"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">Initializing...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
