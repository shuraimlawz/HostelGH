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
        totalApprovedBookings: bookings?.filter((b: any) => ["APPROVED", "CONFIRMED", "CHECKED_IN"].includes(b.status))?.length || 0,
        totalPendingBookings: bookings?.filter((b: any) => b.status === "PENDING_APPROVAL")?.length || 0,
    };

    const walletBalance = (wallet?.balance || 0) / 100;
    const bookingTrendData = analytics?.monthlyTrends || [];

    const filteredBookings = bookings?.filter((b: any) => {
        if (selectedTab === "all") return true;
        if (selectedTab === "pending") return b.status === "PENDING_APPROVAL";
        if (selectedTab === "active") return ["APPROVED", "CONFIRMED", "CHECKED_IN"].includes(b.status);
        if (selectedTab === "completed") return ["CHECKED_OUT", "COMPLETED"].includes(b.status);
        return true;
    }) || [];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING_APPROVAL": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "APPROVED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "CONFIRMED": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "CHECKED_IN": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            case "CHECKED_OUT": return "bg-muted text-muted-foreground border-border";
            case "COMPLETED": return "bg-teal-500/10 text-teal-500 border-teal-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 bg-background text-foreground transition-colors duration-300">
            {/* Header / Portfolio Insights */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-50" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-l pl-3 border-border">
                            Proprietor Hub <span className="text-primary ml-1">Live</span>
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">
                        Portfolio Insights <span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">
                        Real-time performance metrics for your hostel portfolio.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {sub?.plan === "PRO" && sub.expiresAt && (
                        <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                            <Zap size={14} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">Pro Status</span>
                            <span className="text-[10px] font-bold text-primary italic">
                                Expires {new Date(sub.expiresAt).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-card rounded-2xl border border-border shadow-sm animate-in fade-in duration-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Real-time Sync Active</span>
                    </div>
                    <Link
                        href="/owner/hostels/new"
                        className="bg-foreground text-background px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-foreground/5 flex items-center gap-2 group"
                    >
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" /> Add Property
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                            <TrendingUp size={20} className="text-green-500" />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Assets</p>
                        <h3 className="text-xl font-black text-foreground">{stats.totalHostels} Hostels</h3>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <span className="text-[10px] font-black text-purple-600 bg-purple-500/20 px-2 py-1 rounded-lg">High Demand</span>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Tenants</p>
                        <h3 className="text-xl font-black text-foreground">{stats.totalApprovedBookings} Students</h3>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-2xl flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <span className="text-[10px] font-black text-orange-600 bg-orange-500/20 px-2 py-1 rounded-lg">Action Needed</span>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Queue Size</p>
                        <h3 className="text-xl font-black text-foreground">{stats.totalPendingBookings} Pending</h3>
                    </div>
                </div>

                {/* Primary Wallet Card */}
                <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <DollarSign size={24} />
                            </div>
                            <Link href="/owner/payouts" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                                Withdraw <ArrowUpRight size={12} />
                            </Link>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 italic">Settled Balance</p>
                        <h3 className="text-2xl font-black text-foreground tracking-tighter">₵{walletBalance.toLocaleString()}</h3>
                        <p className="text-[9px] text-muted-foreground font-medium mt-4 flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-green-500" /> Auto-payout enabled
                        </p>
                    </div>
                </div>
            </div>

            {/* Analytics & Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Revenue Visualization */}
                <div className="lg:col-span-8 bg-card p-8 rounded-[2.5rem] border border-border shadow-sm relative">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-foreground italic uppercase tracking-wider">Revenue Drift</h2>
                            <p className="text-xs text-muted-foreground font-medium">Monthly performance across all properties.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Revenue</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bookingTrendData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
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
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[3rem] p-8 text-background shadow-xl shadow-primary/10 flex flex-col justify-between min-h-[400px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-background/20 rounded-2xl flex items-center justify-center mb-6">
                                <Building2 size={20} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">My Properties</h3>
                            <p className="text-background/80 font-medium text-xs">You are currently managing {totalHostels} hostels with {totalRooms} total units.</p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background/10 p-4 rounded-2xl border border-background/10">
                                    <p className="text-[10px] font-black text-background/60 uppercase tracking-widest mb-1">Hostels</p>
                                    <p className="text-2xl font-black">{totalHostels}</p>
                                </div>
                                <div className="bg-background/10 p-4 rounded-2xl border border-background/10">
                                    <p className="text-[10px] font-black text-background/60 uppercase tracking-widest mb-1">Rooms</p>
                                    <p className="text-2xl font-black">{totalRooms}</p>
                                </div>
                            </div>
                            <Link href="/owner/hostels" className="w-full bg-background text-primary py-4 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest hover:bg-background/90 transition-all gap-2">
                                Manage Listings <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Table */}
            <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm transition-colors duration-300">
                <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-black text-foreground">Booking Management</h3>
                        <p className="text-sm text-muted-foreground font-medium">Handle requests and monitor check-ins.</p>
                    </div>

                    <div className="flex bg-muted p-1.5 rounded-2xl">
                        {[
                            { key: "all", label: "All" },
                            { key: "pending", label: "Pending" },
                            { key: "active", label: "Active" }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSelectedTab(tab.key as any)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
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
                        <div className="p-20 text-center space-y-4">
                            <Activity size={48} className="mx-auto text-muted/30" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No active bookings found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tenant</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Property / Unit</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stay Period</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredBookings.slice(0, 8).map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-sm">
                                                    {booking.user.firstName?.[0] || booking.user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">{booking.user.firstName} {booking.user.lastName}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">{booking.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-foreground text-sm">{booking.hostel.name}</p>
                                            <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">{booking.items?.[0]?.room?.name || "Suite"}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-foreground">
                                                {new Date(booking.items?.[0]?.startDate).toLocaleDateString()}
                                            </div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">Check-in Date</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border", getStatusStyles(booking.status))}>
                                                {booking.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link
                                                href={`/owner/bookings/${booking.id}`}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-muted text-muted-foreground rounded-xl hover:bg-primary hover:text-background transition-all shadow-sm"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-8 bg-muted/30 border-t border-border">
                    <Link href="/owner/bookings" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                        View Complete Booking Ledger <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
