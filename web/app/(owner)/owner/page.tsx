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
    BarChart3,
    Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function StatCard({ 
    label, 
    value, 
    icon: Icon, 
    color, 
    bgColor, 
    detail, 
    premium 
}: { 
    label: string, 
    value: string | number, 
    icon: LucideIcon, 
    color: string, 
    bgColor: string, 
    detail: string, 
    premium?: boolean 
}) {
    return (
        <div className={cn(
            "p-6 rounded-2xl border transition-all duration-300 group overflow-hidden relative",
            premium 
               ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200" 
               : "bg-white dark:bg-gray-900 border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
        )}>
            {premium && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-gray-100/10",
                    premium ? "bg-white dark:bg-gray-900/10 text-white" : cn(bgColor, color)
                )}>
                    <Icon size={22} />
                </div>
                <ArrowUpRight size={14} className={premium ? "text-white/20" : "text-gray-200 group-hover:text-blue-500 transition-colors"} />
            </div>
            <div className="relative z-10">
                <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", premium ? "text-gray-400 dark:text-gray-500" : "text-gray-400 dark:text-gray-500")}>{label}</p>
                <h3 className="text-2xl font-bold tracking-tight mb-1">{value}</h3>
                <p className={cn("text-[9px] font-bold uppercase tracking-widest opacity-80", premium ? "text-blue-400" : color)}>{detail}</p>
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



    if (hostelsLoading || bookingsLoading || analyticsLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const totalHostels = hostels?.length || 0;
    const totalRooms = hostels?.reduce((acc: number, h: any) => acc + (h._count?.rooms || 0), 0) || 0;

    const statsOverview = {
        totalHostels,
        totalApprovedBookings: bookings?.filter((b: any) => ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(b.status))?.length || 0,
        totalPendingBookings: bookings?.filter((b: any) => ["PENDING", "PAYMENT_SECURED"].includes(b.status))?.length || 0,
    };


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
            default: return "bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 dark:text-gray-500 border-gray-100";
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-16 md:pt-4 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Open Access Launch</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Owner Dashboard</h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm max-w-md font-medium">Managing {totalHostels} Hostels with {totalRooms} total rooms.</p>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                            <Zap size={12} className="fill-emerald-600" /> 0% Platform Commission Enabled
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/owner/hostels/new" className="h-10 px-5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95">
                        <PlusCircle size={16} /> Add Hostel
                    </Link>

                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Total Hostels" 
                    value={totalHostels} 
                    icon={Building2} 
                    color="text-blue-600" 
                    bgColor="bg-blue-50" 
                    detail={`${totalRooms} Total Rooms`} 
                />
                <StatCard 
                    label="Active Bookings" 
                    value={statsOverview.totalApprovedBookings} 
                    icon={Users} 
                    color="text-emerald-600" 
                    bgColor="bg-emerald-50" 
                    detail="Confirmed stays" 
                />
                <StatCard 
                    label="Pending Action" 
                    value={statsOverview.totalPendingBookings} 
                    icon={Clock} 
                    color="text-orange-600" 
                    bgColor="bg-orange-50" 
                    detail="Review required" 
                />

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Financial Trajectory */}
                <div className="xl:col-span-8 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="text-blue-600" size={20} />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Income History</h2>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Last 6 Months</span>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bookingTrendData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} 
                                    tickFormatter={(val) => `₵${val}`}
                                    dx={-10}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '700' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#2563eb" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Portfolio Control */}
                <div className="xl:col-span-4 bg-gray-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group border border-gray-800 flex flex-col justify-between shadow-gray-200">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white dark:bg-gray-900/5 rounded-xl flex items-center justify-center border border-white/10 mb-8 shadow-sm">
                            <LayoutDashboard size={24} className="text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-2 uppercase">My Hostels</h3>
                        <p className="text-xs text-white/40 font-medium leading-relaxed">Manage your hostels and view their current status.</p>
                    </div>

                    <div className="relative z-10 space-y-6 pt-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-900/5 rounded-xl border border-white/5 shadow-inner">
                                <p className="text-2xl font-bold mb-0.5 tracking-tighter">{totalHostels}</p>
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Assets</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900/5 rounded-xl border border-white/5 shadow-inner">
                                <p className="text-2xl font-bold mb-0.5 tracking-tighter">{totalRooms}</p>
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Units</p>
                            </div>
                        </div>
                        <Link href="/owner/hostels" className="w-full h-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                            View All Hostels <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Occupation Ledger */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Activity className="text-blue-600" size={20} />
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Recent Bookings</h2>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Track your latest student bookings</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                        <div className="flex bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-100 w-max shrink-0">
                            {[
                                { key: "all", label: "All" },
                                { key: "pending", label: "Pending" },
                                { key: "active", label: "Active" }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedTab(tab.key as any)}
                                    className={cn(
                                        "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                        selectedTab === tab.key
                                            ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border border-gray-100"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white"
                                    )}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    {filteredBookings.length === 0 ? (
                        <div className="p-16 text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-center justify-center mx-auto text-gray-200 border border-gray-100 shadow-inner">
                                <Activity size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">No bookings found</h3>
                                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">No bookings match your selected filter.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile card list */}
                            <div className="md:hidden divide-y divide-gray-50">
                                {filteredBookings.slice(0, 10).map((booking: any) => (
                                    <div key={booking.id} className="p-5 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all">
                                        <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                                            {booking.user?.firstName?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{booking.user?.firstName || 'Guest'} {booking.user?.lastName || ''}</p>
                                                <span className={cn("px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shrink-0", getStatusStyles(booking.status))}>
                                                    {booking.status.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest truncate mt-0.5">{booking.hostel?.name || "Unknown Hostel"}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-[10px] text-blue-600 font-bold">{booking.items?.[0]?.room?.name || "Shared"}</p>
                                                <Link href={`/owner/bookings/${booking.id}`} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-blue-600 flex items-center gap-1">
                                                    View <Eye size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-950/50">
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Student Info</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hostel & Room</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">View</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredBookings.slice(0, 10).map((booking: any) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-950/50 transition-all group/row">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md shadow-gray-200">
                                                            {booking.user?.firstName?.[0] || 'U'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-gray-900 dark:text-white text-sm tracking-tight truncate max-w-[150px]">{booking.user?.firstName || 'Guest'} {booking.user?.lastName || ''}</p>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest truncate">{booking.user?.email || 'No email provided'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">{booking.hostel?.name || "Unknown Hostel"}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">{booking.items?.[0]?.room?.name || "Shared Occupancy"}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-950 px-2 py-1 rounded-md border border-gray-100">
                                                        {new Date(booking.items?.[0]?.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn("px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border", getStatusStyles(booking.status))}>
                                                        {booking.status.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Link
                                                        href={`/owner/bookings/${booking.id}`}
                                                        className="w-10 h-10 inline-flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-100 rounded-xl text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-950/30 text-center border-t border-gray-50">
                    <Link href="/owner/bookings" className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2 group">
                        View All Bookings <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
