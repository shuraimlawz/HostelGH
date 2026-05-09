"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
    Building2, CalendarCheck, Users, DollarSign, PlusCircle,
    ArrowUpRight, ChevronRight, Home, Settings, BarChart3,
    Loader2, CheckCircle2, Clock, Eye, TrendingUp, MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    KpiCard, StatusBadge, SectionHeader, EmptyState,
    DashCard, Skeleton
} from "@/components/dashboard/DashComponents";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useState } from "react";

/* ── Mini Quick Link ─────────────────────────────────────────────── */
function NavTile({ href, icon: Icon, label, sub, accent }: {
    href: string; icon: any; label: string; sub: string; accent: string;
}) {
    return (
        <Link href={href} className="group flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0", accent)}>
                <Icon size={17} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{sub}</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
    );
}

/* ── Custom Tooltip ──────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-xs">
            <p className="font-bold text-muted-foreground mb-1">{label}</p>
            <p className="font-bold text-foreground text-base">₵{payload[0]?.value?.toLocaleString()}</p>
        </div>
    );
}

export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const [chartMetric, setChartMetric] = useState<"revenue" | "bookings">("revenue");

    const { data: hostels = [], isLoading: hLoading } = useQuery({
        queryKey: ["owner-hostels"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/my-hostels");
            return Array.isArray(data) ? data : (data?.data ?? []);
        }
    });

    const { data: bookings = [], isLoading: bLoading } = useQuery({
        queryKey: ["owner-bookings"],
        queryFn: async () => {
            const { data } = await api.get("/bookings/owner");
            return Array.isArray(data) ? data : [];
        }
    });

    const { data: analytics } = useQuery({
        queryKey: ["owner-analytics"],
        queryFn: async () => (await api.get("/bookings/owner/analytics")).data,
        retry: false
    });

    const isLoading = hLoading || bLoading;
    const firstName = user?.firstName || "Owner";

    const publishedHostels = (hostels as any[]).filter((h: any) => h.isPublished);
    const totalRooms = (hostels as any[]).reduce((s: number, h: any) => s + (h._count?.rooms ?? h.rooms?.length ?? 0), 0);
    const pendingBookings = (bookings as any[]).filter((b: any) => ["PENDING", "PAYMENT_SECURED"].includes(b.status));
    const activeBookings = (bookings as any[]).filter((b: any) => ["RESERVED", "CHECKED_IN"].includes(b.status));
    const totalRevenue = (bookings as any[])
        .filter((b: any) => ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(b.status))
        .reduce((s: number, b: any) => s + ((b.items ?? []).reduce((a: number, i: any) => a + (i.unitPrice * i.quantity) / 100, 0)), 0);

    const recentBookings = [...(bookings as any[])]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    // Build chart data from analytics or dummy monthly buckets
    const chartData: any[] = analytics?.monthly ?? [
        { month: "Jan", revenue: 0, bookings: 0 },
        { month: "Feb", revenue: 0, bookings: 0 },
        { month: "Mar", revenue: 0, bookings: 0 },
        { month: "Apr", revenue: 0, bookings: 0 },
        { month: "May", revenue: 0, bookings: 0 },
        { month: "Jun", revenue: 0, bookings: 0 },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 pt-16 md:pt-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Property Manager</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        Hello, {firstName} 👋
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Here's what's happening with your properties today.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/owner/hostels/new" className="h-10 px-5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-primary/20 whitespace-nowrap">
                        <PlusCircle size={14} /> Add Hostel
                    </Link>
                    <Link href="/owner/bookings" className="h-10 px-5 bg-card border border-border text-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-colors whitespace-nowrap">
                        <CalendarCheck size={14} /> Bookings
                    </Link>
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-32" />) : (<>
                    <KpiCard label="My Hostels" value={hostels.length} sub={`${publishedHostels.length} published`} icon={Building2} iconBg="bg-blue-500" />
                    <KpiCard label="Total Rooms" value={totalRooms} sub="Across all properties" icon={Home} iconBg="bg-violet-500" />
                    <KpiCard label="Active Bookings" value={activeBookings.length} sub="Currently occupied" icon={Users} iconBg="bg-emerald-500"
                        trend={activeBookings.length > 0 ? { value: `${activeBookings.length} live`, up: true } : undefined}
                    />
                    <KpiCard label="Pending Action" value={pendingBookings.length} sub="Needs review" icon={Clock} iconBg="bg-amber-500"
                        trend={pendingBookings.length > 0 ? { value: "Urgent", up: false } : undefined}
                    />
                </>)}
            </div>

            {/* ── Revenue Summary ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Revenue", val: `₵${totalRevenue.toLocaleString()}`, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                    { label: "Completed Stays", val: (bookings as any[]).filter((b: any) => b.status === "COMPLETED").length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Published Hostels", val: publishedHostels.length, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
                ].map(({ label, val, color, bg }) => (
                    <div key={label} className={cn("rounded-2xl border border-border p-5 flex items-center gap-4", bg)}>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                            <p className={cn("text-2xl font-bold", color)}>{val}</p>
                        </div>
                        <TrendingUp size={28} className={cn("opacity-20", color)} />
                    </div>
                ))}
            </div>

            {/* ── Chart + Quick Actions ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Area Chart */}
                <DashCard className="xl:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                        <div>
                            <h2 className="text-base font-bold text-foreground">Booking Performance</h2>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Monthly overview for the current year</p>
                        </div>
                        <div className="flex gap-1 p-1 bg-muted rounded-xl">
                            {(["revenue", "bookings"] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setChartMetric(m)}
                                    className={cn(
                                        "h-8 px-4 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                                        chartMetric === m
                                            ? "bg-card shadow-sm text-foreground border border-border"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >{m}</button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="ownerGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey={chartMetric}
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                fill="url(#ownerGrad)"
                                dot={false}
                                activeDot={{ r: 5, fill: "#2563eb" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </DashCard>

                {/* Quick Actions Panel */}
                <div className="space-y-4">
                    <SectionHeader title="Quick Actions" sub="Jump to key sections" />
                    <div className="space-y-2">
                        <NavTile href="/owner/hostels" icon={Building2} label="My Properties" sub={`${hostels.length} hostel(s) listed`} accent="bg-blue-500" />
                        <NavTile href="/owner/hostels/new" icon={PlusCircle} label="Add New Hostel" sub="List a new property" accent="bg-emerald-500" />
                        <NavTile href="/owner/bookings" icon={CalendarCheck} label="Manage Bookings" sub={`${pendingBookings.length} pending`} accent="bg-amber-500" />
                        <NavTile href="/owner/account" icon={Settings} label="Account & Settings" sub="Profile & preferences" accent="bg-slate-600" />
                    </div>

                    {/* Pending Alert */}
                    {pendingBookings.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Action Required</p>
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                                You have <strong>{pendingBookings.length}</strong> booking{pendingBookings.length > 1 ? "s" : ""} awaiting your confirmation.
                            </p>
                            <Link href="/owner/bookings?filter=RESERVED" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline uppercase tracking-wider">
                                Review Now <ArrowUpRight size={11} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Recent Bookings ── */}
            <div>
                <SectionHeader title="Recent Bookings" sub="Latest reservation activity" href="/owner/bookings" />
                <DashCard>
                    {isLoading ? (
                        <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
                    ) : recentBookings.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Tenant</th>
                                            <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Property</th>
                                            <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                                            <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                            <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                                            <th className="px-5 py-3.5" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recentBookings.map((b: any) => {
                                            const amt = (b.items ?? []).reduce((s: number, i: any) => s + (i.unitPrice * i.quantity) / 100, 0);
                                            return (
                                                <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 uppercase">
                                                                {b.tenant?.firstName?.[0] ?? "T"}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-foreground leading-tight">{b.tenant?.firstName} {b.tenant?.lastName}</p>
                                                                <p className="text-[11px] text-muted-foreground">{b.tenant?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-foreground text-[13px] truncate max-w-[160px]">{b.hostel?.name}</p>
                                                        <p className="text-[11px] text-muted-foreground">{b.items?.[0]?.room?.name ?? "Room"}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="font-bold text-foreground">₵{amt.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                                                    <td className="px-5 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">
                                                        {new Date(b.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Link href="/owner/bookings" className="text-primary hover:underline text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                                                            View <ArrowUpRight size={11} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-border">
                                {recentBookings.map((b: any) => {
                                    const amt = (b.items ?? []).reduce((s: number, i: any) => s + (i.unitPrice * i.quantity) / 100, 0);
                                    return (
                                        <div key={b.id} className="p-4 flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0 uppercase">
                                                {b.tenant?.firstName?.[0] ?? "T"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{b.tenant?.firstName} {b.tenant?.lastName}</p>
                                                        <p className="text-[11px] text-muted-foreground font-medium truncate">{b.hostel?.name}</p>
                                                    </div>
                                                    <StatusBadge status={b.status} />
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm font-bold text-foreground">₵{amt.toLocaleString()}</span>
                                                    <span className="text-[11px] text-muted-foreground">{new Date(b.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <EmptyState icon={CalendarCheck} title="No bookings yet" description="Once students book your hostels, they'll appear here." />
                    )}
                </DashCard>
            </div>

            {/* ── Hostel Portfolio ── */}
            <div>
                <SectionHeader title="My Properties" sub="Your listed hostels" href="/owner/hostels" linkLabel="Manage all" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading
                        ? [1,2,3].map(i => <Skeleton key={i} className="h-40" />)
                        : (hostels as any[]).slice(0, 3).map((h: any) => (
                            <DashCard key={h.id} className="p-5 flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Building2 size={20} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-foreground text-sm truncate">{h.name}</p>
                                            <p className="text-[11px] text-muted-foreground font-medium">{h.city}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={h.isPublished ? "published" : "unpublished"} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rooms</p>
                                        <p className="text-sm font-bold text-foreground">{h._count?.rooms ?? h.rooms?.length ?? 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bookings</p>
                                        <p className="text-sm font-bold text-foreground">{h._count?.bookings ?? 0}</p>
                                    </div>
                                </div>
                                <Link href={`/owner/hostels/${h.id}`} className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1">
                                    Manage <ArrowUpRight size={11} />
                                </Link>
                            </DashCard>
                        ))
                    }
                    {/* Add Hostel CTA */}
                    <Link href="/owner/hostels/new" className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <PlusCircle size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">Add New Hostel</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
