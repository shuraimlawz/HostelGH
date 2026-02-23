"use client";

import { useEffect, useState } from "react";
import { useAuthModal } from "./AuthModalProvider";
import { useAuth } from "@/lib/auth-context";

export default function FirstVisitAuthModal() {
    const { open } = useAuthModal();
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || user) return;

        const hasVisited = localStorage.getItem("hasVisitedHostelGH");
        if (!hasVisited) {
            localStorage.setItem("hasVisitedHostelGH", "true");
            // Delay slightly so the user sees the page first before the modal interrupts
            const timer = setTimeout(() => {
                open("register");
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [mounted, user, open]);

    return null; // This component does not render any UI itself
}
