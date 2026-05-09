"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, BarChart3, Users, Building2, TrendingUp, DollarSign, CalendarCheck } from "lucide-react";
import { KpiCard, DashCard, SectionHeader, Skeleton } from "@/components/dashboard/DashComponents";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-xs">
            <p className="font-bold text-muted-foreground mb-1">{label}</p>
            <p className="font-bold text-foreground text-base">{payload[0]?.value?.toLocaleString()}</p>
        </div>
    );
}

export default function AdminStatsPage() {
    const { data: stats, isLoading: sLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => (await api.get("/admin/stats")).data
    });

    const { data: analytics, isLoading: aLoading } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: async () => (await api.get("/admin/analytics")).data,
        retry: false
    });

    const isLoading = sLoading || aLoading;
    const monthly = analytics?.monthlyData ?? [];

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 pt-16 lg:pt-6 space-y-6">

            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform Analytics</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Statistics & Insights</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1">Detailed metrics and platform performance overview.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {isLoading ? [1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />) : (<>
                    <KpiCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} iconBg="bg-blue-500"
                        trend={stats?.trends?.users != null ? { value: `${Math.abs(stats.trends.users)}%`, up: stats.trends.users >= 0 } : undefined}
                    />
                    <KpiCard label="Live Hostels" value={stats?.liveHostels ?? stats?.verifiedHostels ?? 0} icon={Building2} iconBg="bg-violet-500" />
                    <KpiCard label="Total Bookings" value={stats?.totalBookings ?? stats?.bookings ?? 0} icon={CalendarCheck} iconBg="bg-emerald-500"
                        trend={stats?.trends?.bookings != null ? { value: `${Math.abs(stats.trends.bookings)}%`, up: stats.trends.bookings >= 0 } : undefined}
                    />
                    <KpiCard label="Revenue" value={`₵${((stats?.totalRevenue ?? stats?.revenue ?? 0) / 100).toLocaleString()}`} icon={DollarSign} iconBg="bg-amber-500" />
                    <KpiCard label="Owners" value={stats?.totalOwners ?? 0} icon={Building2} iconBg="bg-indigo-500" />
                    <KpiCard label="Students" value={stats?.totalStudents ?? stats?.totalTenants ?? 0} icon={Users} iconBg="bg-rose-500" />
                </>)}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <DashCard className="p-6">
                    <SectionHeader title="User Growth" sub="Monthly registered users trend" />
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={monthly} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2.5} fill="url(#userGrad)" dot={false} activeDot={{ r: 5, fill: "#2563eb" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </DashCard>

                <DashCard className="p-6">
                    <SectionHeader title="Revenue Trends" sub="Monthly revenue in GHS" />
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={monthly} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </DashCard>
            </div>

            {/* Booking Trends */}
            <DashCard className="p-6">
                <SectionHeader title="Booking Volume" sub="Monthly booking activity across all hostels" />
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthly} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#bookGrad)" dot={false} activeDot={{ r: 5, fill: "#8b5cf6" }} />
                    </AreaChart>
                </ResponsiveContainer>
            </DashCard>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Avg. Bookings/Month", val: monthly.length ? Math.round(monthly.reduce((s: number, m: any) => s + (m.bookings ?? 0), 0) / monthly.length) : 0, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20" },
                    { label: "Avg. Revenue/Month", val: `₵${monthly.length ? Math.round(monthly.reduce((s: number, m: any) => s + (m.revenue ?? 0), 0) / monthly.length / 100).toLocaleString() : 0}`, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" },
                    { label: "Avg. New Users/Month", val: monthly.length ? Math.round(monthly.reduce((s: number, m: any) => s + (m.users ?? 0), 0) / monthly.length) : 0, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" },
                ].map(({ label, val, color, bg }) => (
                    <div key={label} className={`rounded-2xl border p-5 flex items-center gap-4 ${bg}`}>
                        <TrendingUp size={28} className={`${color} opacity-25 shrink-0`} />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                            <p className={`text-2xl font-bold ${color}`}>{val}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
