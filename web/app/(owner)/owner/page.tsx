"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Building2,
    CalendarCheck,
    Users,
    Clock,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    DollarSign,
    CheckCircle2,
    Eye,
    LucideIcon,
    Wallet,
    ArrowRight,
    LayoutDashboard,
    Activity,
    Landmark,
    PlusCircle,
    Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function OwnerDashboardPage() {
    const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "active" | "completed">("all");

    const { data: hostels, isLoading: hostelsLoading } = useQuery({
        queryKey: ["owner-hostels"],
        queryFn: async () => {
            const res = await api.get("/hostels/my-hostels");
            return res.data;
        }
    });

    const { data: bookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ["owner-bookings"],
        queryFn: async () => {
            const res = await api.get("/bookings/owner");
            return res.data;
        }
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ["owner-analytics"],
        queryFn: async () => {
            const res = await api.get("/bookings/owner/analytics");
            return res.data;
        }
    });

    const { data: wallet, isLoading: walletLoading } = useQuery({
        queryKey: ["owner-wallet"],
        queryFn: async () => {
            const res = await api.get("/wallets/me");
            return res.data;
        }
    });

    const { data: sub, isLoading: subLoading } = useQuery({
        queryKey: ["my-subscription"],
        queryFn: async () => {
            const res = await api.get("/subscriptions/my");
            return res.data;
        }
    });

    if (hostelsLoading || bookingsLoading || analyticsLoading || walletLoading || subLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-background transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Analyzing Portfolio...</p>
                </div>
            </div>
        );
    }

    // Modernized logic
    const totalHostels = hostels?.length || 0;
    const totalRooms = hostels?.reduce((acc: number, h: any) => acc + (h._count?.rooms || 0), 0) || 0;

    const stats = {
        totalHostels,
        totalApprovedBookings: bookings?.filter((b: any) => ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(b.status))?.length || 0,
        totalPendingBookings: bookings?.filter((b: any) => ["PENDING", "PAYMENT_SECURED"].includes(b.status))?.length || 0,
    };

    const walletBalance = (wallet?.balance || 0) / 100;
    const bookingTrendData = analytics?.monthlyTrends || [];

    const filteredBookings = bookings?.filter((b: any) => {
        if (selectedTab === "all") return true;
        if (selectedTab === "pending") return ["PENDING", "PAYMENT_SECURED"].includes(b.status);
        if (selectedTab === "active") return ["RESERVED", "CHECKED_IN", "DISPUTED"].includes(b.status);
        if (selectedTab === "completed") return b.status === "COMPLETED";
        return true;
    }) || [];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "PAYMENT_SECURED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "RESERVED": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
            case "CHECKED_IN": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            case "COMPLETED": return "bg-teal-500/10 text-teal-500 border-teal-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "DISPUTED": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-10 bg-background text-foreground transition-colors duration-300">
            {/* Header / Portfolio Insights */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-sm border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-primary/20" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-l pl-3 border-border">
                            Proprietor Hub <span className="text-primary ml-1">Live</span>
                        </span>
                    </div>
                    <h1 className="text-xl font-black text-foreground tracking-tight uppercase italic">
                        Portfolio Insights <span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase">
                        Real-time performance metrics.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!subLoading && sub?.plan === "PRO" && (
                        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-sm border border-primary/10">
                            <Zap size={12} className="text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Pro Status</span>
                        </div>
                    )}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-sm border border-border/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Sync Active</span>
                    </div>
                    <Link
                        href="/owner/hostels/new"
                        className="bg-foreground text-background px-4 py-2 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-all flex items-center gap-2 group"
                    >
                        <PlusCircle size={14} className="group-hover:rotate-90 transition-transform" /> Add Property
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-lg border border-border transition-all hover:border-primary/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                            <Building2 size={20} />
                        </div>
                        <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Total Assets</p>
                    <h3 className="text-lg font-black text-foreground">{stats.totalHostels} Hostels</h3>
                </div>

                <div className="bg-card p-5 rounded-lg border border-border transition-all hover:border-primary/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-purple-500/10 text-purple-600 rounded-md flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <span className="text-[8px] font-black text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-widest leading-none">High Demand</span>
                    </div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Active Tenants</p>
                    <h3 className="text-lg font-black text-foreground">{stats.totalApprovedBookings} Students</h3>
                </div>

                <div className="bg-card p-5 rounded-lg border border-border transition-all hover:border-primary/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-orange-500/10 text-orange-600 rounded-md flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                        <span className="text-[8px] font-black text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-widest leading-none">Action</span>
                    </div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Queue Size</p>
                    <h3 className="text-lg font-black text-foreground">{stats.totalPendingBookings} Pending</h3>
                </div>

                <div className="bg-card p-5 rounded-lg border border-primary/20 bg-primary/[0.02] transition-all hover:border-primary/40 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <Link href="/owner/payouts" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                            Withdraw <ArrowUpRight size={10} />
                        </Link>
                    </div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 italic">Settled Balance</p>
                    <h3 className="text-xl font-black text-foreground tracking-tighter">₵{walletBalance.toLocaleString()}</h3>
                </div>
            </div>

            {/* Analytics & Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Revenue Visualization */}
                <div className="lg:col-span-8 bg-card p-6 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-0.5">
                            <h2 className="text-sm font-black text-foreground uppercase tracking-wider italic">Revenue Drift</h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Monthly Performance</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Revenue</span>
                        </div>
                    </div>

                    <div className="h-[280px] w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bookingTrendData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontWeight: 900 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontWeight: 900 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '0.4rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', fontSize: '10px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Portfolio Summary (Right) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-foreground rounded-lg p-6 text-background shadow-md min-h-[370px] flex flex-col justify-between border border-border overflow-hidden group">
                        <div>
                            <div className="w-10 h-10 bg-background/10 rounded-md flex items-center justify-center mb-4">
                                <Building2 size={18} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight mb-1">My Portfolio</h3>
                            <p className="text-background/60 font-medium text-[10px] uppercase tracking-widest">Managing {totalHostels} Assets • {totalRooms} Units</p>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-background/5 p-4 rounded-md border border-background/10">
                                    <p className="text-[8px] font-black text-background/40 uppercase tracking-widest mb-1">Hostels</p>
                                    <p className="text-2xl font-black">{totalHostels}</p>
                                </div>
                                <div className="bg-background/5 p-4 rounded-md border border-background/10">
                                    <p className="text-[8px] font-black text-background/40 uppercase tracking-widest mb-1">Rooms</p>
                                    <p className="text-2xl font-black">{totalRooms}</p>
                                </div>
                            </div>
                            <Link href="/owner/hostels" className="w-full bg-background text-foreground py-3.5 rounded-sm flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] hover:bg-background/90 transition-all gap-2">
                                Manage <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest leading-none mb-1">Booking Ledger</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Real-time occupancy management</p>
                    </div>

                    <div className="flex bg-muted p-1 rounded-md">
                        {[
                            { key: "all", label: "All" },
                            { key: "pending", label: "Pending" },
                            { key: "active", label: "Live" }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSelectedTab(tab.key as any)}
                                className={cn(
                                    "px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all",
                                    selectedTab === tab.key
                                        ? "bg-background text-primary shadow-sm border border-border"
                                        : "text-muted-foreground hover:text-foreground"
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {filteredBookings.length === 0 ? (
                        <div className="p-12 text-center space-y-4">
                            <Activity size={32} className="mx-auto text-muted/30" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No active bookings</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="px-6 py-3 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tenant</th>
                                    <th className="px-6 py-3 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Property / Unit</th>
                                    <th className="px-6 py-3 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Stay Info</th>
                                    <th className="px-6 py-3 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3 text-right text-[9px] font-black text-muted-foreground uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredBookings.slice(0, 8).map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-sm flex items-center justify-center font-black text-xs">
                                                    {booking.user.firstName?.[0] || booking.user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground text-xs uppercase tracking-tight">{booking.user.firstName} {booking.user.lastName}</p>
                                                    <p className="text-[9px] text-muted-foreground font-bold">{booking.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-foreground text-xs uppercase tracking-tight">{booking.hostel.name}</p>
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{booking.items?.[0]?.room?.name || "Suite"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-black text-foreground">
                                                {new Date(booking.items?.[0]?.startDate).toLocaleDateString()}
                                            </div>
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Check-in</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border", getStatusStyles(booking.status))}>
                                                {booking.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/owner/bookings/${booking.id}`}
                                                className="inline-flex items-center justify-center w-8 h-8 bg-muted text-muted-foreground rounded-sm hover:bg-foreground hover:text-background transition-all shadow-sm"
                                            >
                                                <Eye size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-6 bg-muted/20 border-t border-border">
                    <Link href="/owner/bookings" className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                        View Complete Ledger <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
