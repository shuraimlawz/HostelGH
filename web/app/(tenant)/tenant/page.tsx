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
    Wallet
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Refined Stat Card
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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", bgColor, color)}>
                    <Icon size={22} />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md tracking-tight">
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400">Loading your space...</p>
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

    const profileFields = [user?.firstName, user?.lastName, (user as any)?.phone];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest">Resident Hub</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        Welcome, {user?.firstName || "Resident"}
                    </h1>
                    <p className="text-gray-500 text-sm max-w-md">
                        Manage your stays, payments, and account all in one place.
                    </p>
                </div>

                {/* Refined Profile Card */}
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-6 min-w-[300px]">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-12 h-12 transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-100" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" 
                                strokeDasharray={126} strokeDashoffset={126 - (126 * profileCompletion) / 100}
                                className="text-blue-500 transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-900">
                            {profileCompletion}%
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900">Profile Strength</p>
                        <p className="text-[10px] text-gray-400 font-medium">
                            {profileCompletion < 100 ? "Complete verification" : "Identity verified"}
                        </p>
                    </div>
                    <Link href="/account" className="ml-auto p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <ArrowUpRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStat
                    title="Active Stays"
                    value={activeBookings.length}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
                <DashboardStat
                    title="Pending"
                    value={pendingBookings.length}
                    icon={Clock}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <DashboardStat
                    title="Wallet Balance"
                    value={`₵${((wallet?.balance || 0) / 100).toLocaleString()}`}
                    icon={Wallet}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <DashboardStat
                    title="Total Spent"
                    value={`₵${totalSpent.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-gray-600"
                    bgColor="bg-gray-50"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Bookings Section */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Active Booking</h2>
                        <Link href="/bookings" className="text-xs font-bold text-blue-600 hover:underline">
                            View all stays
                        </Link>
                    </div>

                    {nextBooking ? (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-tight border border-emerald-100">
                                            {nextBooking.status}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{nextBooking.hostel.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                        <MapPin size={14} className="text-blue-500" />
                                        {nextBooking.hostel.location}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Check-in</p>
                                            <p className="text-sm font-bold text-gray-900">{new Date(nextBooking.items?.[0]?.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Room Type</p>
                                            <p className="text-sm font-bold text-gray-900">{nextBooking.items?.[0]?.room?.name || "Shared"}</p>
                                        </div>
                                        <div className="md:col-span-1 flex items-end">
                                            <Link href={`/bookings/${nextBooking.id}`} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                                                Manage stay <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto p-6 bg-gray-50 rounded-xl text-center border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tenure Cost</p>
                                    <p className="text-2xl font-bold text-gray-900 tracking-tight">₵{((nextBooking.items?.[0]?.unitPrice * nextBooking.items?.[0]?.quantity || 0) / 100).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-16 bg-white rounded-2xl border border-gray-100 border-dashed text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                                <Building2 size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-gray-900">No active bookings</h3>
                                <p className="text-sm text-gray-500">Search for hostels to find your next stay.</p>
                            </div>
                            <Link href="/hostels" className="mt-2 bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10">
                                Explore Hostels
                            </Link>
                        </div>
                    )}

                    {/* Quick Hub Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        {[
                            { href: "/account/payments", icon: CreditCard, label: "Payments", sub: "Billing & History", color: "text-blue-600", bg: "bg-blue-50" },
                            { href: "/account", icon: Settings, label: "Settings", sub: "Profile & Privacy", color: "text-gray-600", bg: "bg-gray-50" },
                            { href: "/support", icon: LifeBuoy, label: "Support", sub: "Help & Center", color: "text-orange-600", bg: "bg-orange-50" }
                        ].map((hub, i) => (
                            <Link key={i} href={hub.href} className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all flex items-center gap-4 group">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm", hub.bg, hub.color)}>
                                    <hub.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm tracking-tight">{hub.label}</h4>
                                    <p className="text-[10px] text-gray-400 font-medium">{hub.sub}</p>
                                </div>
                                <ChevronRight className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" size={16} />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Sidebar Areas */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Activity</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                            {bookings && bookings.length > 0 ? (
                                <div className="space-y-6">
                                    {bookings.slice(0, 4).map((booking: any) => (
                                        <div key={booking.id} className="flex gap-4 group cursor-pointer">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-gray-100">
                                                    <Clock size={16} />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <p className="text-xs font-bold text-gray-900 truncate mb-0.5">{booking.hostel.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-400 font-medium">#{booking.id.slice(0, 8).toUpperCase()}</span>
                                                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md", 
                                                        ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(booking.status) ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                                    )}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-40">
                                    <TrendingUp size={32} className="mx-auto text-gray-300" />
                                    <p className="text-xs font-bold text-gray-400 mt-2">Nothing yet</p>
                                </div>
                            )}
                            <Link href="/bookings" className="block w-full text-center py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 transition-all border border-gray-100">
                                View History
                            </Link>
                        </div>
                    </div>

                    {/* Safety Guidelines */}
                    <div className="bg-blue-600 p-6 rounded-2xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold tracking-tight">Safety First</h3>
                                <p className="text-xs text-blue-100/70 font-medium leading-relaxed">
                                    Always pay through the platform to keep your stay protected by our verification protocols.
                                </p>
                            </div>
                            <Link href="/support/safety" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all">
                                Safety Guide <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
