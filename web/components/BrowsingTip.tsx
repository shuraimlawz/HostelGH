"use client";

import { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PERSISTENT_KEY = "hostelgh_tip_dismissed_v2"; // Increment version to force reset if needed
const SHOW_DELAY = 10000; // Increased to 10s to be less intrusive

export default function BrowsingTip() {
    const [visible, setVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Initial check: if already dismissed, do nothing
        if (typeof window !== "undefined" && localStorage.getItem(PERSISTENT_KEY) === "true") {
            return;
        }

        const timer = setTimeout(() => {
            // Re-check before showing (in case it was dismissed in another tab during the 10s)
            if (localStorage.getItem(PERSISTENT_KEY) === "true") return;
            setVisible(true);
        }, SHOW_DELAY);

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setVisible(false);
            setIsAnimating(false);
        }, 500);
    };

    const handlePermanentDismiss = () => {
        localStorage.setItem(PERSISTENT_KEY, "true");
        handleDismiss();
    };

    if (!visible) return null;

    return (
        <div
            className={cn(
                "fixed bottom-10 left-1/2 -translate-x-1/2 z-[99] w-[92vw] max-w-[400px]",
                "transition-all duration-700 ease-out",
                isAnimating ? "opacity-0 translate-y-10 scale-90" : "opacity-100 translate-y-0 scale-100"
            )}
        >
            <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 border border-blue-500/30">
                    <Monitor size={18} className="text-white" />
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Note</span>
                        <button 
                            onClick={handleDismiss}
                            className="text-gray-500 hover:text-white transition-colors p-1"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <p className="text-xs font-bold text-white tracking-tight leading-relaxed">
                        HostelGH operates optimally on desktop configurations. Switch to a PC for enhanced auditing and booking tools.
                    </p>
                    <button
                        onClick={handlePermanentDismiss}
                        className="text-[9px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors pt-1"
                    >
                        Deactivate this protocol
                    </button>
                </div>
            </div>
        </div>
    );
}
