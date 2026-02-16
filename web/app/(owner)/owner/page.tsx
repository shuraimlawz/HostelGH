"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Building2,
    CalendarCheck,
    Users,
    Clock,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    DollarSign,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    MoreVertical,
    Percent
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/ui/stats-card";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

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
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    // Calculate stats
    const totalHostels = hostels?.length || 0;
    const totalRooms = hostels?.reduce((acc: number, h: any) => acc + (h._count?.rooms || 0), 0) || 0;
    const pendingBookings = bookings?.filter((b: any) => b.status === "PENDING_APPROVAL")?.length || 0;
    const activeBookings = bookings?.filter((b: any) => b.status === "APPROVED" || b.status === "CONFIRMED" || b.status === "CHECKED_IN")?.length || 0;
    const completedBookings = bookings?.filter((b: any) => b.status === "CHECKED_OUT" || b.status === "COMPLETED")?.length || 0;
    const currentOccupants = bookings?.filter((b: any) => b.status === "CHECKED_IN")?.length || 0;

    const totalRevenue = bookings?.filter((b: any) => b.status === "CONFIRMED" || b.status === "CHECKED_IN" || b.status === "CHECKED_OUT" || b.status === "COMPLETED")
        ?.reduce((acc: number, b: any) => acc + (b.items?.[0]?.unitPrice * b.items?.[0]?.quantity || 0), 0) / 100 || 0;

    // Get real data from analytics API
    const bookingTrendData = analytics?.monthlyTrends || [];
    const occupancyRate = analytics?.occupancyRate || 0;
    const bookingTrend = analytics?.trends?.bookings || 0;

    // Filter bookings based on selected tab
    const filteredBookings = bookings?.filter((b: any) => {
        if (selectedTab === "all") return true;
        if (selectedTab === "pending") return b.status === "PENDING_APPROVAL";
        if (selectedTab === "active") return b.status === "APPROVED" || b.status === "CONFIRMED" || b.status === "CHECKED_IN";
        if (selectedTab === "completed") return b.status === "CHECKED_OUT" || b.status === "COMPLETED";
        return true;
    }) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING_APPROVAL": return "bg-orange-100 text-orange-700 border-orange-200";
            case "APPROVED": return "bg-blue-100 text-blue-700 border-blue-200";
            case "CONFIRMED": return "bg-green-100 text-green-700 border-green-200";
            case "CHECKED_IN": return "bg-purple-100 text-purple-700 border-purple-200";
            case "CHECKED_OUT": return "bg-gray-100 text-gray-700 border-gray-200";
            case "COMPLETED": return "bg-teal-100 text-teal-700 border-teal-200";
            case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
                <p className="text-gray-500">Monitor your properties and manage bookings</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Bookings"
                    value={bookings?.length || 0}
                    icon={CalendarCheck}
                    iconBgColor="bg-blue-50"
                    iconColor="text-blue-600"
                    trend={{ value: Math.abs(bookingTrend), isPositive: bookingTrend >= 0 }}
                />
                <StatsCard
                    title="Pending Requests"
                    value={pendingBookings}
                    icon={Clock}
                    iconBgColor="bg-orange-50"
                    iconColor="text-orange-600"
                    subtitle="Needs attention"
                />
                <StatsCard
                    title="Active Bookings"
                    value={activeBookings}
                    icon={CheckCircle2}
                    iconBgColor="bg-green-50"
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Estimated Revenue"
                    value={`₵${((wallet?.balance || 0) / 100).toLocaleString()}`}
                    icon={DollarSign}
                    iconBgColor="bg-orange-50"
                    iconColor="text-orange-600"
                    subtitle="Available for payout"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Trend Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Booking Trends</h3>
                            <p className="text-sm text-gray-500">Last 6 months</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={bookingTrendData}>
                            <defs>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip />
                            <Area type="monotone" dataKey="bookings" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Revenue Overview</h3>
                            <p className="text-sm text-gray-500">Monthly earnings (GH₵)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">₵{totalRevenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Total lifetime</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={bookingTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Booking Management</h3>
                        <Link href="/owner/bookings" className="text-sm font-medium text-blue-600 hover:underline">
                            View all →
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {[
                            { key: "all", label: "All", count: bookings?.length || 0 },
                            { key: "pending", label: "Pending", count: pendingBookings },
                            { key: "active", label: "Active", count: activeBookings },
                            { key: "completed", label: "Completed", count: completedBookings },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSelectedTab(tab.key as any)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    selectedTab === tab.key
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {filteredBookings.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No bookings in this category</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredBookings.slice(0, 10).map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {booking.tenant.firstName?.[0] || booking.tenant.email[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{booking.tenant.firstName} {booking.tenant.lastName}</p>
                                                    <p className="text-xs text-gray-500">{booking.tenant.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-medium text-sm">{booking.hostel.name}</p>
                                            <p className="text-xs text-gray-500">{booking.items?.[0]?.room?.name || "N/A"}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {booking.items?.[0]?.startDate ? new Date(booking.items[0].startDate).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {booking.items?.[0]?.endDate ? new Date(booking.items[0].endDate).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", getStatusColor(booking.status))}>
                                                {booking.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₵{((booking.items?.[0]?.unitPrice * booking.items?.[0]?.quantity || 0) / 100).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link
                                                href={`/owner/bookings/${booking.id}`}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                <Eye size={16} />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/owner/hostels/new"
                    className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl flex items-center justify-between group hover:shadow-xl hover:shadow-blue-200 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Add New Hostel</p>
                            <p className="text-sm text-blue-100">List a new property</p>
                        </div>
                    </div>
                    <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>

                <Link
                    href="/owner/hostels"
                    className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-8 rounded-2xl flex items-center justify-between group hover:shadow-xl hover:shadow-purple-200 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Manage Hostels</p>
                            <p className="text-sm text-purple-100">{totalHostels} properties • {totalRooms} rooms</p>
                        </div>
                    </div>
                    <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
