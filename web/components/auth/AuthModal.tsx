"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({
    open,
    mode,
    onClose,
    onSuccess,
    onSwitchMode,
}: {
    open: boolean;
    mode: "login" | "register";
    onClose: () => void;
    onSuccess: (user: any) => void;
    onSwitchMode: (m: "login" | "register") => void;
}) {
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (open) {
            setIsRendered(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setIsRendered(false), 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!isRendered && !open) return null;

    return (
        <div
            className={`fixed inset-0 z-[999] flex items-center justify-center transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-[420px] bg-card text-card-foreground rounded-2xl shadow-2xl dark:shadow-none border overflow-hidden transition-all duration-300 transform ${open ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
                    }`}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-accent transition-colors"
                    >
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentcolor', strokeWidth: '3', overflow: 'visible' }}>
                            <path d="m6 6 20 20M26 6 6 26"></path>
                        </svg>
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 font-bold text-base">
                        {mode === "login" ? "Log in" : "Sign up"}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 pt-2 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold mb-1">
                            {mode === "login" ? "Welcome back" : "Create an account"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {mode === "login" ? "Enter your details to sign in." : "Join us to start booking."}
                        </p>
                    </div>

                    {mode === "login" ? (
                        <LoginForm onSuccess={onSuccess} />
                    ) : (
                        <RegisterForm onSuccess={() => onSwitchMode("login")} />
                    )}
                </div>

                {/* Footer info (optional for Airbnb style) */}
                <div className="px-6 py-4 bg-muted/50 border-t text-[11px] text-muted-foreground leading-tight">
                    By continuing, you agree to our{" "}
                    <Link href="/support/terms" onClick={onClose} className="underline cursor-pointer hover:text-primary transition-colors">Terms of Service</Link>,{" "}
                    <Link href="/support/privacy" onClick={onClose} className="underline cursor-pointer hover:text-primary transition-colors">Privacy Policy</Link>, and{" "}
                    <Link href="/support/help-center" onClick={onClose} className="underline cursor-pointer hover:text-primary transition-colors">Guest Refund Policy</Link>.
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
        </div>
    );
}
