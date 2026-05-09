"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft, ShieldCheck, User as UserIcon, Mail, Calendar,
    Activity, ShieldAlert, Building2, BookOpen, Loader2,
    XCircle, CheckCircle2, ArrowUpRight, Search, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { StatusBadge, DashCard, Skeleton } from "@/components/dashboard/DashComponents";

export default function UserAuditPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["admin-user", id],
        queryFn: async () => (await api.get(`/admin/users/${id}`)).data
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async (suspended: boolean) => api.patch(`/admin/users/${id}/status`, { suspended }),
        onSuccess: (_, suspended) => {
            toast.success(suspended ? "Account suspended" : "Account activated");
            queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ approve, reason }: { approve: boolean; reason?: string }) =>
            approve ? api.patch(`/admin/users/${id}/verify`) : api.patch(`/admin/users/${id}/reject-verification`, { reason }),
        onSuccess: (_, { approve }) => {
            toast.success(approve ? "Identity verified" : "Verification rejected");
            queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const impersonateMutation = useMutation({
        mutationFn: async () => api.post(`/admin/users/${id}/impersonate`),
        onSuccess: (res) => {
            toast.success("Entering Shadow Mode...");
            const currentToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
            const currentUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (currentToken && currentUser) {
                localStorage.setItem("adminOriginalToken", currentToken);
                localStorage.setItem("adminOriginalUser", currentUser);
            }
            localStorage.setItem("accessToken", res.data.token);
            if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
            window.location.href = user.role === "OWNER" ? "/owner" : "/tenant";
        },
        onError: (err: any) => toast.error(err.message)
    });

    if (isLoading) return (
        <div className="flex h-[70vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-primary" size={36} />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Profile...</p>
            </div>
        </div>
    );

    if (isError || !user) return (
        <div className="flex h-[70vh] items-center justify-center">
            <DashCard className="max-w-sm w-full p-10 text-center space-y-5 mx-4">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <XCircle size={32} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Profile Not Found</h2>
                    <p className="text-sm text-muted-foreground">User record could not be located.</p>
                </div>
                <button onClick={() => router.back()} className="h-11 px-6 bg-foreground text-background rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-opacity">
                    Go Back
                </button>
            </DashCard>
        </div>
    );

    const trustScore = user.isVerified ? 100 : user.verificationStatus === "PENDING" ? 60 : 40;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed User";
    const vol = user.role === "OWNER" ? (user._count?.ownedHostels ?? 0) : (user._count?.bookings ?? 0);

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 pt-16 lg:pt-6 space-y-6">

            {/* ── Back + Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-4">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Back to User Registry</span>
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border border-border overflow-hidden shrink-0">
                            {user.avatarUrl
                                ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt={fullName} />
                                : <UserIcon size={28} className="text-muted-foreground" />
                            }
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{fullName}</h1>
                                <span className={cn("h-6 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center",
                                    user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                        : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                )}>
                                    {user.isActive ? "Active Account" : "Suspended"}
                                </span>
                                <span className="h-6 px-2.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center">
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                    <Mail size={13} /> {user.email}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary border-l border-border pl-4">
                                    <Activity size={13} /> ID: {user.id?.slice(0, 16)}…
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 lg:shrink-0">
                    <button
                        onClick={() => impersonateMutation.mutate()}
                        disabled={impersonateMutation.isPending}
                        className="h-10 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shadow-violet-500/20 disabled:opacity-50"
                    >
                        {impersonateMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <ShieldAlert size={13} />}
                        Enter Shadow Mode
                    </button>
                    <button
                        onClick={() => toggleStatusMutation.mutate(user.isActive)}
                        disabled={toggleStatusMutation.isPending}
                        className={cn(
                            "h-10 px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border-2 transition-all disabled:opacity-50",
                            user.isActive
                                ? "bg-card border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                                : "bg-card border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10"
                        )}
                    >
                        {user.isActive ? <ShieldAlert size={13} /> : <CheckCircle2 size={13} />}
                        {user.isActive ? "Suspend Access" : "Restore Access"}
                    </button>

                    {user.verificationStatus === "PENDING" && (
                        <>
                            <button
                                onClick={() => { const r = prompt("Rejection reason:"); if (r) verifyMutation.mutate({ approve: false, reason: r }); }}
                                className="h-10 px-5 bg-card border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all"
                            >
                                <XCircle size={13} /> Reject
                            </button>
                            <button
                                onClick={() => verifyMutation.mutate({ approve: true })}
                                className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-md"
                            >
                                <ShieldCheck size={13} /> Approve Identity
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left — Engagement Metrics Panel */}
                <div className="space-y-4">
                    <DashCard className="p-6 space-y-6">
                        {/* Engagement Metrics */}
                        <div>
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Activity size={14} className="text-primary" /> Engagement Metrics
                            </h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Volume</p>
                                        <p className="text-2xl font-bold text-foreground">{vol}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            {user.role === "OWNER" ? "Assets Registered" : "Successful Bookings"}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center text-primary border border-border shadow-sm shrink-0">
                                        {user.role === "OWNER" ? <Building2 size={22} /> : <BookOpen size={22} />}
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Trust Score</p>
                                            <p className="text-2xl font-bold text-foreground">{trustScore}%</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Based on Identity Verification</p>
                                        </div>
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border shrink-0",
                                            user.isVerified
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                                : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                        )}>
                                            <ShieldCheck size={22} />
                                        </div>
                                    </div>
                                    <div className="h-2 bg-border rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all", user.isVerified ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${trustScore}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ghana Card */}
                        {user.ghanaCardUrl && (
                            <div>
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <Search size={14} className="text-primary" /> Identity Document
                                </h3>
                                <div className="bg-muted/50 rounded-xl border border-border p-4 space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">ID Number</span>
                                        <span className="font-bold text-foreground">{user.ghanaCardId ?? "Not provided"}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Status</span>
                                        <StatusBadge status={user.verificationStatus ?? "UNVERIFIED"} />
                                    </div>
                                    {user.verificationNote && (
                                        <div className="p-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">
                                            Note: {user.verificationNote}
                                        </div>
                                    )}
                                    <div className="relative aspect-[1.6/1] bg-muted rounded-xl overflow-hidden group border border-border">
                                        <img src={user.ghanaCardUrl} alt="Ghana Card" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <a href={user.ghanaCardUrl} target="_blank" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-[10px] font-bold uppercase tracking-widest">View Full Resolution</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Registration Timeline */}
                        <div>
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                                <Calendar size={14} className="text-amber-500" /> Registration Timeline
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Calendar, label: "Created On", val: new Date(user.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) },
                                    { icon: ShieldCheck, label: "Email Status", val: user.emailVerified ? "Verified" : "Unverified", valColor: user.emailVerified ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400" },
                                ].map(({ icon: Icon, label, val, valColor }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border shrink-0">
                                            <Icon size={15} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                                            <p className={cn("text-sm font-bold text-foreground", (valColor as any))}>{val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DashCard>
                </div>

                {/* Right — Asset Inventory / Bookings + Admin Cards */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Asset Inventory / Bookings Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
                            {user.role === "OWNER" ? <Building2 className="text-primary" size={22} /> : <BookOpen className="text-primary" size={22} />}
                            {user.role === "OWNER" ? "Asset Inventory" : "Recent Bookings"}
                        </h2>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {user.role === "OWNER" ? `${user.ownedHostels?.length ?? 0} Properties` : "Last 5 activities"}
                        </span>
                    </div>

                    {/* Owner: Hostel Cards */}
                    {user.role === "OWNER" ? (
                        <div className="space-y-4">
                            {user.ownedHostels?.length > 0 ? user.ownedHostels.map((h: any) => (
                                <DashCard key={h.id} className="p-5">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                                            {h.images?.[0]
                                                ? <img src={h.images[0]} className="w-full h-full object-cover" alt={h.name} />
                                                : <div className="w-full h-full flex items-center justify-center"><Building2 size={24} className="text-muted-foreground" /></div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <h3 className="font-bold text-foreground text-base leading-tight">{h.name}</h3>
                                            <p className="text-xs text-muted-foreground">{h.addressLine}, {h.city}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg text-[9px] font-bold uppercase border border-blue-100 dark:border-blue-500/20">{h._count?.rooms ?? 0} Room Types</span>
                                                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] font-bold uppercase border border-emerald-100 dark:border-emerald-500/20">{h._count?.bookings ?? 0} Bookings</span>
                                                {h.isPublished && <span className="px-2.5 py-1 bg-foreground text-background rounded-lg text-[9px] font-bold uppercase">Live</span>}
                                            </div>
                                        </div>
                                        <Link href={`/admin/hostels/${h.id}`} className="h-9 px-4 bg-muted hover:bg-foreground hover:text-background border border-border rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap shrink-0">
                                            Audit <ArrowUpRight size={12} />
                                        </Link>
                                    </div>
                                </DashCard>
                            )) : (
                                <DashCard className="p-10 text-center">
                                    <p className="text-sm text-muted-foreground font-medium">No hostels registered yet.</p>
                                </DashCard>
                            )}
                        </div>
                    ) : (
                        /* Tenant: Bookings Table */
                        <DashCard>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            {["Hostel", "Date", "Amount", "Status"].map(h => (
                                                <th key={h} className="px-5 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {user.bookings?.length > 0 ? user.bookings.map((b: any) => (
                                            <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-5 py-4">
                                                    <p className="font-bold text-foreground">{b.hostel?.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">Ref: {b.id?.slice(-8)}</p>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-muted-foreground font-medium">{new Date(b.createdAt).toLocaleDateString()}</td>
                                                <td className="px-5 py-4 font-bold text-foreground">₵{((b.payment?.amount ?? 0) / 100).toLocaleString()}</td>
                                                <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="px-5 py-16 text-center text-sm text-muted-foreground font-medium">No booking history found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </DashCard>
                    )}

                    {/* Admin Tool Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Security Compliance */}
                        <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 text-white space-y-4">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative">
                                <h3 className="font-bold flex items-center gap-3 mb-2">
                                    <ShieldCheck className="text-blue-400" size={18} /> Security Compliance
                                </h3>
                                <p className="text-xs text-white/50 leading-relaxed">
                                    This user is currently following all security protocols. No malicious activity detected in the last 90 days.
                                </p>
                                <div className="grid grid-cols-2 gap-3 mt-5">
                                    {[{ label: "Alerts", val: 0 }, { label: "Reports", val: 0 }].map(({ label, val }) => (
                                        <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1">{label}</p>
                                            <p className="text-xl font-bold">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Administrative Tools */}
                        <div className="relative overflow-hidden bg-blue-600 rounded-2xl p-6 text-white space-y-4">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative">
                                <h3 className="font-bold flex items-center gap-3 mb-2">
                                    <Search className="text-white" size={18} /> Administrative Tools
                                </h3>
                                <p className="text-xs text-blue-100 leading-relaxed">
                                    Access direct communication channels and internal logs for this specific user identity.
                                </p>
                                <button className="w-full mt-5 h-11 bg-white text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                                    <Download size={13} /> Download User Audit Log
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
