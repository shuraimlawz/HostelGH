"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
    Home, Clock, Wallet, DollarSign, Building2, MapPin, ArrowRight,
    ChevronRight, Settings, LifeBuoy, CreditCard, ShieldCheck,
    ArrowUpRight, CalendarCheck, Sparkles, AlertCircle, BookOpen
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    KpiCard, StatusBadge, SectionHeader, EmptyState, DashCard,
    AvatarInitials, Skeleton
} from "@/components/dashboard/DashComponents";

function QuickAction({ href, icon: Icon, label, sub, color }: {
    href: string; icon: any; label: string; sub: string; color: string;
}) {
    return (
        <Link href={href} className="group flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", color)}>
                <Icon size={17} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">{label}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{sub}</p>
            </div>
            <ChevronRight size={15} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
    );
}

export default function TenantDashboardPage() {
    const { user } = useAuth();

    const { data: bookings = [], isLoading: bLoading } = useQuery({
        queryKey: ["tenant-bookings"],
        queryFn: async () => {
            const { data } = await api.get("/bookings/me");
            return Array.isArray(data) ? data : [];
        }
    });

    const { data: wallet, isLoading: wLoading } = useQuery({
        queryKey: ["tenant-wallet"],
        queryFn: async () => (await api.get("/wallets/me")).data
    });

    const isLoading = bLoading || wLoading;
    const firstName = user?.firstName || "Tenant";

    const activeBookings = bookings.filter((b: any) => ["RESERVED", "CHECKED_IN"].includes(b.status));
    const pendingBookings = bookings.filter((b: any) => ["PENDING", "PAYMENT_SECURED"].includes(b.status));
    const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED");
    const walletBal = ((wallet?.balance ?? 0) / 100);
    const totalSpent = bookings
        .filter((b: any) => ["PAYMENT_SECURED", "RESERVED", "CHECKED_IN", "COMPLETED"].includes(b.status))
        .reduce((acc: number, b: any) =>
            acc + (b.items ?? []).reduce((s: number, i: any) => s + (i.unitPrice * i.quantity) / 100, 0), 0);

    const currentStay = activeBookings[0] ?? null;
    const recentBookings = [...bookings]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    const profileFields = [user?.firstName, user?.lastName, user?.phone];
    const profilePct = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 pt-16 md:pt-6 space-y-6">

            {/* ── Welcome Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 md:p-8 text-white shadow-xl shadow-blue-500/20 dark:shadow-blue-900/30">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles size={13} className="text-blue-200" />
                            <span className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Tenant Portal</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {firstName} 👋</h1>
                        <p className="text-blue-200 text-sm font-medium">
                            {currentStay
                                ? `Currently staying at ${currentStay.hostel?.name}`
                                : "Your accommodation hub — find, book, and manage hostels"}
                        </p>
                    </div>
                    <div className="flex gap-2 sm:flex-col sm:items-end">
                        <Link href="/hostels" className="h-10 px-5 bg-white text-blue-700 font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-md whitespace-nowrap">
                            <Building2 size={14} /> Browse
                        </Link>
                        <Link href="/tenant/bookings" className="h-10 px-5 bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-white/25 transition-colors whitespace-nowrap">
                            <BookOpen size={14} /> Bookings
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-32" />) : (<>
                    <KpiCard label="Active Stays" value={activeBookings.length} sub="Current bookings" icon={Home} iconBg="bg-blue-500" />
                    <KpiCard
                        label="Pending" value={pendingBookings.length}
                        sub={pendingBookings.length ? "Needs attention" : "Nothing pending"}
                        icon={Clock} iconBg="bg-amber-500"
                        trend={pendingBookings.length > 0 ? { value: "Action needed", up: false } : undefined}
                    />
                    <KpiCard label="Wallet" value={`₵${walletBal.toLocaleString()}`} sub="Available balance" icon={Wallet} iconBg="bg-emerald-500" />
                    <KpiCard label="Total Spent" value={`₵${totalSpent.toLocaleString()}`} sub={`${completedBookings.length} completed`} icon={DollarSign} iconBg="bg-violet-500" />
                </>)}
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left: Current Stay + Bookings List */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Current Accommodation */}
                    <div>
                        <SectionHeader title="Current Accommodation" sub="Your active stay details" href="/tenant/bookings" linkLabel="All bookings" />
                        {isLoading ? <Skeleton className="h-52" /> : currentStay ? (
                            <DashCard>
                                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl" />
                                <div className="p-6 space-y-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                                                <Building2 size={22} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground leading-tight">{currentStay.hostel?.name}</h3>
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium mt-0.5">
                                                    <MapPin size={11} className="text-blue-500 shrink-0" />
                                                    {currentStay.hostel?.city || "Ghana"}
                                                </div>
                                            </div>
                                        </div>
                                        <StatusBadge status={currentStay.status} />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                                        {[
                                            { label: "Room", val: currentStay.items?.[0]?.room?.name ?? "—" },
                                            { label: "Check-in", val: currentStay.items?.[0]?.startDate ? new Date(currentStay.items[0].startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—" },
                                            { label: "Amount", val: `₵${((currentStay.items ?? []).reduce((s: number, i: any) => s + (i.unitPrice * i.quantity) / 100, 0)).toLocaleString()}` },
                                        ].map(({ label, val }) => (
                                            <div key={label}>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                                                <p className="text-sm font-bold text-foreground">{val}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <Link href={`/tenant/bookings/${currentStay.id}`} className="flex items-center justify-center gap-2 w-full h-11 bg-foreground text-background rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors">
                                        View Full Details <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </DashCard>
                        ) : (
                            <DashCard>
                                <EmptyState icon={Building2} title="No active accommodation" description="You don't have an active booking yet. Explore available hostels to get started." href="/hostels" cta="Explore Hostels" />
                            </DashCard>
                        )}
                    </div>

                    {/* Booking History Table */}
                    <div>
                        <SectionHeader title="Booking History" sub="Your recent and past bookings" href="/tenant/bookings" />
                        <DashCard>
                            {isLoading ? (
                                <div className="p-4 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14" />)}</div>
                            ) : recentBookings.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {recentBookings.map((b: any) => (
                                        <Link key={b.id} href={`/tenant/bookings/${b.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Building2 size={15} className="text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{b.hostel?.name ?? "Unknown Hostel"}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium">{new Date(b.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <StatusBadge status={b.status} />
                                                <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={CalendarCheck} title="No bookings yet" description="Start by browsing available student hostels in Ghana." href="/hostels" cta="Browse Hostels" />
                            )}
                        </DashCard>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-5">

                    {/* Profile Card */}
                    <DashCard className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-foreground">My Profile</h3>
                            <Link href="/tenant/account" className="text-[11px] font-bold text-primary hover:underline uppercase tracking-widest">Edit</Link>
                        </div>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md shadow-blue-500/20">
                                {user?.firstName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/20 uppercase tracking-wider">Tenant</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-muted-foreground">Profile completion</span>
                                <span className="text-primary">{profilePct}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${profilePct}%` }} />
                            </div>
                            {profilePct < 100 && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                                    <AlertCircle size={11} /> Add phone number to complete profile
                                </p>
                            )}
                        </div>
                    </DashCard>

                    {/* Stats Summary */}
                    <DashCard className="p-5">
                        <h3 className="text-sm font-bold text-foreground mb-4">Stay Summary</h3>
                        <div className="space-y-3">
                            {[
                                { label: "Total Bookings", val: bookings.length },
                                { label: "Completed Stays", val: completedBookings.length },
                                { label: "Active / Reserved", val: activeBookings.length },
                                { label: "Amount Spent", val: `₵${totalSpent.toLocaleString()}` },
                            ].map(({ label, val }) => (
                                <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <span className="text-xs text-muted-foreground font-medium">{label}</span>
                                    <span className="text-sm font-bold text-foreground">{val}</span>
                                </div>
                            ))}
                        </div>
                    </DashCard>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <QuickAction href="/hostels" icon={Building2} label="Browse Hostels" sub="Find student accommodation" color="bg-blue-500" />
                            <QuickAction href="/tenant/bookings" icon={CreditCard} label="Payment History" sub="Track your transactions" color="bg-emerald-500" />
                            <QuickAction href="/tenant/account" icon={Settings} label="Account Settings" sub="Update your information" color="bg-slate-600" />
                            <QuickAction href="/support" icon={LifeBuoy} label="Help & Support" sub="Get assistance" color="bg-amber-500" />
                        </div>
                    </div>

                    {/* Safety Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-5 text-white">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                        <div className="relative space-y-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                <ShieldCheck size={19} className="text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Secure Bookings</h4>
                                <p className="text-[12px] text-white/50 leading-relaxed mt-1">All transactions are protected and bookings verified by our team.</p>
                            </div>
                            <Link href="/support" className="inline-flex items-center gap-2 h-9 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                                Learn More <ArrowUpRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
