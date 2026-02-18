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
    Landmark
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Reusable Stat Card for Owner
function OwnerStat({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    bgColor,
    trend
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    trend?: { value: number; isPositive: boolean };
}) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bgColor, color)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1",
                        trend.isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                    )}>
                        {trend.isPositive ? "↑" : "↓"} {trend.value}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 leading-none mb-1">{value}</h3>
                {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
            </div>
        </div>
    );
}

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

    // Logic Preserved
    const totalHostels = hostels?.length || 0;
    const totalRooms = hostels?.reduce((acc: number, h: any) => acc + (h._count?.rooms || 0), 0) || 0;
    const pendingBookings = bookings?.filter((b: any) => b.status === "PENDING_APPROVAL")?.length || 0;
    const activeBookings = bookings?.filter((b: any) => ["APPROVED", "CONFIRMED", "CHECKED_IN"].includes(b.status))?.length || 0;
    const completedBookings = bookings?.filter((b: any) => ["CHECKED_OUT", "COMPLETED"].includes(b.status))?.length || 0;

    const totalRevenue = (bookings?.filter((b: any) => ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "COMPLETED"].includes(b.status))
        ?.reduce((acc: number, b: any) => acc + (b.items?.[0]?.unitPrice * b.items?.[0]?.quantity || 0), 0) / 100) * 0.95 || 0;

    const bookingTrendData = analytics?.monthlyTrends || [];
    const bookingTrend = analytics?.trends?.bookings || 0;

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
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
            {/* Header / Intro */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                            Proprietor Hub
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 ml-2">
                            <Clock size={14} />
                            Real-time Sync Active
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Portfolio Insights <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg max-w-xl">
                        Monitor revenue metrics, manage check-ins, and optimize your listings performance.
                    </p>
                </div>

                {/* Primary Wallet Card */}
                <div className="bg-gray-900 text-white p-6 pr-10 rounded-[2.5rem] relative overflow-hidden flex items-center gap-6 shadow-2xl">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600 rounded-full -ml-16 -mt-16 blur-2xl opacity-40" />
                    <div className="relative z-10 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <Wallet size={24} className="text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Settled Balance</p>
                        <h3 className="text-3xl font-black tracking-tighter">₵{((wallet?.balance || 0) / 100).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <OwnerStat
                    title="Total Bookings"
                    value={bookings?.length || 0}
                    icon={CalendarCheck}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    trend={{ value: Math.abs(bookingTrend), isPositive: bookingTrend >= 0 }}
                />
                <OwnerStat
                    title="Attention Required"
                    value={pendingBookings}
                    subtitle="Pending Approvals"
                    icon={Clock}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <OwnerStat
                    title="Occupancy"
                    value={activeBookings}
                    subtitle="Currently Checked-in"
                    icon={Users}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <OwnerStat
                    title="Gross Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    subtitle="Lifetime Earnings (95%)"
                    icon={Landmark}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
            </div>

            {/* Visualization Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Revenue & Growth Chart (Left) */}
                <div className="lg:col-span-8 bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-gray-900">Revenue Performance</h3>
                            <p className="text-sm text-gray-500 font-medium">Visualizing your monthly earnings and growth trends.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-gray-500">6 Months</div>
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
                                )}
                            >
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
                                                    {booking.tenant.firstName?.[0] || booking.tenant.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{booking.tenant.firstName} {booking.tenant.lastName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{booking.tenant.email}</p>
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
            </div>
        </div>
    );
}
