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
        <div className="bg-white p-8 rounded-[2.5rem] border border-muted shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-3xl opacity-0 group-hover:opacity-100" />
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 duration-500 shadow-inner", bgColor, color)}>
                    <Icon size={28} />
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{title}</p>
                <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
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
            <div className="flex h-[80vh] items-center justify-center bg-white transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Establishing Portal Link...</p>
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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-orange-500/5 text-orange-600 border-orange-500/10";
            case "PAYMENT_SECURED": return "bg-blue-500/5 text-blue-600 border-blue-500/10";
            case "RESERVED": return "bg-indigo-500/5 text-indigo-600 border-indigo-500/10";
            case "CHECKED_IN": return "bg-emerald-500/5 text-emerald-600 border-emerald-500/10";
            case "COMPLETED": return "bg-teal-500/5 text-teal-600 border-teal-500/10";
            case "DISPUTED": return "bg-rose-500/5 text-rose-600 border-rose-500/10";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="max-w-[1500px] mx-auto space-y-12 pb-20 pt-6">
            {/* Header / Student Profile Insights */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-600/10 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-blue-600/20">
                            Student Hub
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Portal Online</span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">
                        Welcome back, <br/>{user?.firstName || "Resident"} <span className="text-blue-600 NOT-italic opacity-50">.</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-md">
                        Your academic stay management, simplified through the HostelGH network.
                    </p>
                </div>

                {/* Profile Strength - Modernized */}
                <div className="bg-black text-white p-8 rounded-[3rem] shadow-2xl min-w-[320px] relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Profile Strength</p>
                            <span className="text-xs font-black text-blue-400">{profileCompletion}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
                            <div
                                className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                style={{ width: `${profileCompletion}%` }}
                            />
                        </div>
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest leading-none">
                            {profileCompletion < 100
                                ? "Action Required: Complete verification."
                                : "Identity Status: Fully Authenticated."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <DashboardStat
                    title="Active Stays"
                    value={activeBookings.length}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
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
                    value={`₵${((wallet?.balance || 0) / 100).toLocaleString()}`}
                    icon={Zap}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    trend="+12% Credit"
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
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Bookings Section (Left) */}
                <div className="xl:col-span-8 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl">
                                <CalendarCheck size={24} />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-xl font-black text-foreground tracking-tight uppercase italic leading-none">Next Tenure <span className="text-blue-600 NOT-italic">.</span></h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Accommodation Lifecycle</p>
                            </div>
                        </div>
                        <Link href="/bookings" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2 group">
                            VIEW ARCHIVE <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    {nextBooking ? (
                        <div className="relative group overflow-hidden rounded-[3.5rem] bg-black text-white p-10 md:p-14 shadow-2xl border border-white/5">
                            {/* Visual Accents */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -mr-[250px] -mt-[250px] blur-[120px] group-hover:opacity-60 transition-opacity duration-1000" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 rounded-full -ml-40 -mb-40 blur-[100px] opacity-30" />

                            <div className="relative z-10 space-y-10">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                                    <div className="space-y-5">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="px-3 py-1 bg-white/5 backdrop-blur-xl rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 border border-white/10">
                                                Active Session
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-500/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/5">
                                                Settled
                                            </div>
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic group-hover:translate-x-2 transition-transform duration-500">{nextBooking.hostel.name}</h3>
                                        <div className="flex items-center gap-3 text-white/40 font-bold text-sm uppercase tracking-widest">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                                <MapPin size={14} className="text-blue-500" />
                                            </div>
                                            {nextBooking.hostel.location}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[200px]">
                                        <div className="text-4xl font-black mb-1 tracking-tighter">₵{((nextBooking.items?.[0]?.unitPrice * nextBooking.items?.[0]?.quantity || 0) / 100).toLocaleString()}</div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic">Full Tenure Engagement</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-white/10">
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Check-in</p>
                                        <p className="text-lg font-black italic">{new Date(nextBooking.items?.[0]?.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Check-out</p>
                                        <p className="text-lg font-black italic">{new Date(nextBooking.items?.[0]?.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Operational Unit</p>
                                        <div className="flex items-center gap-2 leading-none">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            <p className="text-lg font-black uppercase tracking-widest">{nextBooking.items?.[0]?.room?.name || "Shared Suite"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-end">
                                        <Link href={`/bookings/${nextBooking.id}`} className="bg-white text-black hover:bg-blue-600 hover:text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl hover:scale-105">
                                            MANAGE BOARDING
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-20 bg-white rounded-[4rem] border border-muted flex flex-col items-center text-center space-y-6 shadow-sm group">
                            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center text-muted transition-transform group-hover:scale-110 duration-500">
                                <Building2 size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Find Your Base Bases <span className="text-blue-600 NOT-italic">.</span></h3>
                                <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest max-w-sm">You haven't deployed to any hostels yet. Engage the search engine.</p>
                            </div>
                            <Link href="/hostels" className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-blue-500/20">
                                EXPLORE NETWORK
                            </Link>
                        </div>
                    )}

                    {/* Quick Hub Grid - Modernized */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                        {[
                            { href: "/account/payments", icon: CreditCard, color: "emerald", label: "Ledger", sub: "Payment Invoices", bg: "bg-emerald-50", text: "text-emerald-600" },
                            { href: "/account/settings", icon: Settings, color: "blue", label: "Identity", sub: "Security Protocol", bg: "bg-blue-50", text: "text-blue-600" },
                            { href: "/support", icon: LifeBuoy, color: "purple", label: "Nexus", sub: "Support Dispatch", bg: "bg-purple-50", text: "text-purple-600" }
                        ].map((hub, i) => (
                            <Link key={i} href={hub.href} className="p-8 bg-white border border-muted rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                                <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-all opacity-40 blur-2xl group-hover:opacity-60", hub.bg)} />
                                <div className="relative z-10 flex flex-col gap-6">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner", hub.bg, hub.text)}>
                                        <hub.icon size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-foreground text-sm italic uppercase tracking-[0.2em]">{hub.label}</h4>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{hub.sub}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Drift (Right) */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-foreground italic uppercase tracking-widest">Recent Drift <span className="text-blue-600 NOT-italic">.</span></h2>
                    </div>
                    <div className="bg-white rounded-[3.5rem] border border-muted shadow-sm p-10 space-y-10 group">
                        {bookings && bookings.length > 0 ? (
                            <div className="space-y-10">
                                {bookings.slice(0, 5).map((booking: any, idx: number) => (
                                    <div key={booking.id} className="flex gap-6 group/item cursor-default">
                                        <div className="relative">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-all duration-500",
                                                idx === 0 ? "bg-black text-white border-black scale-110" : "bg-muted/10 text-muted-foreground group-hover/item:bg-muted/20 border-muted"
                                            )}>
                                                {idx === 0 ? <Zap size={22} className="animate-pulse" /> : <Clock size={22} />}
                                            </div>
                                            {idx < (bookings.slice(0, 5).length - 1) && <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-muted/20" />}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[12px] font-black text-foreground tracking-tight uppercase italic pr-4 truncate">{booking.hostel.name}</p>
                                                <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase tracking-widest">
                                                    {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">
                                                    REF: <span className="text-foreground tracking-tighter">#{booking.id.slice(0, 8).toUpperCase()}</span>
                                                </p>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(booking.status) ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-orange-500")} />
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest",
                                                    ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(booking.status) ? "text-emerald-600" : "text-orange-600"
                                                )}>
                                                    {booking.status.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 space-y-4 opacity-30">
                                <TrendingUp size={48} className="mx-auto" />
                                <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.5em] italic">No Recent Drift</p>
                            </div>
                        )}
                        <Link href="/bookings" className="block w-full text-center py-5 bg-muted/20 hover:bg-black hover:text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.5em] transition-all">
                            VIEW FULL LEDGER
                        </Link>
                    </div>

                    {/* Safety Alert (Premium) */}
                    <div className="bg-black rounded-[3.5rem] p-10 text-white relative overflow-hidden group shadow-2xl border border-white/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                                <ShieldCheck className="text-blue-400" size={24} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black italic uppercase tracking-tight leading-none">Protocols <span className="text-blue-500 NOT-italic">.</span></h3>
                                <p className="text-[11px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">
                                    Secure your stay through the network. Avoid external direct MoMo engagements to bypass fraud vectors.
                                </p>
                            </div>
                            <Link href="/support/safety" className="inline-flex items-center gap-3 text-[10px] font-black bg-white text-black px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all uppercase tracking-[0.3em]">
                                SAFETY GUIDE <ArrowUpRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
