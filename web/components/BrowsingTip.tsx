"use client";
import { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PERSISTENT_KEY = "hostelgh_tip_dismissed_v3"; // Version v3 to ensure it shows for everyone once
const SHOW_DELAY = 10000; 

export default function BrowsingTip() {
    const [visible, setVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Initial check: if already dismissed in this browser, don't even start the timer
        const isDismissed = localStorage.getItem(PERSISTENT_KEY) === "true";
        if (isDismissed) return;

        const timer = setTimeout(() => {
            // Final check before showing (robustness)
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
        }, 300);
    };

    const handlePermanentDismiss = () => {
        localStorage.setItem(PERSISTENT_KEY, "true");
        handleDismiss();
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div 
                className={cn(
                    "absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500",
                    isAnimating ? "opacity-0" : "opacity-100"
                )}
                onClick={handleDismiss}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    "relative w-full max-w-[380px] bg-gray-900 border border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 overflow-hidden transition-all duration-500",
                    isAnimating ? "opacity-0 scale-95 translate-y-4" : "opacity-100 scale-100 translate-y-0"
                )}
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <button 
                    onClick={handleDismiss}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/40 border border-blue-500/30">
                        <Monitor size={28} className="text-white" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Note</span>
                        <h2 className="text-xl font-bold text-white tracking-tight">Better on a Computer</h2>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            HostelGH works best on a computer. Switch to a desktop for the best experience and extra booking features.
                        </p>
                    </div>

                    <button
                        onClick={handlePermanentDismiss}
                        className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 hover:border-white/10"
                    >
                        Don't show this again
                    </button>
                    
                    <button
                        onClick={handleDismiss}
                        className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
