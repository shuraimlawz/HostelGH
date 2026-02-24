"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post("/auth/forgot-password", { email });
            setSuccess(true);
            toast.success("Reset link sent!");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
            toast.error("Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center group relative inline-flex justify-center w-full">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300 shadow-xl shadow-blue-500/20 relative cursor-pointer">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur group-hover:blur-md transition-all"></div>
                        <span className="text-white text-3xl font-black relative z-10 shadow-sm leading-none">H</span>
                    </div>
                </div>

                <h2 className="mt-8 text-center text-3xl font-black text-gray-900 tracking-tight">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or return to {" "}
                    <Link href="/auth/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                        sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white py-10 px-6 shadow-2xl shadow-gray-200/50 sm:rounded-[2rem] sm:px-12 border border-gray-100">

                    {success ? (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
                            <p className="text-sm text-gray-500">
                                We've sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>.
                                The link will expire in 1 hour.
                            </p>

                            <div className="pt-6">
                                <Link
                                    href="/auth/login"
                                    className="w-full inline-flex justify-center items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                                >
                                    <ArrowLeft size={16} />
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-1.5 group">
                                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1 group-focus-within:text-blue-600 transition-colors">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 hover:border-gray-300 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-sm"
                                        placeholder="Enter your registered email"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm bg-red-50 text-red-600 font-medium px-4 py-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-[0_8px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] disabled:opacity-70 overflow-hidden"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                            <span className="ml-1 tracking-wide">Sending link...</span>
                                        </div>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                    {!loading && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
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
