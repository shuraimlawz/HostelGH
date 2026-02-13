"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    LayoutDashboard,
    Building2,
    CalendarCheck,
    Users,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    Calendar,
    Clock,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OwnerDashboardPage() {
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

    if (hostelsLoading || bookingsLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    const totalHostels = hostels?.length || 0;
    const totalRooms = hostels?.reduce((acc: number, h: any) => acc + (h._count?.rooms || 0), 0) || 0;
    const pendingBookings = bookings?.filter((b: any) => b.status === "PENDING_APPROVAL")?.length || 0;
    const arrivingSoon = bookings?.filter((b: any) => b.status === "APPROVED" || b.status === "CONFIRMED")?.length || 0;
    const currentOccupants = bookings?.filter((b: any) => b.status === "CHECKED_IN")?.length || 0;

    const totalRevenue = bookings?.filter((b: any) => b.status === "CONFIRMED" || b.status === "CHECKED_IN" || b.status === "CHECKED_OUT" || b.status === "COMPLETED")
        ?.reduce((acc: number, b: any) => acc + (b.items?.[0]?.unitPrice * b.items?.[0]?.quantity || 0), 0) / 100 || 0;

    const stats = [
        { label: "Total Hostels", value: totalHostels, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Pending Requests", value: pendingBookings, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Arriving Soon", value: arrivingSoon, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Current Occupants", value: currentOccupants, icon: Users, color: "text-green-600", bg: "bg-green-50" },
    ];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back! 👋</h1>
                <p className="text-gray-500">Here's what's happening with your properties today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2rem] border p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Recent Booking Requests</h2>
                        <Link href="/owner/bookings" className="text-sm font-bold text-blue-600 hover:underline">View all</Link>
                    </div>

                    <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
                        {bookings?.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No booking requests yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {bookings?.slice(0, 5).map((booking: any) => (
                                    <div key={booking.id} className="p-6 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                                {booking.tenant.firstName?.[0] || booking.tenant.email[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">
                                                    {booking.tenant.firstName} {booking.tenant.lastName}
                                                </h4>
                                                <p className="text-xs text-gray-400">
                                                    Requested for <span className="text-gray-600 font-medium">{booking.hostel.name}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                                                booking.status === "PENDING_APPROVAL" ? "bg-orange-100 text-orange-600" :
                                                    booking.status === "CONFIRMED" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(booking.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Performance */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <Link
                            href="/owner/hostels/new"
                            className="bg-black text-white p-6 rounded-[2rem] flex items-center justify-between group hover:opacity-90 transition-all shadow-xl shadow-black/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Building2 size={20} />
                                </div>
                                <span className="font-bold">Add New Hostel</span>
                            </div>
                            <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>

                        <div className="bg-blue-600 text-white p-8 rounded-[2rem] relative overflow-hidden shadow-xl shadow-blue-200">
                            <div className="relative z-10">
                                <TrendingUp size={32} className="mb-4 text-blue-200" />
                                <h3 className="text-2xl font-bold mb-2">₵ {totalRevenue.toLocaleString()}</h3>
                                <p className="text-sm text-blue-100 font-medium">Total Lifetime Revenue</p>
                                <div className="mt-6 pt-6 border-t border-blue-500 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-blue-200">Payment Status</span>
                                    <span className="text-xs font-bold bg-white text-blue-600 px-2 py-1 rounded-lg">LIVE</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
