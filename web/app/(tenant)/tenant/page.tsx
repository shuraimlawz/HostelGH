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
    LucideIcon,
    ShieldCheck,
    Settings,
    LifeBuoy
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
            const res = await api.get("/bookings/me");
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

    // Calculation Logic
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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-orange-50 text-orange-700 border-orange-100";
            case "PAYMENT_SECURED": return "bg-blue-50 text-blue-700 border-blue-100";
            case "RESERVED": return "bg-indigo-50 text-indigo-700 border-indigo-100";
            case "CHECKED_IN": return "bg-purple-50 text-purple-700 border-purple-100";
            case "COMPLETED": return "bg-teal-50 text-teal-700 border-teal-100";
            case "DISPUTED": return "bg-rose-50 text-rose-700 border-rose-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
            {/* Header / Welcome Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                            Student Portal
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 ml-2">
                            <Clock size={12} />
                            Active Session
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Welcome back, {user?.firstName || "Student"} <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-base">
                        Your academic stay management, simplified.
                    </p>
                </div>

                {/* Profile Strength Component */}
                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm min-w-[300px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile Strength</p>
                            <span className="text-xs font-black text-blue-600">{profileCompletion}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                                style={{ width: `${profileCompletion}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">
                            {profileCompletion < 100
                                ? "Complete your profile to unlock all features."
                                : "Your profile is fully verified and optimized."
                            }
                        </p>
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
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <CalendarCheck size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight italic uppercase tracking-wider">Next Stay</h2>
                        </div>
                        <Link href="/bookings" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                            View Archive <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {nextBooking ? (
                        <div className="relative group overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-8 md:p-10 shadow-2xl">
                            {/* Visual Accents */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/20 rounded-full -ml-20 -mb-20 blur-3xl opacity-30" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-300 border border-white/5">
                                                Active Booking
                                            </div>
                                            <div className="px-2.5 py-1 bg-green-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-green-400 border border-green-500/10">
                                                Paid
                                            </div>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black tracking-tight group-hover:translate-x-1 transition-transform">{nextBooking.hostel.name}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                                                <MapPin size={12} className="text-blue-500" />
                                            </div>
                                            {nextBooking.hostel.location}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black mb-1 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">₵{((nextBooking.items?.[0]?.unitPrice * nextBooking.items?.[0]?.quantity || 0) / 100).toLocaleString()}</div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2 uppercase italic">Full Term Amount</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/5">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Check-in</p>
                                        <p className="text-base font-bold">{new Date(nextBooking.items?.[0]?.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Check-out</p>
                                        <p className="text-base font-bold">{new Date(nextBooking.items?.[0]?.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Room Config</p>
                                        <div className="flex items-center gap-1.5 leading-none">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <p className="text-base font-bold uppercase tracking-tighter">Shared <span className="text-[10px] text-gray-400 font-medium">(2 in 1)</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Link href={`/bookings/${nextBooking.id}`} className="bg-white text-black hover:bg-blue-600 hover:text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-black/20">
                                            Manage Boarding
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-4 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                <Building2 size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900">Ready to find a home?</h3>
                                <p className="text-gray-500 font-medium text-sm">You haven't booked any hostels yet. Start your search now.</p>
                            </div>
                            <Link href="/hostels" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-100">
                                Explore Hostels
                            </Link>
                        </div>
                    )}

                    {/* Quick Hub Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                        <Link href="/account/payments" className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all opacity-50" />
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 text-sm italic uppercase tracking-wider">Payments</h4>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">Invoices & Receipts</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/account/settings" className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all opacity-50" />
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <Settings size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 text-sm italic uppercase tracking-wider">Security</h4>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">Privacy & Settings</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/support" className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all opacity-50" />
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <LifeBuoy size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 text-sm italic uppercase tracking-wider">Help Desk</h4>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">24/7 Support Access</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Activity Feed (Right) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-wider">Recent Drift</h2>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-6">
                        {bookings && bookings.length > 0 ? (
                            <div className="space-y-6">
                                {bookings.slice(0, 4).map((booking: any, idx: number) => (
                                    <div key={booking.id} className="flex gap-4 group cursor-default">
                                        <div className="relative">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm transition-colors",
                                                idx === 0 ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                            )}>
                                                {idx === 0 ? <Zap size={18} /> : <Clock size={18} />}
                                            </div>
                                            {idx < (bookings.slice(0, 4).length - 1) && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-50" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="text-[11px] font-black text-gray-900 tracking-tight uppercase italic truncate pr-2">{booking.hostel.name}</p>
                                                <span className="text-[9px] font-bold text-gray-400 shrink-0">
                                                    {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-gray-500 font-medium truncate">
                                                    Ref: <span className="text-gray-900 font-bold tracking-tighter">#{booking.id.slice(0, 8).toUpperCase()}</span>
                                                </p>
                                                <div className={cn("w-1 h-1 rounded-full", ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(booking.status) ? "bg-green-500" : "bg-orange-500")} />
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest",
                                                    ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(booking.status) ? "text-green-600" : "text-orange-600"
                                                )}>
                                                    {booking.status.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 space-y-3">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 mx-auto">
                                    <TrendingUp size={24} />
                                </div>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">No recent shifts</p>
                            </div>
                        )}
                        <Link href="/bookings" className="block w-full text-center py-4 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-2xl text-[10px] font-black text-gray-900 uppercase tracking-widest transition-all">
                            View All Activity
                        </Link>
                    </div>

                    {/* Safety Alert (Premium) */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                        <div className="relative z-10">
                            <ShieldCheck className="text-blue-400 mb-4" size={24} />
                            <h3 className="text-sm font-black italic uppercase tracking-wider mb-2">Secure Payments <span className="text-blue-500">.</span></h3>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-6">
                                Always use the platform to process your rent. We never ask for payments via third-party direct MoMo numbers.
                            </p>
                            <Link href="/support/safety" className="inline-flex items-center gap-2 text-[9px] font-black bg-white text-black px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all uppercase tracking-widest">
                                Safety Guide <ArrowUpRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
