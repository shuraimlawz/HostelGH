"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, CheckCircle2, Mail, Sparkles } from "lucide-react";
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
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-400/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center group relative inline-flex justify-center w-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-blue-500/30 relative cursor-pointer">
                        <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-white text-4xl font-black relative z-10 tracking-tighter">H</span>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full border-4 border-white flex items-center justify-center animate-bounce">
                            <Sparkles className="text-white w-3 h-3" />
                        </div>
                    </div>
                </div>

                <div className="mt-10 space-y-2">
                    <h2 className="text-center text-4xl font-black text-gray-900 tracking-tight leading-tight">
                        Password <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Recovery</span>
                    </h2>
                    <p className="text-center text-sm font-medium text-gray-500/80 max-w-[280px] mx-auto leading-relaxed">
                        Enter your email below and we&apos;ll send you a magic link to regain access.
                    </p>
                </div>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10">
                <div className="bg-white/80 backdrop-blur-2xl py-12 px-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] sm:rounded-[3rem] sm:px-12 border border-white/40 relative overflow-hidden">
                    {/* Interior Shimmer */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

                    {success ? (
                        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative inline-flex mb-4">
                                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl scale-150 animate-pulse"></div>
                                <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mx-auto relative border border-green-200 shadow-inner">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Check Your Inbox</h3>
                                <p className="text-[15px] text-gray-500 leading-relaxed px-2">
                                    A reset link has been dispatched to <br/>
                                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{email}</span>
                                </p>
                            </div>

                            <div className="pt-8">
                                <Link
                                    href="/auth/login"
                                    className="w-full inline-flex justify-center items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-6 py-4 text-sm font-black text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] shadow-sm"
                                >
                                    <ArrowLeft size={18} className="text-blue-600" />
                                    Return to Authentication
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="space-y-2.5 group">
                                <label htmlFor="email" className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1 group-focus-within:text-blue-600 transition-all duration-300">
                                    Registered Email
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent hover:border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500/20 focus:ring-[6px] focus:ring-blue-500/5 transition-all text-[15px] font-medium placeholder:text-gray-300 shadow-inner"
                                        placeholder="alex@example.com"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 text-sm bg-red-50/80 backdrop-blur-sm text-red-600 font-bold px-5 py-4 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span className="leading-tight">{error}</span>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-5 px-6 border border-transparent rounded-2xl text-[15px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-[6px] focus:ring-blue-500/10 shadow-[0_12px_24px_-8px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_32px_-8px_rgba(37,99,235,0.5)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale overflow-hidden"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                            <span className="ml-1 tracking-tight">Syncing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 underline decoration-white/30 decoration-2 underline-offset-4">
                                            Secure Recovery Link
                                        </div>
                                    )}
                                    {!loading && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_2s_infinite]"></div>
                                    )}
                                </button>
                                
                                <p className="mt-8 text-center text-xs font-bold text-gray-400 tracking-wide">
                                    Remember it? {" "}
                                    <Link href="/auth/login" className="text-blue-600 border-b-2 border-blue-600/20 hover:border-blue-600 transition-all pb-0.5 ml-1">
                                        Head back to login
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
