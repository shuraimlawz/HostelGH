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

    if (hostelsLoading || bookingsLoading || analyticsLoading || walletLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Analyzing Portfolio...</p>
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
            case "PENDING_APPROVAL": return "bg-orange-50 text-orange-700 border-orange-100";
            case "APPROVED": return "bg-blue-50 text-blue-700 border-blue-100";
            case "CONFIRMED": return "bg-green-50 text-green-700 border-green-100";
            case "CHECKED_IN": return "bg-purple-50 text-purple-700 border-purple-100";
            case "CHECKED_OUT": return "bg-gray-50 text-gray-700 border-gray-100";
            case "COMPLETED": return "bg-teal-50 text-teal-700 border-teal-100";
            case "CANCELLED": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header / Portfolio Insights */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-50" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l pl-3 border-gray-200">
                            Proprietor Hub <span className="text-blue-600 ml-1">Live</span>
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Portfolio Insights <span className="text-purple-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-base">
                        Real-time performance metrics for your hostel portfolio.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Real-time Sync Active</span>
                    </div>
                    <Link
                        href="/owner/hostels/new"
                        className="bg-gray-950 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-2 group"
                    >
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" /> Add Property
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                            <TrendingUp size={20} className="text-green-500" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Assets</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.totalHostels} Hostels</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <span className="text-[10px] font-black text-purple-600 bg-purple-50/50 px-2 py-1 rounded-lg">High Demand</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Tenants</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.totalApprovedBookings} Students</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <span className="text-[10px] font-black text-orange-600 bg-orange-50/50 px-2 py-1 rounded-lg">Action Needed</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Queue Size</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.totalPendingBookings} Pending</h3>
                    </div>
                </div>

                {/* Primary Wallet Card */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                <DollarSign size={20} className="text-blue-400" />
                            </div>
                            <Link href="/owner/payouts" className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:underline">Withdraw</Link>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Settled Balance</p>
                        <h3 className="text-3xl font-black text-white tracking-tighter">₵{walletBalance.toLocaleString()}</h3>
                        <p className="text-[9px] text-gray-400 font-medium mt-4 flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-green-500" /> Auto-payout enabled
                        </p>
                    </div>
                </div>
            </div>

            {/* Analytics & Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Revenue Visualization */}
                <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-wider">Revenue Drift</h2>
                            <p className="text-xs text-gray-400 font-medium">Monthly performance across all properties.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                                <span className="text-[10px] font-black uppercase text-gray-500">Revenue</span>
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
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3B82F6"
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
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[3rem] p-8 text-white shadow-xl shadow-blue-100 flex flex-col justify-between min-h-[400px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <Building2 size={24} />
                            </div>
                            <h3 className="text-3xl font-black mb-2">My Properties</h3>
                            <p className="text-blue-100 font-medium">You are currently managing {totalHostels} hostels with {totalRooms} total units.</p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Hostels</p>
                                    <p className="text-2xl font-black">{totalHostels}</p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Rooms</p>
                                    <p className="text-2xl font-black">{totalRooms}</p>
                                </div>
                            </div>
                            <Link href="/owner/hostels" className="w-full bg-white text-blue-600 py-4 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all gap-2">
                                Manage Listings <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Booking Management</h3>
                        <p className="text-sm text-gray-500 font-medium">Handle requests and monitor check-ins.</p>
                    </div>

                    <div className="flex bg-gray-50 p-1.5 rounded-2xl">
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
                                        ? "bg-white text-blue-600 shadow-sm border border-gray-100"
                                        : "text-gray-400 hover:text-gray-600"
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {filteredBookings.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <Activity size={48} className="mx-auto text-gray-200" />
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No active bookings found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tenant</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Property / Unit</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Stay Period</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBookings.slice(0, 8).map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-sm">
                                                    {booking.user.firstName?.[0] || booking.user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{booking.user.firstName} {booking.user.lastName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{booking.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-gray-900 text-sm">{booking.hostel.name}</p>
                                            <p className="text-xs text-gray-500 font-black uppercase tracking-wider">{booking.items?.[0]?.room?.name || "Suite"}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-gray-900">
                                                {new Date(booking.items?.[0]?.startDate).toLocaleDateString()}
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Check-in Date</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border", getStatusStyles(booking.status))}>
                                                {booking.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link
                                                href={`/owner/bookings/${booking.id}`}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
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
                <div className="p-8 bg-gray-50 border-t border-gray-100">
                    <Link href="/owner/bookings" className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                        View Complete Booking Ledger <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
