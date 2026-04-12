"use client";

import { useState, useEffect, Suspense } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, ShieldCheck, Check, ChevronLeft, Zap, Lock } from "lucide-react";
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
            setError("PROTOCOL ERROR: PASSWORDS MISMATCH");
            return;
        }

        if (password.length < 8) {
            setError("SECURITY BREACH: PASSWORD LENGTH < 8");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setSuccess(true);
            toast.success("Credential Registry Updated");
        } catch (err: any) {
            setError(err.response?.data?.message || "TRANSMISSION ERROR: EXPIRED TOKEN");
            toast.error("Registry Update Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-card border border-border shadow-2xl rounded-sm p-8 md:p-10 animate-in zoom-in-95 duration-500">

                    <div className="mb-8 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 bg-foreground text-background rounded-sm text-[8px] font-black uppercase tracking-widest">
                                security/vault
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight uppercase italic">
                            Credential Reset <span className="text-primary NOT-italic">.</span>
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                            Establishing a new secure baseline for your identity session.
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-sm border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <Check className="text-emerald-500" size={32} />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic">Registry Synchronized</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your access credentials have been successfully re-encrypted.</p>
                            </div>
                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-foreground text-background rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-foreground/10 active:scale-[0.98]"
                            >
                                Proceed to Login
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-1.5 group">
                                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-primary transition-colors">
                                    New Passkey
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-black uppercase tracking-widest placeholder:text-muted-foreground/30"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none z-10"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-primary transition-colors">
                                    Verify Passkey
                                </label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-black uppercase tracking-widest placeholder:text-muted-foreground/30"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-[9px] bg-red-500/5 text-red-500 font-black uppercase tracking-widest px-4 py-3 rounded-sm border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 bg-foreground text-background rounded-sm text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-foreground/10 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 overflow-hidden"
                                >
                                    {loading ? (
                                        <>
                                            <Zap className="animate-pulse" size={14} />
                                            <span>UPDATING REGISTRY...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={14} />
                                            <span>Establish Security Base</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors group"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        HUB OVERVIEW
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-card border border-border rounded-sm p-10 text-center">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-sm animate-spin mx-auto mb-6" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">ACCESSING VAULT...</p>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
