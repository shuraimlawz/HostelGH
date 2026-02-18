import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    return (
        <button
            onClick={onClick}
            className="p-8 rounded-3xl bg-white border-2 border-gray-50 hover:border-blue-100 hover:shadow-xl transition-all text-left group w-full"
        >
            <div
                className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                    bgColor,
                    color
                )}
            >
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
                {description}
            </p>
        </button>
    );
}
