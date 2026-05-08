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
    TrendingUp,
    Zap,
    CreditCard,
    ArrowUpRight,
    LucideIcon,
    ShieldCheck,
    Settings,
    LifeBuoy,
    ChevronRight,
    Wallet,
    Bell
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function DashboardStat({
    label,
    value,
    icon: Icon,
    color,
    bgColor,
    trend
}: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    trend?: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 border border-gray-100/50 shadow-inner", bgColor, color)}>
                    <Icon size={22} />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg tracking-widest border border-emerald-100/50">
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
            </div>
        </div>
    );
}

export default function TenantDashboardPage() {
    const { user } = useAuth();

    const { data: bookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ["tenant-bookings"],
        queryFn: async () => {
            const res = await api.get("/bookings/me");
            return res.data;
        }
    });

    const { data: wallet, isLoading: walletLoading } = useQuery({
        queryKey: ["tenant-wallet"],
        queryFn: async () => {
            const res = await api.get("/wallets/me");
            return res.data;
        }
    });

    if (bookingsLoading || walletLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Loading data...</p>
                </div>
            </div>
        );
    }

    const activeBookings = bookings?.filter((b: any) =>
        ["RESERVED", "CHECKED_IN", "DISPUTED"].includes(b.status)
    ) || [];

    const pendingBookings = bookings?.filter((b: any) =>
        ["PENDING", "PAYMENT_SECURED"].includes(b.status)
    ) || [];

    const totalSpent = (bookings?.filter((b: any) =>
        ["PAYMENT_SECURED", "RESERVED", "CHECKED_IN", "COMPLETED"].includes(b.status)
    )?.reduce((acc: number, b: any) =>
        acc + (b.items?.[0]?.unitPrice * b.items?.[0]?.quantity || 0), 0
    ) / 100) || 0;

    const nextBooking = activeBookings.sort((a: any, b: any) =>
        new Date(a.items?.[0]?.startDate).getTime() - new Date(b.items?.[0]?.startDate).getTime()
    )[0];

    // Reactive Profile Health
    const profileFields = [user?.firstName, user?.lastName, user?.phone, user?.avatarUrl];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-16 md:pt-4 px-4">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Student Overview</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Student Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm max-w-md">
                        Monitoring your stay at <span className="text-gray-900 dark:text-white font-bold">{nextBooking?.hostel.name || "Ghana"}</span> community.
                    </p>
                </div>

                {/* Your Profile */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center justify-between gap-6 min-w-full sm:min-w-[320px] xl:w-fit relative overflow-hidden group transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="relative w-14 h-14 flex-shrink-0">
                            <svg className="w-14 h-14 transform -rotate-90">
                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-50" />
                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                    strokeDasharray={151} strokeDashoffset={151 - (151 * profileCompletion) / 100}
                                    className="text-blue-600 transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shadow-inner flex items-center justify-center">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-blue-600">{user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Profile Strength</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                                {profileCompletion}% Complete
                            </p>
                        </div>
                    </div>
                    <Link href="/account" className="relative z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-500 hover:text-blue-600 border border-gray-100 hover:border-blue-200 transition-all">
                        <ArrowUpRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Metrics */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStat
                    label="My Hostels"
                    value={activeBookings.length}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
                <DashboardStat
                    label="Action Needed"
                    value={pendingBookings.length}
                    icon={Clock}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <DashboardStat
                    label="Wallet Balance"
                    value={`₵${((wallet?.balance || 0) / 100).toLocaleString()}`}
                    icon={Wallet}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <DashboardStat
                    label="Total Payments"
                    value={`₵${totalSpent.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-gray-600"
                    bgColor="bg-gray-50 dark:bg-gray-950"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Active Booking Section */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Current Booking</h2>
                        <Link href="/bookings" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">
                            View stay history
                        </Link>
                    </div>

                    {nextBooking ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 rounded-2xl p-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 dark:bg-gray-950 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-105" />
                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "h-7 px-3 flex items-center rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                            nextBooking.status === "CHECKED_IN" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>
                                            {nextBooking.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{nextBooking.hostel?.name || "Unknown Hostel"}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm font-medium">
                                            <MapPin size={14} className="text-blue-500" />
                                            {nextBooking.hostel?.location || "Location not provided"}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-gray-50">
                                        <div>
                                            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1.5">Check-in Date</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(nextBooking.items?.[0]?.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1.5">Room Detail</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{nextBooking.items?.[0]?.room?.name || "Shared Occupancy"}</p>
                                        </div>
                                        <div className="flex items-end">
                                            <Link href={`/bookings/${nextBooking.id}`} className="h-10 px-6 bg-gray-900 text-white hover:bg-black rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-gray-200 transition-all">
                                                View details <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-56 p-8 bg-gray-50 dark:bg-gray-950 rounded-2xl text-center border border-gray-100 flex flex-col justify-center items-center shadow-inner">
                                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2">Total Cost</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tighter">₵{((nextBooking.items?.[0]?.unitPrice * nextBooking.items?.[0]?.quantity || 0) / 100).toLocaleString()}</p>
                                    <p className="text-[8px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Booking</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center gap-6">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-center justify-center text-gray-200 border border-gray-100 shadow-inner">
                                <Building2 size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">No bookings yet</h3>
                                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">You don't have any hostels booked yet.</p>
                            </div>
                            <Link href="/hostels" className="h-12 px-8 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                                Explore Hostels <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { href: "/bookings", icon: CreditCard, label: "Payments", sub: "History", color: "text-blue-600", bg: "bg-blue-50" },
                            { href: "/account", icon: Settings, label: "Settings", sub: "My Profile", color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-950" },
                            { href: "/support", icon: LifeBuoy, label: "Support", sub: "Get Help", color: "text-orange-600", bg: "bg-orange-50" }
                        ].map((hub, i) => (
                            <Link key={i} href={hub.href} className="p-6 bg-white dark:bg-gray-900 border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all flex flex-col gap-4 group">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-gray-100/50", hub.bg, hub.color)}>
                                    <hub.icon size={20} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">{hub.label}</h4>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{hub.sub}</p>
                                    </div>
                                    <ChevronRight className="text-gray-200 group-hover:text-blue-500 transition-colors" size={16} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Recent Activity</h2>
                            <Bell size={18} className="text-gray-300" />
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
                            {bookings && bookings.length > 0 ? (
                                <div className="space-y-8">
                                    {bookings.slice(0, 4).map((booking: any) => (
                                        <div key={booking.id} className="flex gap-5 group cursor-pointer">
                                            <div className="w-1.5 h-10 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate mb-1">{booking.hostel?.name || "Unknown Hostel"}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">#{booking?.id?.slice(-6)?.toUpperCase() || "UNKNOWN"}</span>
                                                    <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest border", 
                                                        ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(booking.status) ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-orange-50 text-orange-600 border-orange-100/50"
                                                    )}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 opacity-30">
                                    <TrendingUp size={40} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">No recent activity</p>
                                </div>
                            )}
                            <Link href="/bookings" className="block w-full text-center py-4 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 dark:text-gray-500 transition-all border border-gray-100">
                                View All Activity
                            </Link>
                        </div>
                    </div>

                    {/* Safety Information */}
                    <div className="bg-gray-900 p-8 rounded-2xl text-white relative overflow-hidden group shadow-xl shadow-gray-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white dark:bg-gray-900/5 rounded-xl flex items-center justify-center border border-white/10 text-blue-400">
                                <ShieldCheck size={24} />
                            </div>
                             <div className="space-y-2">
                                <h3 className="text-lg font-bold tracking-tight">Safety Policy</h3>
                                <p className="text-xs text-white/40 font-medium leading-relaxed">
                                    Enjoy a secure stay with our verified booking system.
                                </p>
                            </div>
                            <Link href="/support/safety" className="h-10 px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                                Read Policy <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
