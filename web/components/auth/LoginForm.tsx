"use client";

// Build trigger: Production Cleanup
import { api } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

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
            console.log("Login response:", res.data);
            const data = res.data?.data || res.data;
            const { accessToken, user } = data;

            login(accessToken, user, rememberMe);
            toast.success("Welcome back!");

            if (onSuccess) {
                onSuccess(user);
            } else {
                // Role-based redirection
                if (user.role === "OWNER") {
                    router.push("/owner");
                } else if (user.role === "ADMIN") {
                    router.push("/admin");
                } else if (user.role === "TENANT") {
                    router.push("/hostels");
                } else {
                    router.push("/account");
                }
            }
        } catch (error: any) {
            const isNetworkError = !error.response;
            if (isNetworkError) {
                toast.error("Connectivity Issue", {
                    description: "We’re having trouble connecting to our servers. Please check your internet connection.",
                    duration: 5000,
                });
            } else {
                const raw = error.response?.data?.message;
                const message = (!raw || raw === "Internal server error")
                    ? "Invalid email or password. Please check your credentials and try again."
                    : (Array.isArray(raw) ? raw[0] : raw);
                setErr(message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function resendVerification() {
        if (!email) {
            setErr("Enter your email to resend verification.");
            return;
        }
        setResendLoading(true);
        try {
            await api.post("/auth/resend-verification", { email });
            toast.success("Verification email sent.");
        } catch (error: any) {
            toast.error("Failed to resend verification email.");
        } finally {
            setResendLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        const url = `${api.defaults.baseURL}/auth/google`;
        console.log("Redirecting to Google Auth:", url);
        window.location.href = url;
    };

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="space-y-3">
                <div className="space-y-1 group">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-foreground transition-colors">Email</label>
                    <input
                        type="email"
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30 shadow-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                    />
                </div>

                <div className="space-y-1 group">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-foreground transition-colors">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-3 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold tracking-widest placeholder:text-muted-foreground/30 shadow-sm pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none z-10"
                        >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center px-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer group/check">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded-sm border-border w-3.5 h-3.5 text-primary focus:ring-primary bg-background"
                        />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight group-hover/check:text-foreground transition-colors">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-[10px] font-black text-muted-foreground uppercase tracking-tight hover:text-primary transition-colors">
                        Forgot password?
                    </Link>
                </div>

                {err && (
                    <div className="flex items-center gap-2 text-[10px] bg-red-500/10 text-red-600 font-black uppercase tracking-tight px-3 py-2 rounded-sm border border-red-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>{err}</span>
                    </div>
                )}
                {err && err.toLowerCase().includes("verify") && (
                    <button
                        type="button"
                        onClick={resendVerification}
                        disabled={resendLoading}
                        className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors"
                    >
                        {resendLoading ? "Resending..." : "Resend verification email"}
                    </button>
                )}

                <div className="pt-2">
                    <button
                        disabled={loading}
                        className="group relative w-full rounded-sm bg-foreground text-background font-black py-3.5 hover:bg-foreground/90 transition-all active:scale-[0.98] disabled:opacity-60 text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-foreground/5"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-1 h-1 bg-background rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1 h-1 bg-background rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1 h-1 bg-background rounded-full animate-bounce"></div>
                                <span className="ml-1 tracking-[0.2em]">Checking credentials...</span>
                            </div>
                        ) : (
                            <span className="whitespace-nowrap">Sign In</span>
                        )}
                    </button>
                </div>
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black">
                    <span className="bg-card px-3 text-muted-foreground/50">or</span>
                </div>
            </div>

            <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-2.5 rounded-sm border border-border bg-background text-foreground font-black py-3 hover:bg-muted hover:border-foreground/20 transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest shadow-sm"
            >
                <svg viewBox="0 0 18 18" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332c.708-2.127 2.692-3.711 5.036-3.711z" />
                </svg>
                Continue with Google
            </button>

            <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                New Prospect? <Link href="/auth/register" className="font-black text-foreground border-b border-foreground/50 hover:border-foreground transition-all ml-1">Create Account</Link>
            </div>
        </div>
    );
}
