"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import LogoAnimation from "@/components/layout/LogoAnimation";

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
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
            {/* Background Aesthetic */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-6">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-3 group transition-all duration-300">
                        <div className="p-1 group-hover:scale-110 transition-transform duration-500">
                            <LogoAnimation />
                        </div>
                        <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">HostelGH</span>
                    </Link>
                </div>

                <div className="mt-8 space-y-3">
                    <h1 className="text-center text-4xl font-bold text-foreground tracking-tight uppercase">
                        Forgot Password
                    </h1>
                    <p className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10 px-6">
                <div className="bg-card border border-border p-10 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600/30 to-transparent"></div>

                    {success ? (
                        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto relative border border-blue-600/20">
                                <CheckCircle2 className="w-10 h-10 text-blue-600" />
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Check Your Inbox</h3>
                                <p className="text-[12px] text-muted-foreground font-medium leading-relaxed px-2">
                                    We have sent a reset link to <br/>
                                    <span className="font-bold text-foreground mt-2 inline-block border-b border-border">{email}</span>
                                </p>
                            </div>

                            <div className="pt-6">
                                <Link
                                    href="/auth/login"
                                    className="w-full inline-flex justify-center items-center gap-3 rounded-2xl bg-muted/50 border border-border px-6 py-4 text-[10px] font-bold text-foreground uppercase tracking-widest hover:bg-muted transition-all active:scale-[0.98]"
                                >
                                    <ArrowLeft size={16} className="text-blue-600" />
                                    Return to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-10" onSubmit={handleSubmit}>
                            <div className="space-y-3 group">
                                <label htmlFor="email" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-all duration-300">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 h-14 bg-muted/50 border border-border rounded-2xl outline-none focus:bg-card focus:border-blue-600 transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/50 text-foreground shadow-sm"
                                        placeholder="USER@EMAIL.COM"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-4 text-[11px] bg-red-500/5 text-red-500 font-bold px-5 py-4 rounded-2xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span className="leading-relaxed uppercase tracking-wide">
                                        {error.toLowerCase().includes('prisma') || error.toLowerCase().includes('database') 
                                            ? "Unable to process request. Please try again later." 
                                            : error}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-8">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full h-14 rounded-2xl bg-blue-600 text-white font-bold py-3.5 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                                
                                <div className="text-center">
                                    <Link href="/auth/login" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all border-b border-transparent hover:border-foreground pb-1">
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
}
