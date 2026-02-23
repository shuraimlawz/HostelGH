"use client";

// Build trigger: Production Cleanup
import { api } from "@/lib/api";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const defaultRole = searchParams.get("role") === "OWNER" ? "OWNER" : "TENANT";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<"TENANT" | "OWNER">(defaultRole);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hostelgh.onrender.com";

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const res = await api.post("/auth/register", { email, password, role });
            const data = res.data?.data || res.data;
            const { accessToken, user } = data;

            if (accessToken && user) {
                login(accessToken, user);
                toast.success("Account created successfully!");

                if (onSuccess) {
                    onSuccess();
                } else {
                    // Immediate role-based redirection
                    if (user.role === "OWNER") {
                        router.push("/owner");
                    } else if (user.role === "ADMIN") {
                        router.push("/admin");
                    } else {
                        router.push("/hostels");
                    }
                }
            } else {
                toast.success("Account created! Please log in.");
                router.push("/auth/login?registered=true");
            }
        } catch (error: any) {
            const isNetworkError = !error.response;
            if (isNetworkError) {
                toast.error("Connectivity Issue", {
                    description: "We’re having trouble connecting to our servers. Please check your internet connection.",
                    duration: 5000,
                });
            } else {
                const message = error.response?.data?.message || "Registration failed. Please check your details.";
                setErr(Array.isArray(message) ? message[0] : message);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
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
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500 transition-colors outline-none"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5 group">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 group-focus-within:text-blue-500 transition-colors">Account Type</label>
                    <div className="relative">
                        <select
                            className="w-full px-4 py-3.5 bg-white border border-black/5 hover:border-black/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-sm appearance-none cursor-pointer"
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                        >
                            <option value="TENANT">Tenant (I want to book)</option>
                            <option value="OWNER">Owner (I want to host)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {err && (
                    <div className="flex items-center gap-2 text-xs bg-red-50 text-red-600 font-medium px-3 py-2.5 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-4 h-4" />
                        <span>{err}</span>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        disabled={loading}
                        className="group relative w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-4 hover:shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all active:scale-[0.98] disabled:opacity-60 text-sm overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                <span className="ml-1 tracking-wide">Preparing your account...</span>
                            </div>
                        ) : (
                            <span className="tracking-wide">Sign Up</span>
                        )}
                        {/* Shimmer effect inside button */}
                        {!loading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        )}
                    </button>
                </div>
            </form>

            <div className="relative py-1">
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

            <div className="text-center text-xs text-muted-foreground pt-1">
                Already have an account? <a href="/auth/login" className="font-bold text-foreground border-b border-foreground hover:opacity-70 transition-opacity ml-1">Log In</a>
            </div>
        </div>
    );
}
