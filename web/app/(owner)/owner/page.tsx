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
            <div className="flex h-[80vh] items-center justify-center bg-white transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Synchronizing Data Streams...</p>
                </div>
            </div>
        );
    }

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
            case "PENDING": return "bg-orange-500/5 text-orange-600 border-orange-500/10";
            case "PAYMENT_SECURED": return "bg-blue-500/5 text-blue-600 border-blue-500/10";
            case "RESERVED": return "bg-indigo-500/5 text-indigo-600 border-indigo-500/10";
            case "CHECKED_IN": return "bg-emerald-500/5 text-emerald-600 border-emerald-500/10";
            case "COMPLETED": return "bg-teal-500/5 text-teal-600 border-teal-500/10";
            case "CANCELLED": return "bg-red-500/5 text-red-600 border-red-500/10";
            case "DISPUTED": return "bg-rose-500/5 text-rose-600 border-rose-500/10";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="max-w-[1500px] mx-auto space-y-12 pb-20 pt-6">
            {/* Hero Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-primary/20">
                            Proprietor Hub
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Live Operations</span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">
                        Operational <span className="text-primary NOT-italic opacity-50">Insights</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-md">
                        Managing {totalHostels} Assets with {totalRooms} total units. Real-time synchronisation engaged.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Link href="/owner/hostels/new" className="px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center gap-3 group shadow-xl">
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                        Deploy New Property
                    </Link>
                    <Link href="/owner/payouts" className="px-8 py-4 bg-white border-2 border-black text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all flex items-center gap-3 group shadow-lg">
                        <Wallet size={16} />
                        Settle Funds
                    </Link>
                </div>
            </div>

            {/* Premium Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: "Total Assets", value: `${totalHostels} Hostels`, icon: Building2, color: "primary", detail: `${totalRooms} Units` },
                    { label: "Active Stays", value: stats.totalApprovedBookings, icon: Users, color: "emerald", detail: "Verified Students" },
                    { label: "In-Queue", value: stats.totalPendingBookings, icon: Clock, color: "orange", detail: "Need Approval" },
                    { label: "Settled Balance", value: `₵${walletBalance.toLocaleString()}`, icon: DollarSign, color: "primary", detail: "Withdraw Ready", premium: true }
                ].map((stat, i) => (
                    <div key={i} className={cn(
                        "group p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-1 relative overflow-hidden",
                        stat.premium 
                           ? "bg-black text-white border-black shadow-2xl shadow-black/20" 
                           : "bg-white border-muted shadow-sm hover:shadow-xl hover:border-primary/20"
                    )}>
                        {!stat.premium && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-3xl opacity-0 group-hover:opacity-100" />}
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 duration-500 shadow-inner",
                                    stat.premium ? "bg-white/10 text-white border border-white/10" : "bg-primary/5 text-primary border border-primary/10"
                                )}>
                                    <stat.icon size={24} />
                                </div>
                                <ArrowUpRight size={16} className={stat.premium ? "text-white/40" : "text-muted/30"} />
                            </div>
                            <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1", stat.premium ? "text-white/50" : "text-muted-foreground")}>{stat.label}</p>
                            <h3 className="text-3xl font-black tracking-tighter mb-1">{stat.value}</h3>
                            <p className={cn("text-[9px] font-bold uppercase tracking-widest italic leading-none", stat.premium ? "text-primary/80" : "text-primary")}>{stat.detail}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics & Drift Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Revenue Visualization */}
                <div className="xl:col-span-8 bg-white p-10 rounded-[3rem] border border-muted shadow-sm flex flex-col space-y-10 group">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight italic">Financial Drift <span className="text-primary NOT-italic">.</span></h2>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">6-Month Revenue Trajectory</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-full px-4 border border-muted">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                             <span className="text-[9px] font-black uppercase text-foreground tracking-widest">Live Sync</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bookingTrendData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900 }} 
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1.5rem', border: '1px solid hsl(var(--border))', backgroundColor: 'black', color: 'white', textTransform: 'uppercase', fontSize: '10px', fontWeight: '900', padding: '1rem' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vertical Management Section (Right) */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Property Summary Card */}
                    <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group/card flex-1 flex flex-col justify-between border border-white/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover/card:scale-110 transition-transform duration-1000" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-8 backdrop-blur-md">
                                <LayoutDashboard size={24} className="text-primary" />
                            </div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2 leading-none">Global <br/>Portfolio</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Scale your deployment with pro tools.</p>
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                                    <p className="text-2xl font-black mb-1">{totalHostels}</p>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest italic">Hostels</p>
                                </div>
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                                    <p className="text-2xl font-black mb-1">{totalRooms}</p>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest italic">Total Rooms</p>
                                </div>
                            </div>
                            <Link href="/owner/hostels" className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all text-center flex items-center justify-center gap-3">
                                PROPERTY HUB <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Drift / Ledger */}
            <div className="bg-white rounded-[3.5rem] border border-muted shadow-sm overflow-hidden flex flex-col group">
                <div className="p-10 border-b border-muted flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic leading-none">Booking Drift <span className="text-primary NOT-italic">.</span></h2>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Real-time occupation ledger</p>
                    </div>

                    <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-muted group-hover:border-primary/20 transition-colors">
                        {[
                            { key: "all", label: "All Events" },
                            { key: "pending", label: "Action" },
                            { key: "active", label: "Resident" }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSelectedTab(tab.key as any)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    selectedTab === tab.key
                                        ? "bg-black text-white shadow-xl"
                                        : "text-muted-foreground hover:text-black"
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {filteredBookings.length === 0 ? (
                        <div className="p-20 text-center space-y-6">
                            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto opacity-20">
                                <Activity size={40} />
                            </div>
                            <p className="text-muted-foreground font-black uppercase tracking-[0.5em] text-[11px]">No Operational Data Found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-muted">
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic pr-4">Identity</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Deployment</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Duration</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Status</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic pl-4">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-muted/30">
                                {filteredBookings.slice(0, 10).map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-muted/10 transition-colors group/row">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-[13px] border border-black/10 shadow-lg group-hover/row:scale-105 transition-transform">
                                                    {booking.user.firstName?.[0] || booking.user.email[0].toUpperCase()}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-foreground text-[13px] uppercase tracking-tight">{booking.user.firstName} {booking.user.lastName}</p>
                                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{booking.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="font-black text-foreground text-[14px] uppercase tracking-tighter leading-none mb-1">{booking.hostel.name}</p>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] italic">{booking.items?.[0]?.room?.name || "Premium Suite"}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-[13px] font-black text-foreground mb-0.5">
                                                {new Date(booking.items?.[0]?.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Check-in Engagement</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm", getStatusStyles(booking.status))}>
                                                {booking.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <Link
                                                href={`/owner/bookings/${booking.id}`}
                                                className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-2xl hover:bg-primary transition-all shadow-xl group/btn"
                                            >
                                                <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-10 bg-muted/20 text-center">
                    <Link href="/owner/bookings" className="inline-flex items-center gap-3 text-[11px] font-black text-foreground uppercase tracking-[0.4em] hover:text-primary transition-colors group">
                        ACCESS COMPLETE OPERATIONAL ARCHIVE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
