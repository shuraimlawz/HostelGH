"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

/* ── Pulse Skeleton ─────────────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

/* ── Status Badge ───────────────────────────────────────────────── */
const STATUS_MAP: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    PAYMENT_SECURED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    RESERVED: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
    CHECKED_IN: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    COMPLETED: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
    CANCELLED: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400",
    unpublished: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400",
    pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400",
};
export function StatusBadge({ status }: { status: string }) {
    return (
        <span className={cn(
            "inline-flex items-center h-6 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            STATUS_MAP[status] ?? "bg-slate-100 text-slate-500 border-slate-200"
        )}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

/* ── KPI Card ───────────────────────────────────────────────────── */
export function KpiCard({
    label, value, sub, icon: Icon, iconBg, trend,
}: {
    label: string; value: string | number; sub?: string;
    icon: any; iconBg: string;
    trend?: { value: string; up: boolean };
}) {
    return (
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-300 group">
            <div className="flex items-start justify-between">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0", iconBg)}>
                    <Icon size={20} className="text-white" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border",
                        trend.up
                            ? "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                            : "text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20"
                    )}>
                        {trend.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {trend.value}
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1 font-medium">{sub}</p>}
            </div>
        </div>
    );
}

/* ── Section Header ─────────────────────────────────────────────── */
export function SectionHeader({
    title, sub, href, linkLabel = "View all"
}: {
    title: string; sub?: string; href?: string; linkLabel?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 mb-4">
            <div>
                <h2 className="text-base font-bold text-foreground">{title}</h2>
                {sub && <p className="text-xs text-muted-foreground mt-0.5 font-medium">{sub}</p>}
            </div>
            {href && (
                <Link href={href} className="shrink-0 text-[11px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1">
                    {linkLabel} <ArrowUpRight size={12} />
                </Link>
            )}
        </div>
    );
}

/* ── Empty State ────────────────────────────────────────────────── */
export function EmptyState({
    icon: Icon, title, description, href, cta
}: {
    icon: any; title: string; description: string; href?: string; cta?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-5">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                <Icon size={28} className="text-muted-foreground" />
            </div>
            <div className="space-y-1.5 max-w-xs">
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{description}</p>
            </div>
            {href && cta && (
                <Link href={href} className="h-10 px-5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                    {cta} <ArrowUpRight size={13} />
                </Link>
            )}
        </div>
    );
}

/* ── Card Wrapper ───────────────────────────────────────────────── */
export function DashCard({
    children, className
}: {
    children: React.ReactNode; className?: string;
}) {
    return (
        <div className={cn("bg-card rounded-2xl border border-border shadow-sm", className)}>
            {children}
        </div>
    );
}

/* ── Avatar Initials ────────────────────────────────────────────── */
export function AvatarInitials({
    name, size = "md", color = "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
}: {
    name?: string; size?: "sm" | "md" | "lg"; color?: string;
}) {
    const initial = (name || "?")[0]?.toUpperCase();
    const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-xl" : "w-10 h-10 text-sm";
    return (
        <div className={cn("rounded-xl flex items-center justify-center font-bold shrink-0", sz, color)}>
            {initial}
        </div>
    );
}
