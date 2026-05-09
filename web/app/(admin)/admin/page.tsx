"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import {
    Users, Building2, CalendarCheck, DollarSign, ShieldCheck,
    CheckCircle2, XCircle, ArrowUpRight, Loader2, ChevronRight,
    Globe, Activity, AlertTriangle, BarChart3, Settings,
    UserCheck, Clock, TrendingUp, Eye, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import {
    KpiCard, StatusBadge, SectionHeader, EmptyState,
    DashCard, Skeleton, AvatarInitials
} from "@/components/dashboard/DashComponents";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

/* ── Admin Quick Nav ─────────────────────────────────────────────── */
function AdminNavCard({ href, icon: Icon, label, count, accent }: {
    href: string; icon: any; label: string; count?: number | string; accent: string;
}) {
    return (
        <Link href={href} className="group flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0", accent)}>
                <Icon size={17} className="text-white" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{label}</p>
                {count !== undefined && <p className="text-[11px] text-muted-foreground font-medium">{count} total</p>}
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
    );
}

export default function AdminDashboardPage() {
    const queryClient = useQueryClient();
    const [chartMetric, setChartMetric] = useState<"revenue" | "bookings">("revenue");

    const { data: stats, isLoading: sLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => (await api.get("/admin/stats")).data
    });

    const { data: financials } = useQuery({
        queryKey: ["admin-financials"],
        queryFn: async () => (await api.get("/admin/financials")).data,
        retry: false
    });

    const { data: verificationQueue = [], isLoading: qLoading } = useQuery({
        queryKey: ["admin-verification-queue"],
        queryFn: async () => {
            const { data } = await api.get("/admin/verification-queue");
            return Array.isArray(data) ? data : (data?.data ?? []);
        }
    });

    const { data: disputes = [], isLoading: dLoading } = useQuery({
        queryKey: ["admin-disputes"],
        queryFn: async () => {
            const { data } = await api.get("/admin/disputes");
            return Array.isArray(data) ? data : (data?.data ?? []);
        },
        retry: false
    });

    const { data: recentActivity = [] } = useQuery({
        queryKey: ["admin-activity"],
        queryFn: async () => {
            const { data } = await api.get("/admin/activity");
            return Array.isArray(data) ? data : (data?.data ?? []);
        },
        retry: false
    });

    const verifyMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/admin/hostels/${id}/verify`),
        onSuccess: () => {
            toast.success("Hostel verified and published");
            queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: () => toast.error("Verification failed")
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/admin/hostels/${id}/reject`),
        onSuccess: () => {
            toast.success("Hostel rejected");
            queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
        },
        onError: () => toast.error("Rejection failed")
    });

    const isLoading = sLoading;

    // Chart data
    const chartData = financials?.monthly ?? [
        { month: "Jan", revenue: 0, bookings: 0 },
        { month: "Feb", revenue: 0, bookings: 0 },
        { month: "Mar", revenue: 0, bookings: 0 },
        { month: "Apr", revenue: 0, bookings: 0 },
        { month: "May", revenue: 0, bookings: 0 },
        { month: "Jun", revenue: 0, bookings: 0 },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 pt-16 lg:pt-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Admin Control Center</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Platform Overview</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage users, hostels, bookings, and platform health.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link href="/admin/hostels" className="h-10 px-5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-primary/20 whitespace-nowrap">
                        <Building2 size={14} /> Hostels
                    </Link>
                    <Link href="/admin/users" className="h-10 px-5 bg-card border border-border text-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-colors whitespace-nowrap">
                        <Users size={14} /> Users
                    </Link>
                </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {isLoading ? [1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />) : (<>
                    <KpiCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} iconBg="bg-blue-500" />
                    <KpiCard label="Hostels" value={stats?.totalHostels ?? 0} icon={Building2} iconBg="bg-violet-500" />
                    <KpiCard label="Bookings" value={stats?.totalBookings ?? 0} icon={CalendarCheck} iconBg="bg-emerald-500" />
                    <KpiCard label="Revenue" value={`₵${((stats?.totalRevenue ?? 0) / 100).toLocaleString()}`} icon={DollarSign} iconBg="bg-amber-500" />
                    <KpiCard label="Pending" value={verificationQueue.length} icon={Clock} iconBg="bg-orange-500"
                        trend={verificationQueue.length > 0 ? { value: "Review", up: false } : undefined}
                    />
                    <KpiCard label="Disputes" value={(disputes as any[]).length} icon={AlertTriangle} iconBg="bg-red-500"
                        trend={(disputes as any[]).length > 0 ? { value: "Active", up: false } : undefined}
                    />
                </>)}
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue="overview">
                <TabsList className="bg-muted p-1 rounded-xl h-auto gap-1 flex-wrap">
                    {[
                        { val: "overview", label: "Overview" },
                        { val: "approvals", label: `Approvals${verificationQueue.length ? ` (${verificationQueue.length})` : ""}` },
                        { val: "disputes", label: `Disputes${(disputes as any[]).length ? ` (${(disputes as any[]).length})` : ""}` },
                        { val: "users", label: "Users" },
                        { val: "hostels", label: "Hostels" },
                    ].map(t => (
                        <TabsTrigger key={t.val} value={t.val} className="rounded-lg text-xs font-bold uppercase tracking-wider px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            {t.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* ── Overview Tab ── */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Chart */}
                        <DashCard className="xl:col-span-2 p-6">
                            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-base font-bold text-foreground">Platform Revenue</h2>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Monthly financial performance</p>
                                </div>
                                <div className="flex gap-1 p-1 bg-muted rounded-xl">
                                    {(["revenue", "bookings"] as const).map(m => (
                                        <button key={m} onClick={() => setChartMetric(m)}
                                            className={cn("h-8 px-4 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                                                chartMetric === m ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
                                            )}>{m}</button>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey={chartMetric} stroke="#2563eb" strokeWidth={2.5} fill="url(#adminGrad)" dot={false} activeDot={{ r: 5, fill: "#2563eb" }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </DashCard>

                        {/* Admin Links + Activity */}
                        <div className="space-y-4">
                            <SectionHeader title="Admin Sections" />
                            <div className="space-y-2">
                                <AdminNavCard href="/admin/users" icon={Users} label="User Management" count={stats?.totalUsers} accent="bg-blue-500" />
                                <AdminNavCard href="/admin/hostels" icon={Building2} label="Hostel Audit" count={stats?.totalHostels} accent="bg-violet-500" />
                                <AdminNavCard href="/admin/bookings" icon={CalendarCheck} label="All Bookings" count={stats?.totalBookings} accent="bg-emerald-500" />
                                <AdminNavCard href="/admin/payments" icon={DollarSign} label="Payments" accent="bg-amber-500" />
                                <AdminNavCard href="/admin/stats" icon={BarChart3} label="Analytics" accent="bg-indigo-500" />
                                <AdminNavCard href="/admin/settings" icon={Settings} label="Platform Settings" accent="bg-slate-600" />
                            </div>
                        </div>
                    </div>

                    {/* Platform Health */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Verified Hostels", val: stats?.verifiedHostels ?? 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                            { label: "Active Students", val: stats?.activeStudents ?? stats?.totalStudents ?? 0, icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
                            { label: "Platform Revenue", val: `₵${((stats?.totalRevenue ?? 0) / 100).toLocaleString()}`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
                        ].map(({ label, val, icon: Icon, color, bg }) => (
                            <div key={label} className={cn("rounded-2xl border border-border p-5 flex items-center gap-4", bg)}>
                                <Icon size={28} className={cn("opacity-30 shrink-0", color)} />
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                                    <p className={cn("text-2xl font-bold", color)}>{val}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* ── Approvals Tab ── */}
                <TabsContent value="approvals" className="mt-6">
                    <SectionHeader title="Hostel Verification Queue" sub="Review and approve new property submissions" />
                    {qLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}
                        </div>
                    ) : (verificationQueue as any[]).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(verificationQueue as any[]).map((h: any) => (
                                <DashCard key={h.id} className="p-5 flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <AvatarInitials name={h.owner?.firstName} color="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-foreground text-sm truncate">{h.name}</p>
                                                <p className="text-[11px] text-muted-foreground">{h.city}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 uppercase tracking-wider shrink-0">Pending</span>
                                    </div>

                                    <div className="space-y-1.5 text-[11px] text-muted-foreground font-medium">
                                        <p><span className="font-bold text-foreground">Owner:</span> {h.owner?.firstName} {h.owner?.lastName}</p>
                                        <p><span className="font-bold text-foreground">Address:</span> {h.addressLine || h.city}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                                        <button
                                            onClick={() => verifyMutation.mutate(h.id)}
                                            disabled={verifyMutation.isPending}
                                            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                                        >
                                            {verifyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => { if (confirm(`Reject "${h.name}"?`)) rejectMutation.mutate(h.id); }}
                                            disabled={rejectMutation.isPending}
                                            className="h-9 bg-card border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                                        >
                                            <XCircle size={12} /> Reject
                                        </button>
                                    </div>

                                    <Link href={`/admin/hostels/${h.id}`} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
                                        Full Audit <ArrowUpRight size={11} />
                                    </Link>
                                </DashCard>
                            ))}
                        </div>
                    ) : (
                        <DashCard>
                            <EmptyState icon={CheckCircle2} title="No pending approvals" description="All hostel submissions have been reviewed. You're up to date." />
                        </DashCard>
                    )}
                </TabsContent>

                {/* ── Disputes Tab ── */}
                <TabsContent value="disputes" className="mt-6">
                    <SectionHeader title="Active Disputes" sub="Booking disputes requiring admin mediation" />
                    {dLoading ? (
                        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
                    ) : (disputes as any[]).length > 0 ? (
                        <DashCard>
                            <div className="divide-y divide-border">
                                {(disputes as any[]).map((d: any) => (
                                    <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                                                <AlertTriangle size={16} className="text-red-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Booking #{d.bookingId?.slice(-8)}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium">{d.reason ?? "No reason provided"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <StatusBadge status={d.status ?? "PENDING"} />
                                            <Link href={`/admin/bookings/${d.bookingId}`} className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1">
                                                Resolve <ArrowUpRight size={11} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DashCard>
                    ) : (
                        <DashCard>
                            <EmptyState icon={CheckCircle2} title="No active disputes" description="All booking disputes have been resolved." />
                        </DashCard>
                    )}
                </TabsContent>

                {/* ── Users Tab ── */}
                <TabsContent value="users" className="mt-6">
                    <div className="flex items-center justify-between mb-5">
                        <SectionHeader title="User Management" sub="All registered platform users" />
                        <Link href="/admin/users" className="h-9 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                            Manage All <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {[
                            { label: "Total Users", val: stats?.totalUsers ?? 0, color: "bg-blue-500", icon: Users },
                            { label: "Property Owners", val: stats?.totalOwners ?? 0, color: "bg-violet-500", icon: Building2 },
                            { label: "Students", val: stats?.totalStudents ?? stats?.totalTenants ?? 0, color: "bg-emerald-500", icon: UserCheck },
                        ].map(({ label, val, color, icon: Icon }) => (
                            <KpiCard key={label} label={label} value={val} icon={Icon} iconBg={color} />
                        ))}
                    </div>
                    <DashCard className="p-5">
                        <p className="text-sm text-muted-foreground font-medium text-center py-4">
                            Visit the <Link href="/admin/users" className="text-primary font-bold hover:underline">User Management page</Link> to search, filter, and manage all users.
                        </p>
                    </DashCard>
                </TabsContent>

                {/* ── Hostels Tab ── */}
                <TabsContent value="hostels" className="mt-6">
                    <div className="flex items-center justify-between mb-5">
                        <SectionHeader title="Hostel Management" sub="All listed properties on the platform" />
                        <Link href="/admin/hostels" className="h-9 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                            Full Audit <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {[
                            { label: "Total Hostels", val: stats?.totalHostels ?? 0, color: "bg-blue-500", icon: Building2 },
                            { label: "Published", val: stats?.verifiedHostels ?? 0, color: "bg-emerald-500", icon: Globe },
                            { label: "Pending Review", val: verificationQueue.length, color: "bg-amber-500", icon: Clock },
                        ].map(({ label, val, color, icon: Icon }) => (
                            <KpiCard key={label} label={label} value={val} icon={Icon} iconBg={color}
                                trend={label === "Pending Review" && val > 0 ? { value: "Needs action", up: false } : undefined}
                            />
                        ))}
                    </div>
                    <DashCard className="p-5">
                        <p className="text-sm text-muted-foreground font-medium text-center py-4">
                            Visit the <Link href="/admin/hostels" className="text-primary font-bold hover:underline">Hostel Audit page</Link> to review, approve, and manage all properties.
                        </p>
                    </DashCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
