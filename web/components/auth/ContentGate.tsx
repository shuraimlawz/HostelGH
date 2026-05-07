"use client";

import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentGateProps {
    children: React.ReactNode;
    /** What blurs behind the gate when locked */
    blur?: boolean;
    /** Short message shown in the gate panel */
    message?: string;
    className?: string;
}

/**
 * Wraps content that requires an active session.
 * - If authenticated → renders children normally.
 * - If not → renders a blur overlay with a sign-in prompt.
 *   The page remains browsable but the sensitive content is obscured.
 */
export default function ContentGate({
    children,
    blur = true,
    message = "Sign in to view this information",
    className,
}: ContentGateProps) {
    const { user } = useAuth();
    const { open } = useAuthModal();

    if (user) return <>{children}</>;

    return (
        <div className={cn("relative", className)}>
            {/* Blurred preview */}
            {blur && (
                <div className="pointer-events-none select-none" aria-hidden>
                    <div className="blur-sm opacity-40 saturate-50">
                        {children}
                    </div>
                </div>
            )}

            {/* Gate overlay */}
            <div className={cn(
                "flex flex-col items-center justify-center gap-4 text-center py-8 px-6",
                blur && "absolute inset-0"
            )}>
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-xl">
                    <Lock size={20} className="text-white" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Create a free account or log in to continue</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => open("login")}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => open("register")}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Register Free
                    </button>
                </div>
            </div>
        </div>
    );
}
