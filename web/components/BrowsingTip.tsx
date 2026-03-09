"use client";

import { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TIPS = [
    "💻 Browsing on a PC or laptop gives you the best HostelGH experience — wider view, easier filtering!",
    "🖥️ For the smoothest hostel search, try HostelGH on your laptop or desktop computer.",
    "🏠 Finding your perfect hostel is easier on a bigger screen. Switch to PC for the full experience!",
    "📱 On mobile? You're good — but HostelGH shines brightest on a PC or laptop!",
];

const SHOW_DELAY = 4000;        // 4s after load, show first tip
const INTERVAL = 90_000;        // repeat every 90s
const SESSION_KEY = "hostelgh_tip_session";

export default function BrowsingTip() {
    const [visible, setVisible] = useState(false);
    const [tip, setTip] = useState(TIPS[0]);
    const [dismissed, setDismissed] = useState(false);
    const [animating, setAnimating] = useState(false);

    const pickTip = () => TIPS[Math.floor(Math.random() * TIPS.length)];

    const showTip = () => {
        setTip(pickTip());
        setAnimating(false);
        setVisible(true);
    };

    const dismiss = () => {
        setAnimating(true);
        setTimeout(() => {
            setVisible(false);
            setAnimating(false);
        }, 400);
    };

    useEffect(() => {
        // Don't show if user has permanently dismissed this session
        if (sessionStorage.getItem(SESSION_KEY) === "dismissed") {
            setDismissed(true);
            return;
        }

        const initial = setTimeout(showTip, SHOW_DELAY);
        const interval = setInterval(() => {
            if (!dismissed) showTip();
        }, INTERVAL);

        return () => {
            clearTimeout(initial);
            clearInterval(interval);
        };
    }, [dismissed]);

    const handleDismiss = () => {
        dismiss();
    };

    const handlePermanentDismiss = () => {
        sessionStorage.setItem(SESSION_KEY, "dismissed");
        setDismissed(true);
        dismiss();
    };

    if (!visible) return null;

    return (
        <div
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm",
                "transition-all duration-400",
                animating ? "opacity-0 translate-y-6 scale-95" : "opacity-100 translate-y-0 scale-100"
            )}
            style={{ transition: "opacity 0.4s ease, transform 0.4s ease" }}
        >
            <div className="relative bg-gray-950 text-white rounded-2xl shadow-2xl shadow-black/40 px-5 py-4 flex items-start gap-3 border border-white/10 backdrop-blur-md">
                {/* Icon */}
                <div className="shrink-0 mt-0.5 w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Monitor size={18} className="text-blue-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug text-gray-100">{tip}</p>
                    <button
                        onClick={handlePermanentDismiss}
                        className="mt-2 text-[11px] font-semibold text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        Don't show again
                    </button>
                </div>

                {/* Close */}
                <button
                    onClick={handleDismiss}
                    className="shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors -mt-1 -mr-1"
                    aria-label="Dismiss"
                >
                    <X size={13} />
                </button>
            </div>
        </div>
    );
}
