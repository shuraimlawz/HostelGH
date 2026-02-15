"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, BarChart3, Users, Building2, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminStatsPage() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const res = await api.get("/admin/stats");
            return res.data;
        }
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: async () => {
            const res = await api.get("/admin/analytics");
            return res.data;
        }
    });

    if (statsLoading || analyticsLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    const monthlyData = analytics?.monthlyData || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">System Statistics</h1>
                <p className="text-gray-500">Detailed analytics and platform metrics</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="text-blue-600" size={24} />
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                            (stats?.trends?.users || 0) >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        )}>
                            {(stats?.trends?.users || 0) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(stats?.trends?.users || 0)}%
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Users</h3>
                    <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                </div>

                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Building2 className="text-green-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Live Hostels</h3>
                    <p className="text-3xl font-bold">{stats?.liveHostels || 0}</p>
                </div>

                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <BarChart3 className="text-purple-600" size={24} />
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                            (stats?.trends?.bookings || 0) >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        )}>
                            {(stats?.trends?.bookings || 0) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(stats?.trends?.bookings || 0)}%
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Bookings</h3>
                    <p className="text-3xl font-bold">{stats?.bookings || 0}</p>
                </div>

                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <TrendingUp className="text-orange-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Platform Revenue</h3>
                    <p className="text-3xl font-bold">₵{((stats?.revenue || 0) / 100).toLocaleString()}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white rounded-2xl p-6 border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">User Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip />
                            <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl p-6 border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Revenue Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
