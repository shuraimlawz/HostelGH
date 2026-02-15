"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ListHostelAction() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (isLoading) return;

        if (!user) {
            router.push("/auth/register?role=OWNER");
            return;
        }

        if (user.role === "TENANT") {
            toast.info("Tenant Account Detected", {
                description: "To list a hostel, please sign in with an Owner account.",
                action: {
                    label: "Switch Account",
                    onClick: () => {
                        // Optional: could logout here, but maybe just redirect to login is safer
                        // For now just redirecting to login might be confusing if they are still logged in.
                        // Let's just tell them.
                        router.push("/auth/login");
                    }
                }
            });
            return;
        }

        // Owner or Admin
        router.push("/owner");
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="h-14 px-8 bg-[#1877F2] text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-[#166fe5] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
            ) : null}
            List Your Hostel
        </button>
    );
}
