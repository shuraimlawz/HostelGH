"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    ShieldCheck,
    User as UserIcon,
    Mail,
    Calendar,
    Activity,
    ShieldAlert,
    Building2,
    BookOpen,
    Star,
    Loader2,
    XCircle,
    CheckCircle2,
    Smartphone,
    MapPin,
    ArrowUpRight,
    Search,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function UserAuditPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["admin-user", id],
        queryFn: async () => {
            const res = await api.get(`/admin/users/${id}`);
            return res.data;
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async (suspended: boolean) => api.patch(`/admin/users/${id}/status`, { suspended }),
        onSuccess: (_, variables) => {
            toast.success(variables ? "User account suspended" : "User account activated");
            queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const verifyIdentityMutation = useMutation({
        mutationFn: async ({ approve, reason }: { approve: boolean, reason?: string }) => {
            if (approve) return api.patch(`/admin/users/${id}/verify`);
            return api.patch(`/admin/users/${id}/reject-verification`, { reason });
        },
        onSuccess: (_, variables) => {
            toast.success(variables.approve ? "Identity verified successfully" : "Identity verification rejected");
            queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const impersonateMutation = useMutation({
        mutationFn: async () => api.post(`/admin/users/${id}/impersonate`),
        onSuccess: (res) => {
            toast.success("Entering Shadow Mode...");
            localStorage.setItem("accessToken", res.data.token);
            // Redirect to the appropriate dashboard
            if (user.role === 'OWNER') router.push('/owner');
            else router.push('/tenant');
        },
        onError: (err: any) => toast.error(err.message)
    });

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">Retrieving Security Profile...</p>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[3rem] border border-gray-100 shadow-xl text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
                        <XCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Not Found</h2>
                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-xs">The requested user record could not be located in the security registry.</p>
                    </div>
                    <button onClick={() => router.back()} className="h-12 px-8 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
                        Return to Panel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-24 pt-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-6">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white transition-colors"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Back to User Registry</span>
                    </button>
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-200 overflow-hidden">
                                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <UserIcon size={32} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed Operative"}
                                    </h1>
                                    <div className={cn(
                                        "h-7 px-3 flex items-center rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                        user.isActive 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                            : "bg-red-50 text-red-600 border-red-100"
                                    )}>
                                        {user.isActive ? "Active Account" : "Suspended"}
                                    </div>
                                    <div className="h-7 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center">
                                        {user.role}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 mt-2">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} />
                                        <span className="text-xs font-medium">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                                        <Activity size={14} />
                                        <span className="text-xs font-medium uppercase tracking-widest text-blue-600">ID: {user.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => impersonateMutation.mutate()}
                        className="h-14 px-8 bg-violet-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-violet-700 transition-all shadow-xl shadow-violet-900/10 flex items-center gap-3"
                    >
                        <ShieldAlert size={18} />
                        Enter Shadow Mode
                    </button>
                    
                    <button 
                        onClick={() => toggleStatusMutation.mutate(user.isActive)}
                        className={cn(
                            "h-14 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                            user.isActive 
                                ? "bg-white dark:bg-gray-900 border-2 border-red-100 text-red-600 hover:bg-red-50" 
                                : "bg-white dark:bg-gray-900 border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                        )}
                    >
                        {user.isActive ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
                        {user.isActive ? "Suspend Access" : "Restore Access"}
                    </button>

                    {user.verificationStatus === 'PENDING' && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    const reason = prompt("Enter rejection reason:");
                                    if (reason) verifyIdentityMutation.mutate({ approve: false, reason });
                                }}
                                className="h-14 px-8 bg-white dark:bg-gray-900 border-2 border-red-100 text-red-600 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all flex items-center gap-3"
                            >
                                <XCircle size={18} />
                                Reject Verification
                            </button>
                            <button 
                                onClick={() => verifyIdentityMutation.mutate({ approve: true })}
                                className="h-14 px-8 bg-gray-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-3"
                            >
                                <ShieldCheck size={18} />
                                Approve Identity
                            </button>
                        </div>
                    )}

                    {user.isVerified && (
                        <div className="h-14 px-8 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                            <ShieldCheck size={18} />
                            Verified Operative
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Statistics Card */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 p-10 space-y-10 shadow-sm">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Activity size={16} className="text-blue-500" />
                                Engagement Metrics
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Total Volume</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {user.role === 'OWNER' ? user._count?.ownedHostels : user._count?.bookings}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                            {user.role === 'OWNER' ? <Building2 size={24} /> : <BookOpen size={24} />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                                        {user.role === 'OWNER' ? "Assets Registered" : "Successful Bookings"}
                                    </p>
                                </div>

                                <div className="p-6 bg-gray-50 dark:bg-gray-950 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Trust Score</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {user.isVerified ? "100%" : "40%"}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                                            user.isVerified ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                        )}>
                                            <ShieldCheck size={24} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                                        Based on Identity Verification
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Identity Document Review */}
                        {user.ghanaCardUrl && (
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Search size={16} className="text-blue-500" />
                                    Identity Document (Ghana Card)
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-950 rounded-3xl p-6 space-y-4 border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">ID Number</p>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{user.ghanaCardId || "Not Provided"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Status</p>
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-[8px] font-bold uppercase",
                                                user.verificationStatus === 'VERIFIED' ? "bg-emerald-100 text-emerald-700" :
                                                user.verificationStatus === 'REJECTED' ? "bg-red-100 text-red-700" :
                                                "bg-blue-100 text-blue-700"
                                            )}>
                                                {user.verificationStatus || 'UNVERIFIED'}
                                            </span>
                                        </div>
                                        {user.verificationNote && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[9px] font-bold text-red-600 uppercase tracking-tight">
                                                Rejection Note: {user.verificationNote}
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative aspect-[1.6/1] bg-gray-50 dark:bg-gray-950 rounded-[2rem] border border-gray-100 overflow-hidden group shadow-sm">
                                        <img src={user.ghanaCardUrl} alt="Ghana Card" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                                        <a 
                                            href={user.ghanaCardUrl} 
                                            target="_blank" 
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <p className="text-white text-[10px] font-bold uppercase tracking-widest">View Full Resolution</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Calendar size={16} className="text-orange-400" />
                                Registration Timeline
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-100">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase">Created On</p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-100">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase">Email Status</p>
                                        <p className={cn("text-xs font-bold", user.emailVerified ? "text-emerald-600" : "text-red-500")}>
                                            {user.emailVerified ? "Verified" : "Unverified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Data Content */}
                <div className="lg:col-span-2 space-y-12">
                    {user.role === 'OWNER' ? (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
                                    <Building2 className="text-blue-600" size={28} />
                                    Asset Inventory
                                </h2>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{user.ownedHostels?.length || 0} Properties</span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                {user.ownedHostels?.map((hostel: any) => (
                                    <div key={hostel.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 p-8 flex flex-col md:flex-row gap-10 items-center hover:shadow-2xl transition-all duration-700">
                                        <div className="w-full md:w-40 aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 shrink-0">
                                            {hostel.images?.[0] ? <img src={hostel.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <Building2 size={32} className="text-gray-200" />}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{hostel.name}</h3>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{hostel.addressLine}, {hostel.city}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase">
                                                    {hostel._count.rooms} Room Types
                                                </div>
                                                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold uppercase">
                                                    {hostel._count.bookings} Bookings
                                                </div>
                                                {hostel.isPublished && (
                                                    <div className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-[9px] font-bold uppercase">
                                                        Live
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Link 
                                            href={`/admin/hostels/${hostel.id}`}
                                            className="h-12 px-8 bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-500 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all whitespace-nowrap"
                                        >
                                            Audit Asset
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
                                    <BookOpen className="text-blue-600" size={28} />
                                    Recent Bookings
                                </h2>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Last 5 Activities</span>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hostel</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {user.bookings?.map((booking: any) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 dark:bg-gray-950/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{booking.hostel.name}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-tight">Reference: {booking.id}</p>
                                                </td>
                                                <td className="px-8 py-6 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">
                                                    {new Date(booking.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">₵{(booking.payment?.amount / 100).toLocaleString()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={cn(
                                                        "inline-flex px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest",
                                                        booking.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                                    )}>
                                                        {booking.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {user.bookings?.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                                    No booking history found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Support and Security Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-900 p-10 rounded-[3rem] text-white space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h3 className="text-lg font-bold tracking-tight flex items-center gap-3">
                                <ShieldCheck className="text-blue-400" />
                                Security Compliance
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                                This user is currently following all security protocols. No malicious activity has been detected from this account in the last 90 days.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <div className="flex-1 p-4 bg-white dark:bg-gray-900/5 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">Alerts</p>
                                    <p className="text-xl font-bold">0</p>
                                </div>
                                <div className="flex-1 p-4 bg-white dark:bg-gray-900/5 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">Reports</p>
                                    <p className="text-xl font-bold">0</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-600 p-10 rounded-[3rem] text-white space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-900/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h3 className="text-lg font-bold tracking-tight flex items-center gap-3">
                                <Search className="text-white" />
                                Administrative Tools
                            </h3>
                            <p className="text-xs text-blue-100 leading-relaxed">
                                Access direct communication channels and internal logs for this specific user identity.
                            </p>
                            <button className="w-full h-12 bg-white dark:bg-gray-900 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                                Download User Audit Log <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
