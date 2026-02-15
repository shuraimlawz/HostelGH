"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
    CalendarCheck,
    Clock,
    DollarSign,
    MapPin,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Building2,
    Search,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/ui/stats-card";

export default function TenantDashboardPage() {
    const { user } = useAuth();

    const { data: bookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ["tenant-bookings"],
        queryFn: async () => {
            const res = await api.get("/bookings");
            return res.data;
        }
    });

    if (bookingsLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    // Calculate stats
    const activeBookings = bookings?.filter((b: any) =>
        b.status === "APPROVED" || b.status === "CONFIRMED" || b.status === "CHECKED_IN"
    ) || [];

    const upcomingBookings = bookings?.filter((b: any) =>
        b.status === "APPROVED" || b.status === "CONFIRMED"
    ) || [];

    const pendingBookings = bookings?.filter((b: any) =>
        b.status === "PENDING_APPROVAL"
    ) || [];

    const completedBookings = bookings?.filter((b: any) =>
        b.status === "CHECKED_OUT" || b.status === "COMPLETED"
    ) || [];

    const totalSpent = bookings?.filter((b: any) =>
        b.status === "CONFIRMED" || b.status === "CHECKED_IN" || b.status === "CHECKED_OUT" || b.status === "COMPLETED"
    )?.reduce((acc: number, b: any) =>
        acc + (b.items?.[0]?.unitPrice * b.items?.[0]?.quantity || 0), 0
    ) / 100 || 0;

    // Get next booking
    const nextBooking = upcomingBookings.sort((a: any, b: any) =>
        new Date(a.items?.[0]?.startDate).getTime() - new Date(b.items?.[0]?.startDate).getTime()
    )[0];

    // Profile completion percentage
    const profileFields = [user?.firstName, user?.lastName, (user as any)?.phone];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING_APPROVAL": return "bg-orange-100 text-orange-700 border-orange-200";
            case "APPROVED": return "bg-blue-100 text-blue-700 border-blue-200";
            case "CONFIRMED": return "bg-green-100 text-green-700 border-green-200";
            case "CHECKED_IN": return "bg-purple-100 text-purple-700 border-purple-200";
            case "CHECKED_OUT": return "bg-gray-100 text-gray-700 border-gray-200";
            case "COMPLETED": return "bg-teal-100 text-teal-700 border-teal-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        Welcome back, {user?.firstName || "Student"}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg mb-6">
                        {nextBooking
                            ? `Your next check-in is on ${new Date(nextBooking.items?.[0]?.startDate).toLocaleDateString()}`
                            : "Ready to find your next hostel?"
                        }
                    </p>

                    {/* Profile Completion */}
                    {profileCompletion < 100 && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Profile Completion</span>
                                <span className="text-sm font-bold">{profileCompletion}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-white h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${profileCompletion}%` }}
                                />
                            </div>
                            <Link
                                href="/account"
                                className="text-xs text-blue-100 hover:text-white mt-2 inline-flex items-center gap-1"
                            >
                                Complete your profile <ArrowRight size={12} />
                            </Link>
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Active Bookings"
                    value={activeBookings.length}
                    icon={CheckCircle2}
                    iconBgColor="bg-green-50"
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Pending Approval"
                    value={pendingBookings.length}
                    icon={Clock}
                    iconBgColor="bg-orange-50"
                    iconColor="text-orange-600"
                />
                <StatsCard
                    title="Total Bookings"
                    value={bookings?.length || 0}
                    icon={CalendarCheck}
                    iconBgColor="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <StatsCard
                    title="Total Spent"
                    value={`₵${totalSpent.toLocaleString()}`}
                    icon={DollarSign}
                    iconBgColor="bg-purple-50"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active/Upcoming Bookings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Your Bookings</h2>
                        <Link href="/bookings" className="text-sm font-medium text-blue-600 hover:underline">
                            View all →
                        </Link>
                    </div>

                    {nextBooking && (
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-3xl p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-purple-200 text-sm font-medium mb-1">NEXT CHECK-IN</p>
                                        <h3 className="text-2xl font-bold mb-2">{nextBooking.hostel.name}</h3>
                                        <div className="flex items-center gap-2 text-purple-100">
                                            <MapPin size={16} />
                                            <span className="text-sm">{nextBooking.hostel.location}</span>
                                        </div>
                                    </div>
                                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(nextBooking.status))}>
                                        {nextBooking.status.replace(/_/g, " ")}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-purple-500">
                                    <div>
                                        <p className="text-purple-200 text-xs mb-1">Check-in</p>
                                        <p className="font-bold">{new Date(nextBooking.items?.[0]?.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-200 text-xs mb-1">Check-out</p>
                                        <p className="font-bold">{new Date(nextBooking.items?.[0]?.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/bookings/${nextBooking.id}`}
                                    className="mt-6 inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors"
                                >
                                    View Details <ArrowRight size={18} />
                                </Link>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        </div>
                    )}

                    {/* Recent Bookings List */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold">Recent Activity</h3>
                        </div>
                        {bookings?.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <CalendarCheck size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="mb-4">No bookings yet</p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                                >
                                    Browse Hostels <ArrowRight size={16} />
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {bookings?.slice(0, 5).map((booking: any) => (
                                    <Link
                                        key={booking.id}
                                        href={`/bookings/${booking.id}`}
                                        className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden">
                                                {booking.hostel.images?.[0] ? (
                                                    <img
                                                        src={booking.hostel.images[0]}
                                                        alt={booking.hostel.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Building2 size={24} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm mb-1">{booking.hostel.name}</h4>
                                                <p className="text-xs text-gray-500">
                                                    {booking.items?.[0]?.startDate && new Date(booking.items[0].startDate).toLocaleDateString()} - {booking.items?.[0]?.endDate && new Date(booking.items[0].endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn("px-3 py-1 rounded-full text-xs font-medium border inline-block mb-1", getStatusColor(booking.status))}>
                                                {booking.status.replace(/_/g, " ")}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                ₵{((booking.items?.[0]?.unitPrice * booking.items?.[0]?.quantity || 0) / 100).toLocaleString()}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Quick Actions</h2>

                    <Link
                        href="/"
                        className="block bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl hover:shadow-xl hover:shadow-blue-200 transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Search size={20} />
                            </div>
                            <h3 className="font-bold">Find Hostels</h3>
                        </div>
                        <p className="text-sm text-blue-100 mb-3">Browse available hostels near your campus</p>
                        <div className="flex items-center gap-1 text-sm font-medium">
                            Explore now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link
                        href="/bookings"
                        className="block bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                <CalendarCheck size={20} className="text-purple-600" />
                            </div>
                            <h3 className="font-bold">My Bookings</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">View and manage all your reservations</p>
                        <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
                            View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link
                        href="/account/payments"
                        className="block bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <DollarSign size={20} className="text-green-600" />
                            </div>
                            <h3 className="font-bold">Payments</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Track payments and download receipts</p>
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                            Manage <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Payment Summary */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-gray-400" />
                            <h3 className="font-bold">Spending Summary</h3>
                        </div>
                        <p className="text-3xl font-bold mb-2">₵{totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Total spent on accommodations</p>
                        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-400 mb-1">Completed</p>
                                <p className="font-bold">{completedBookings.length}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1">Active</p>
                                <p className="font-bold">{activeBookings.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
