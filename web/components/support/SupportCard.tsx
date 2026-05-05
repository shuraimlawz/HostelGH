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
    color = "text-primary",
    bgColor = "bg-primary/10",
    onClick,
}: SupportCardProps) {
    return (
        <button
            onClick={onClick}
            className="group p-8 rounded-3xl bg-card border-2 border-border hover:border-primary/30 hover:shadow-lg transition-all text-left w-full active:scale-[0.98]"
        >
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                bgColor, color
            )}>
                <Icon size={28} />
            </div>
            <h3 className="text-base font-black mb-2 text-foreground">{title}</h3>
            <p className="text-xs font-medium leading-relaxed line-clamp-2 text-muted-foreground">
                {description}
            </p>
        </button>
    );
}
