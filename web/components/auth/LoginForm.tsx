"use client";

// Build trigger: Production Cleanup
import { api } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const { login } = useAuth();

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hostelgh.onrender.com";

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });
            console.log("Login response:", res.data);
            const data = res.data?.data || res.data;
            const { accessToken, user } = data;

            login(accessToken, user);
            if (onSuccess) {
                onSuccess();
            } else {
                // Role-based redirection
                if (user.role === "OWNER") {
                    router.push("/owner");
                } else if (user.role === "ADMIN") {
                    router.push("/admin");
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
                const message = error.response?.data?.message || "Invalid email or password";
                setErr(Array.isArray(message) ? message[0] : message);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        const url = `${API_BASE_URL}/auth/google`;
        console.log("Redirecting to Google Auth:", url);
        window.location.href = url;
    };

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 px-1">Email</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-black focus:bg-white transition-all text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                    />
                </div>

                <div className="space-y-1 relative">
                    <label className="text-xs font-semibold text-gray-500 px-1">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-black focus:bg-white transition-all text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="flex justify-between items-center px-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 w-3.5 h-3.5 text-black focus:ring-black" />
                        <span className="text-xs text-gray-600">Remember me</span>
                    </label>
                    <button type="button" className="text-xs font-semibold text-gray-600 hover:text-black">Forgot password?</button>
                </div>

                {err && (
                    <div className="flex items-center gap-2 text-xs bg-red-50 text-red-600 font-medium px-3 py-2.5 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-4 h-4" />
                        <span>{err}</span>
                    </div>
                )}

                <button
                    disabled={loading}
                    className="group relative w-full rounded-xl bg-black text-white font-bold py-3.5 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 text-sm shadow-md shadow-black/10 mt-2 overflow-hidden"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                            <span className="ml-1">Checking credentials...</span>
                        </div>
                    ) : (
                        "Sign In"
                    )}
                    {loading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    )}
                </button>
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="bg-white px-2 text-gray-400">or</span>
                </div>
            </div>

            <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold py-3 hover:bg-gray-50 transition-all active:scale-[0.98] text-sm"
            >
                <svg viewBox="0 0 18 18" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332c.708-2.127 2.692-3.711 5.036-3.711z" />
                </svg>
                Continue with Google
            </button>

            <div className="text-center text-xs text-gray-500 pt-2">
                Don't have an account? <a href="/auth/register" className="font-bold text-black border-b border-black hover:opacity-70 transition-opacity ml-1">Sign Up</a>
            </div>
        </div>
    );
}
