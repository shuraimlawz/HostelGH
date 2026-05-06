"use client";

import { api } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginForm({ onSuccess }: { onSuccess?: (user: any) => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const { login } = useAuth();

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });
            const data = res.data?.data || res.data;
            const { accessToken, user } = data;

            login(accessToken, user, rememberMe);
            toast.success("Welcome back!");

            if (onSuccess) {
                onSuccess(user);
            } else {
                if (user.role === "OWNER") router.push("/owner");
                else if (user.role === "ADMIN") router.push("/admin");
                else if (user.role === "TENANT") router.push("/hostels");
                else router.push("/account");
            }
        } catch (error: any) {
            const isNetworkError = !error.response;
            if (isNetworkError) {
                toast.error("Connection Error", {
                    description: "Please check your internet connection.",
                    duration: 5000,
                });
            } else {
                const raw = error.response?.data?.message;
                let message = (!raw || raw === "Internal server error")
                    ? "Invalid credentials. Please check your email and password."
                    : (Array.isArray(raw) ? raw[0] : raw);

                /* 
                // Secondary Sanitization: Hide technical/Prisma errors
                const technicalKeywords = ["prisma", "database", "column", "p2022", "invocation", "sql", "findfirst"];
                if (technicalKeywords.some(key => message.toLowerCase().includes(key))) {
                    message = "An error occurred while processing your request. Please try again later.";
                }
                */


                setErr(message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function resendVerification() {
        if (!email) {
            setErr("Email required to resend verification.");
            return;
        }
        setResendLoading(true);
        try {
            await api.post("/auth/resend-verification", { email });
            toast.success("Verification email sent.");
        } catch (error: any) {
            toast.error("Failed to resend verification.");
        } finally {
            setResendLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        const url = `${api.defaults.baseURL}/auth/google`;
        window.location.href = url;
    };

    return (
        <div className="space-y-8">
            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="email"
                                className="w-full pl-12 pr-4 h-14 bg-muted/50 border border-border rounded-2xl outline-none focus:bg-card focus:border-blue-600 transition-all text-[13px] font-bold text-foreground placeholder:text-muted-foreground/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="USER@EMAIL.COM"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2 group">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] group-focus-within:text-blue-600 transition-colors">Password</label>
                            <Link href="/auth/forgot-password" title="Reset password" className="text-[11px] font-bold text-blue-600 uppercase tracking-widest hover:text-black transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-12 pr-12 h-14 bg-muted/50 border border-border rounded-2xl outline-none focus:bg-card focus:border-blue-600 transition-all text-[13px] font-bold tracking-widest text-foreground placeholder:text-muted-foreground/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors outline-none z-10"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center px-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group/check">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="peer appearance-none w-5 h-5 rounded-lg border border-border bg-muted checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                            />
                            <ShieldCheck className="absolute inset-0 m-auto text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" size={12} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover/check:text-foreground transition-colors">Keep me logged in</span>
                    </label>
                </div>

                {err && (
                    <div className="flex items-center gap-3 text-[10px] bg-red-50 text-red-600 font-bold uppercase tracking-widest px-4 py-3 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="shrink-0" size={14} />
                        <span>{err}</span>
                    </div>
                )}

                {err && err.toLowerCase().includes("verify") && (
                    <button
                        type="button"
                        onClick={resendVerification}
                        disabled={resendLoading}
                        className="w-full text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 transition-colors py-2"
                    >
                        {resendLoading ? "Resending..." : "Resend Verification Email"}
                    </button>
                )}

                <button
                    disabled={loading}
                    className="group relative w-full h-14 rounded-2xl bg-blue-600 text-white font-bold py-3.5 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Logging in...
                        </>
                    ) : (
                        <>
                            Login
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-bold">
                    <span className="bg-card px-4 text-muted-foreground/50">Alternate</span>
                </div>
            </div>

            <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card text-foreground font-bold hover:bg-muted/50 transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest"
            >
                <svg viewBox="0 0 18 18" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332c.708-2.127 2.692-3.711 5.036-3.711z" />
                </svg>
                Continue with Google
            </button>

            <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-4">
                No account yet? <Link href="/auth/register" className="text-foreground border-b border-border hover:border-foreground transition-all ml-2">Register Here</Link>
            </div>
        </div>
    );
}
