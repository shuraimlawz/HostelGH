"use client";

// Build trigger: Production Cleanup
import { api } from "@/lib/api";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

function RegisterContent({ onSuccess }: { onSuccess?: () => void }) {
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const defaultRole = searchParams.get("role") === "OWNER" ? "OWNER" : "TENANT";

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
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
            const res = await api.post("/auth/register", {
                email,
                password,
                role,
                firstName,
                middleName: middleName || undefined,
                lastName,
            });
            const data = res.data?.data || res.data;
            const { accessToken, user, requiresEmailVerification } = data;

            if (requiresEmailVerification) {
                toast.info("Check your email to verify your account.");
                router.replace("/auth/login?verify=1");
                return;
            }

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
                toast.success("Account created! Please verify your email.");
                router.replace("/auth/login?verify=1");
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
                const errorName = error.response?.data?.error || error.name;
                const message = (!raw || raw === "Internal server error")
                    ? `Registration failed: ${errorName || "Unknown Error"}`
                    : (Array.isArray(raw) ? raw[0] : raw);
                setErr(message);
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
            <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 group">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-foreground">First</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30 shadow-sm"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="JOHN"
                            required
                        />
                    </div>

                    <div className="space-y-1 group">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-foreground">Last</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30 shadow-sm"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="DOE"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1 group">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-foreground">Identity Email</label>
                    <input
                        type="email"
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30 shadow-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="NAME@DOMAIN.COM"
                        required
                    />
                </div>

                <div className="space-y-1 group">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-foreground">Passkey</label>
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none"
                        >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1 group">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 group-focus-within:text-foreground transition-colors">Intent</label>
                    <div className="relative">
                        <select
                            className="w-full px-3 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-black uppercase tracking-widest shadow-sm appearance-none cursor-pointer"
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                        >
                            <option value="TENANT">Tenant / Resident</option>
                            <option value="OWNER">Owner / Proprietor</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {err && (
                    <div className="flex items-center gap-2 text-[10px] bg-red-500/10 text-red-600 font-black uppercase tracking-tight px-3 py-2 rounded-sm border border-red-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>{err}</span>
                    </div>
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
                                <span className="ml-1 tracking-[0.2em]">REGISTERING...</span>
                            </div>
                        ) : (
                            <span className="whitespace-nowrap">Create Account</span>
                        )}
                    </button>
                </div>
            </form>

            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black">
                    <span className="bg-card px-3 text-muted-foreground/50">OR</span>
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
                Google Identity
            </button>

            <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-1">
                Found your key? <Link href="/auth/login" className="font-black text-foreground border-b border-foreground/50 hover:border-foreground transition-all ml-1">Sign In</Link>
            </div>
        </div>
    );
}

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                    <span className="ml-1 tracking-widest">INITIALIZING...</span>
                </div>
            </div>
        }>
            <RegisterContent onSuccess={onSuccess} />
        </Suspense>
    );
}
