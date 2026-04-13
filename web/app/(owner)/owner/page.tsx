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
    PlusCircle,
    ChevronRight,
    Monitor
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

    if (hostelsLoading || bookingsLoading || analyticsLoading || walletLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400">Synchronizing operational data...</p>
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
            case "PENDING": return "bg-orange-50 text-orange-600 border-orange-100";
            case "PAYMENT_SECURED": return "bg-blue-50 text-blue-600 border-blue-100";
            case "RESERVED": return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case "CHECKED_IN": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "COMPLETED": return "bg-teal-50 text-teal-600 border-teal-100";
            case "CANCELLED": return "bg-red-50 text-red-600 border-red-100";
            case "DISPUTED": return "bg-rose-50 text-rose-600 border-rose-100";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proprietor Hub</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        Operational Overview
                    </h1>
                    <p className="text-gray-500 text-sm max-w-md">
                        Managing {totalHostels} Assets with {totalRooms} total units.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/owner/hostels/new" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10">
                        <PlusCircle size={16} />
                        New Property
                    </Link>
                    <Link href="/owner/payouts" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Wallet size={16} />
                        Settle Funds
                    </Link>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Assets", value: totalHostels, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", detail: `${totalRooms} Units` },
                    { label: "Active Residents", value: stats.totalApprovedBookings, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", detail: "Verified Stays" },
                    { label: "Queue", value: stats.totalPendingBookings, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", detail: "Action required" },
                    { label: "Withdraw Ready", value: `₵${walletBalance.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50", detail: "Available funds", premium: true }
                ].map((stat, i) => (
                    <div key={i} className={cn(
                        "p-6 rounded-2xl border transition-all duration-300 group",
                        stat.premium 
                           ? "bg-gray-900 text-white border-gray-900 shadow-xl" 
                           : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                                stat.premium ? "bg-white/10 text-white" : cn(stat.bg, stat.color)
                            )}>
                                <stat.icon size={20} />
                            </div>
                            <ArrowUpRight size={14} className={stat.premium ? "text-white/20" : "text-gray-200"} />
                        </div>
                        <p className={cn("text-xs font-semibold mb-1", stat.premium ? "text-gray-400" : "text-gray-500")}>{stat.label}</p>
                        <h3 className="text-2xl font-bold tracking-tight mb-1">{stat.value}</h3>
                        <p className={cn("text-[10px] font-bold uppercase tracking-tight", stat.premium ? "text-blue-400" : stat.color)}>{stat.detail}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Revenue Chart */}
                <div className="xl:col-span-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Financial Performance</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">6-Month Revenue Trajectory</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bookingTrendData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} 
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#111827', color: 'white', fontSize: '10px', fontWeight: '700', padding: '0.75rem' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#2563eb" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <div className="xl:col-span-4 bg-gray-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group border border-gray-800 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 mb-6">
                            <LayoutDashboard size={20} className="text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-2">Portfolio Stats</h3>
                        <p className="text-xs text-gray-400 font-medium">Scale your deployment with pro tools.</p>
                    </div>

                    <div className="relative z-10 space-y-6 pt-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-xl font-bold mb-0.5">{totalHostels}</p>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Hostels</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-xl font-bold mb-0.5">{totalRooms}</p>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Units</p>
                            </div>
                        </div>
                        <Link href="/owner/hostels" className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all text-center flex items-center justify-center gap-2">
                            Manage Assets <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bookings Ledger */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Booking Ledger</h2>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Real-time occupation data</p>
                    </div>

                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {[
                            { key: "all", label: "Global" },
                            { key: "pending", label: "Action" },
                            { key: "active", label: "Live" }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSelectedTab(tab.key as any)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    selectedTab === tab.key
                                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                                        : "text-gray-400 hover:text-gray-900"
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {filteredBookings.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <Activity size={32} className="mx-auto text-gray-200" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No records found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resident</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Term</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBookings.slice(0, 10).map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-gray-50/30 transition-colors group/row text-sm">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-xs">
                                                    {booking.user.firstName?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 truncate max-w-[150px]">{booking.user.firstName} {booking.user.lastName}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{booking.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-900">{booking.hostel.name}</p>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase">{booking.items?.[0]?.room?.name || "Suite"}</p>
                                        </td>
                                        <td className="px-8 py-6 text-gray-500 font-medium">
                                            {new Date(booking.items?.[0]?.startDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn("px-3 py-1 rounded-md text-[9px] font-bold uppercase border", getStatusStyles(booking.status))}>
                                                {booking.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link
                                                href={`/owner/bookings/${booking.id}`}
                                                className="inline-flex items-center justify-center w-9 h-9 border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-8 bg-gray-50/50 text-center border-t border-gray-50">
                    <Link href="/owner/bookings" className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center justify-center gap-2 group">
                        Browse Full Ledger <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
