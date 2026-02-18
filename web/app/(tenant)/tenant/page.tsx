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
    Building2,
    Search,
    TrendingUp,
    Zap,
    CreditCard,
    ArrowUpRight,
    LucideIcon
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Reusable Stat Card with Premium Feel
function DashboardStat({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    trend
}: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    trend?: string;
}) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bgColor, color)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
            </div>
        </div>
    );
}

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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    // Calculation Logic (Preserved from existing code but optimized)
    const activeBookings = bookings?.filter((b: any) =>
        ["APPROVED", "CONFIRMED", "CHECKED_IN"].includes(b.status)
    ) || [];

    const pendingBookings = bookings?.filter((b: any) =>
        b.status === "PENDING_APPROVAL"
    ) || [];

    const totalSpent = (bookings?.filter((b: any) =>
        ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "COMPLETED"].includes(b.status)
    )?.reduce((acc: number, b: any) =>
        acc + (b.items?.[0]?.unitPrice * b.items?.[0]?.quantity || 0), 0
    ) / 100) || 0;

    const nextBooking = activeBookings.sort((a: any, b: any) =>
        new Date(a.items?.[0]?.startDate).getTime() - new Date(b.items?.[0]?.startDate).getTime()
    )[0];

    const profileFields = [user?.firstName, user?.lastName, (user as any)?.phone];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING_APPROVAL": return "bg-orange-50 text-orange-700 border-orange-100";
            case "APPROVED": return "bg-blue-50 text-blue-700 border-blue-100";
            case "CONFIRMED": return "bg-green-50 text-green-700 border-green-100";
            case "CHECKED_IN": return "bg-purple-50 text-purple-700 border-purple-100";
            case "CHECKED_OUT": return "bg-gray-50 text-gray-700 border-gray-100";
            case "COMPLETED": return "bg-teal-50 text-teal-700 border-teal-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
            {/* Header / Welcome Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                            Student Portal
                        </span>
                        {profileCompletion < 100 && (
                            <Link href="/account" className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-100 animate-pulse">
                                Finish Profile
                            </Link>
                        )}
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Hello, {user?.firstName || "Student"} <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-base">
                        Manage your stays, track payments, and find your next home.
                    </p>
                </div>

                {/* Quick Profile Summary */}
                <div className="flex items-center gap-4 bg-white p-2.5 pr-6 rounded-full border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                        {user?.firstName?.[0] || user?.email[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Account Safety</p>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="text-green-600" size={12} />
                            <span className="text-xs font-bold text-gray-900">Verified Tenant</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStat
                    title="Active Stays"
                    value={activeBookings.length}
                    icon={CheckCircle2}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <DashboardStat
                    title="Pending Requests"
                    value={pendingBookings.length}
                    icon={Clock}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <DashboardStat
                    title="Current Balance"
                    value="₵0.0"
                    icon={Zap}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <DashboardStat
                    title="Total Investment"
                    value={`₵${totalSpent.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Bookings Section (Left) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black text-gray-900">Booking Timeline</h2>
                        <Link href="/bookings" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                            View Archive <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {nextBooking ? (
                        <div className="relative group overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-8 md:p-10 shadow-2xl">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-300">
                                            Upcoming Check-in
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black">{nextBooking.hostel.name}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                                            <MapPin size={16} className="text-blue-500" />
                                            {nextBooking.hostel.location}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black mb-1">₵{((nextBooking.items?.[0]?.unitPrice * nextBooking.items?.[0]?.quantity || 0) / 100).toLocaleString()}</div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Stay Amount</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Check-in</p>
                                        <p className="text-base font-bold">{new Date(nextBooking.items?.[0]?.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Check-out</p>
                                        <p className="text-base font-bold">{new Date(nextBooking.items?.[0]?.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Room No.</p>
                                        <p className="text-base font-bold">#204 <span className="text-[10px] text-gray-500 font-medium">(Standard)</span></p>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Link href={`/bookings/${nextBooking.id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                            Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-1">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                <Building2 size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900">No Active Bookings</h3>
                                <p className="text-gray-500 font-medium text-sm">You haven't booked any hostels yet. Start your search now.</p>
                            </div>
                            <Link href="/hostels" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                                Explore Hostels
                            </Link>
                        </div>
                    )}

                    {/* Recent Activity List */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Recent Activity</h3>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {bookings?.length > 0 ? bookings.slice(0, 4).map((booking: any) => (
                                <Link
                                    key={booking.id}
                                    href={`/bookings/${booking.id}`}
                                    className="px-8 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                                            {booking.hostel.images?.[0] ? (
                                                <img src={booking.hostel.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Building2 size={24} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">{booking.hostel.name}</h4>
                                            <p className="text-xs text-gray-500 font-medium">#{booking.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:block text-right">
                                            <div className="text-sm font-bold text-gray-900 mb-1">
                                                {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Booked</p>
                                        </div>
                                        <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border", getStatusStyles(booking.status))}>
                                            {booking.status.replace(/_/g, " ")}
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-12 text-center text-gray-400 font-medium italic">No activity yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="lg:col-span-4 space-y-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Quick Hub</h2>

                    <div className="grid gap-4">
                        <Link href="/hostels" className="group p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl text-white shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Search size={22} />
                                </div>
                                <ArrowUpRight className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-2">Explore Hostels</h3>
                            <p className="text-blue-100/80 text-sm font-medium">Browse verified listings near your university campus in Ghana.</p>
                        </Link>

                        <Link href="/account/payments" className="group p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                    <CreditCard size={22} />
                                </div>
                                <ArrowUpRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">My Payments</h3>
                            <p className="text-gray-500 text-sm font-medium">Track your MoMo transactions & download receipt history.</p>
                        </Link>

                        <Link href="/support" className="group p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                    <LifeBuoy size={22} />
                                </div>
                                <ArrowUpRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Support Hub</h3>
                            <p className="text-gray-500 text-sm font-medium">Get help with bookings, verification, or safety concerns.</p>
                        </Link>
                    </div>

                    {/* Monthly Summary Alert */}
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-[2.5rem] relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-blue-600" size={18} />
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Monthly Spending</span>
                            </div>
                            <div className="text-3xl font-black text-gray-900">₵{totalSpent.toLocaleString()}</div>
                            <p className="text-sm text-gray-500 font-medium">You’ve successfully secured {activeBookings.length} bookings this academic semester.</p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reused components from imports...
import { ShieldCheck, LifeBuoy } from "lucide-react";
