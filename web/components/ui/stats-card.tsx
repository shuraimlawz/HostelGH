import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    iconBgColor?: string;
    iconColor?: string;
    onClick?: () => void;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
    iconBgColor = "bg-blue-50",
    iconColor = "text-blue-600",
    onClick
}: StatsCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all",
                onClick && "cursor-pointer hover:border-blue-200"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>

                    {subtitle && (
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    )}

                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    trend.isPositive ? "text-green-600" : "text-red-600"
                                )}
                            >
                                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-gray-500">vs last month</span>
                        </div>
                    )}
                </div>

                <div className={cn("p-3 rounded-xl", iconBgColor)}>
                    <Icon className={cn("w-6 h-6", iconColor)} />
                </div>
            </div>
        </div>
    );
}
