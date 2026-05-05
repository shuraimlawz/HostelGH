"use client";

import { api } from "@/lib/api";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, User, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
                toast.info("Security Check", { description: "Verify your email to complete initialization." });
                router.replace("/auth/login?verify=1");
                return;
            }

            if (accessToken && user) {
                login(accessToken, user);
                toast.success("Account Created", { description: "Welcome to HostelGH." });

                if (onSuccess) {
                    onSuccess();
                } else {
                    if (user.role === "OWNER") router.push("/owner");
                    else if (user.role === "ADMIN") router.push("/admin");
                    else router.push("/hostels");
                }
            } else {
                toast.success("Account created! Please check your email for a verification link.");
                router.replace("/auth/login?verify=1");
            }
        } catch (error: any) {
            const isNetworkError = !error.response;
            if (isNetworkError) {
                toast.error("Connection Error", {
                    description: "Please check your internet connection and try again.",
                    duration: 5000,
                });
            } else {
                const raw = error.response?.data?.message;
                let message = (!raw || raw === "Internal server error")
                    ? "Failed to create account. Please check your details."
                    : (Array.isArray(raw) ? raw[0] : raw);

                // Sanitization: Hide technical/Prisma errors
                const technicalKeywords = ["prisma", "database", "column", "p2022", "invocation", "sql", "findfirst", "create"];
                if (technicalKeywords.some(key => message.toLowerCase().includes(key))) {
                    message = "An error occurred while creating your account. Please try again later.";
                }

                setErr(message);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = `${api.defaults.baseURL}/auth/google`;
    };

    return (
        <div className="space-y-8">
            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600">First Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 h-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all text-xs font-bold uppercase tracking-tight placeholder:text-gray-300"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="ISAAC"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600">Last Name</label>
                        <input
                            type="text"
                            className="w-full px-4 h-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all text-xs font-bold uppercase tracking-tight placeholder:text-gray-300"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="MENSAH"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input
                            type="email"
                            className="w-full pl-11 pr-4 h-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all text-xs font-bold uppercase tracking-tight placeholder:text-gray-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="USER@EMAIL.COM"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full pl-11 pr-11 h-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all text-xs font-bold tracking-widest placeholder:text-gray-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors outline-none"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600">Account Type</label>
                    <div className="relative">
                        <select
                            className="w-full px-5 h-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm appearance-none cursor-pointer text-gray-900"
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                        >
                            <option value="TENANT">Student Hub (Resident)</option>
                            <option value="OWNER">Owner Hub (Property Owner)</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {err && (
                    <div className="flex items-center gap-3 text-[10px] bg-red-50 text-red-600 font-bold uppercase tracking-widest px-4 py-3 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="shrink-0" size={14} />
                        <span>{err}</span>
                    </div>
                )}

                <button
                    disabled={loading}
                    className="group relative w-full h-14 rounded-2xl bg-gray-900 text-white font-bold py-3.5 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Creating Account...
                        </>
                    ) : (
                        <>
                            Create Account
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-bold">
                    <span className="bg-white px-4 text-gray-300">Alternate</span>
                </div>
            </div>

            <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white text-gray-900 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest shadow-sm"
            >
                <svg viewBox="0 0 18 18" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332c.708-2.127 2.692-3.711 5.036-3.711z" />
                </svg>
                Continue with Google
            </button>

            <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                Already have an account? <Link href="/auth/login" className="text-gray-900 border-b border-gray-200 hover:border-gray-900 transition-all ml-2">Login Here</Link>
            </div>
        </div>
    );
}

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center py-10">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Loading...</span>
                </div>
            </div>
        }>
            <RegisterContent onSuccess={onSuccess} />
        </Suspense>
    );
}
