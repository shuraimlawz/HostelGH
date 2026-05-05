"use client";

import { LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SupportCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    color?: string;
    bgColor?: string;
    onClick?: () => void;
}

export default function SupportCard({
    title,
    description,
    icon: Icon,
    color = "text-blue-600",
    bgColor = "bg-blue-50",
    onClick,
}: SupportCardProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const isDark = mounted && resolvedTheme === "dark";

    return (
        <button
            onClick={onClick}
            className="group p-8 rounded-3xl border-2 transition-all text-left w-full hover:scale-[1.02] active:scale-[0.98]"
            style={{
                backgroundColor: isDark ? "#0f172a" : "#ffffff",
                borderColor: isDark ? "#1e293b" : "#f1f5f9",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = isDark ? "#3b82f6" : "#bfdbfe";
                (e.currentTarget as HTMLElement).style.boxShadow = isDark
                    ? "0 10px 30px rgba(59,130,246,0.08)"
                    : "0 10px 30px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = isDark ? "#1e293b" : "#f1f5f9";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${bgColor} ${color}`}>
                <Icon size={28} />
            </div>
            <h3
                className="text-lg font-black mb-2"
                style={{ color: isDark ? "#ffffff" : "#111827" }}
            >
                {title}
            </h3>
            <p
                className="text-sm font-medium leading-relaxed line-clamp-2"
                style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
            >
                {description}
            </p>
        </button>
    );
}
