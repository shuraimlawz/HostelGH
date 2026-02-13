"use client";

import { createContext, useContext, useMemo, useState } from "react";
import AuthModal from "./AuthModal";

type Mode = "login" | "register";

type AuthModalCtx = {
    open: (mode?: Mode) => Promise<boolean>;
    close: () => void;
};

const Ctx = createContext<AuthModalCtx | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("login");
    const [resolver, setResolver] = useState<((ok: boolean) => void) | null>(null);

    const api = useMemo<AuthModalCtx>(() => {
        return {
            open: (m: Mode = "login") =>
                new Promise<boolean>((resolve) => {
                    setMode(m);
                    setIsOpen(true);
                    setResolver(() => resolve);
                }),
            close: () => {
                setIsOpen(false);
                if (resolver) resolver(false);
                setResolver(null);
            },
        };
    }, [resolver]);

    return (
        <Ctx.Provider value={api}>
            {children}
            <AuthModal
                open={isOpen}
                mode={mode}
                onClose={() => api.close()}
                onSuccess={() => {
                    setIsOpen(false);
                    if (resolver) resolver(true);
                    setResolver(null);
                }}
                onSwitchMode={(m: Mode) => setMode(m)}
            />
        </Ctx.Provider>
    );
}

export function useAuthModal() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAuthModal must be used inside AuthModalProvider");
    return ctx;
}
