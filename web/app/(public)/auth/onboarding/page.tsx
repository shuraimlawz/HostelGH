"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { User, Building2, ChevronRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const [role, setRole] = useState<"TENANT" | "OWNER" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { updateUser } = useAuth();

    const handleCompleteOnboarding = async () => {
        if (!role) {
            toast.error("Please select an account type to continue.");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.patch("/auth/onboard", { role });
            updateUser(data.user);
            toast.success("Account setup complete!");
            router.push(role === "OWNER" ? "/owner" : "/");
        } catch (error: any) {
            toast.error(error.message || "Failed to complete setup");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
            <div className="max-w-xl w-full text-center space-y-10">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                        Almost there! 🏡
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Tell us how you'll be using <span className="text-blue-600 font-bold">HostelGH</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setRole("TENANT")}
                        className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-4 relative group ${role === "TENANT"
                                ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-900/10"
                                : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg"
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role === "TENANT" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}>
                            <User size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-1">I'm a Student</h3>
                            <p className="text-sm text-gray-500 leading-relaxed italic">
                                "Looking for a safe and comfortable hostel to stay in."
                            </p>
                        </div>
                        {role === "TENANT" && (
                            <div className="absolute top-6 right-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <ChevronRight size={14} className="text-white" />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => setRole("OWNER")}
                        className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-4 relative group ${role === "OWNER"
                                ? "border-black bg-gray-50 shadow-xl shadow-black/10"
                                : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg"
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role === "OWNER" ? "bg-black text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}>
                            <Building2 size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-1">I'm an Owner</h3>
                            <p className="text-sm text-gray-500 leading-relaxed italic">
                                "Wanting to list my hostel and manage bookings."
                            </p>
                        </div>
                        {role === "OWNER" && (
                            <div className="absolute top-6 right-6 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                <ChevronRight size={14} className="text-white" />
                            </div>
                        )}
                    </button>
                </div>

                <div className="pt-6">
                    <button
                        onClick={handleCompleteOnboarding}
                        disabled={!role || isLoading}
                        className="w-full h-16 bg-[#1877F2] text-white rounded-3xl font-black text-lg tracking-tight hover:shadow-2xl hover:shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Setting up account...
                            </>
                        ) : (
                            "Start Exploring"
                        )}
                    </button>
                    <p className="mt-6 text-xs text-gray-400">
                        You can change your personal details later in account settings.
                    </p>
                </div>
            </div>
        </div>
    );
}
