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
            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5 group">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 group-focus-within:text-blue-500 transition-colors">Email</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3.5 bg-white border border-black/5 hover:border-black/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                    />
                </div>

                <div className="space-y-1.5 group">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 group-focus-within:text-blue-500 transition-colors">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-4 py-3.5 bg-white border border-black/5 hover:border-black/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-sm pr-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500 transition-colors outline-none z-10"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center px-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-border w-3.5 h-3.5 text-blue-600 focus:ring-blue-600 bg-background"
                        />
                        <span className="text-xs text-muted-foreground">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-xs font-semibold text-muted-foreground hover:text-blue-600 transition-colors">
                        Forgot password?
                    </Link>
                </div>

                {err && (
                    <div className="flex items-center gap-2 text-xs bg-red-50 text-red-600 font-medium px-3 py-2.5 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-4 h-4" />
                        <span>{err}</span>
                    </div>
                )}
                {err && err.toLowerCase().includes("verify") && (
                    <button
                        type="button"
                        onClick={resendVerification}
                        disabled={resendLoading}
                        className="w-full text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-500 transition-colors"
                    >
                        {resendLoading ? "Resending..." : "Resend verification email"}
                    </button>
                )}

                <div className="pt-2">
                    <button
                        disabled={loading}
                        className="group relative w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-4 hover:shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all active:scale-[0.98] disabled:opacity-60 text-sm overflow-hidden mt-2"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                <span className="ml-1 tracking-wide">Checking credentials...</span>
                            </div>
                        ) : (
                            <span className="tracking-wide">Sign In</span>
                        )}
                        {!loading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        )}
                    </button>
                </div>
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
            </div>

            <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white text-foreground font-bold py-4 hover:bg-zinc-50 hover:border-black/20 hover:shadow-sm transition-all active:scale-[0.98] text-sm"
            >
                <svg viewBox="0 0 18 18" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332c.708-2.127 2.692-3.711 5.036-3.711z" />
                </svg>
                Continue with Google
            </button>

            <div className="text-center text-xs text-muted-foreground pt-2">
                Don't have an account? <a href="/auth/register" className="font-bold text-foreground border-b border-foreground hover:opacity-70 transition-opacity ml-1">Sign Up</a>
            </div>
        </div>
    );
}
