"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Users,
    Search,
    UserPlus,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Shield,
    UserCog,
    MoreHorizontal,
    Trash2,
    ShieldCheck,
    Mail,
    Filter,
    Ban,
    CheckCircle2
} from "lucide-react";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AdminUsersContent() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const initialPage = parseInt(searchParams.get("page") || "1");
    const [page, setPage] = useState(initialPage);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "ALL");

    const [addUserOpen, setAddUserOpen] = useState(false);
    const [addUserForm, setAddUserForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "ADMIN"
    });

    const updateUrlParams = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    // Sync state with URL
    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
        // Debounce URL update could be added here
        updateUrlParams("search", val || null);
    };

    const handleRoleChange = (val: string) => {
        setRoleFilter(val);
        setPage(1);
        updateUrlParams("role", val === "ALL" ? null : val);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateUrlParams("page", newPage.toString());
    };

    const { data, isLoading } = useQuery({
        queryKey: ["users", page, search, roleFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", "10");
            if (search) params.append("search", search);
            if (roleFilter && roleFilter !== "ALL") params.append("role", roleFilter);

            const res = await api.get(`/admin/users?${params.toString()}`);
            return res.data; // Expecting { data: User[], meta: { total, page, limit, totalPages } }
        }
    });

    const users = data?.data || [];
    const meta = data?.meta || { total: 0, totalPages: 1 };

    const addUserMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post("/admin/users", data);
        },
        onSuccess: () => {
            toast.success("Internal operative created");
            setAddUserOpen(false);
            setAddUserForm({ email: "", password: "", firstName: "", lastName: "", role: "ADMIN" });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Creation failed")
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            return api.patch(`/admin/users/${userId}/role`, { role });
        },
        onSuccess: () => {
            toast.success("Access level modified");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Modification failed")
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ userId, suspended }: { userId: string, suspended: boolean }) => {
            // Note: Endpoint expects { suspended: boolean } in body
            return api.patch(`/admin/users/${userId}/status`, { suspended });
        },
        onSuccess: (_, variables) => {
            toast.success(variables.suspended ? "User suspended" : "User reactivated");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Status update failed")
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            // Check if this endpoint exists or use generic purge
            return api.delete(`/admin/users/${userId}`);
        },
        onSuccess: () => {
            toast.success("User purged from registry");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Purge failed")
    });

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                            Access Control
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <ShieldCheck size={12} className="text-blue-400" /> Identity Management
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-3">
                        Member Registry <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Manage all platform members, adjust privileges, and verify credentials.</p>
                </div>

                <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                    <DialogTrigger asChild>
                        <button className="bg-gray-950 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-3 group active:scale-[0.98]">
                            <UserPlus size={16} />
                            Register Internal Operative
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-[2.5rem] border-gray-100 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-wider">Internal Registry</DialogTitle>
                            <p className="text-xs font-medium text-gray-500">Create administrative or support accounts.</p>
                        </DialogHeader>
                        <div className="space-y-6 py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</Label>
                                    <input
                                        className="w-full bg-gray-50 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                        value={addUserForm.firstName}
                                        onChange={e => setAddUserForm({ ...addUserForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</Label>
                                    <input
                                        className="w-full bg-gray-50 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                        value={addUserForm.lastName}
                                        onChange={e => setAddUserForm({ ...addUserForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Identifier</Label>
                                <input
                                    type="email"
                                    className="w-full bg-gray-50 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                    value={addUserForm.email}
                                    onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Access Credential</Label>
                                <input
                                    type="password"
                                    className="w-full bg-gray-50 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                    value={addUserForm.password}
                                    onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Assigned Role</Label>
                                <select
                                    className="w-full bg-gray-50 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm appearance-none cursor-pointer"
                                    value={addUserForm.role}
                                    onChange={e => setAddUserForm({ ...addUserForm, role: e.target.value })}
                                >
                                    <option value="ADMIN">Administrator</option>
                                    <option value="OWNER">Hostel Owner</option>
                                    <option value="TENANT">Tenant</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => addUserMutation.mutate(addUserForm)}
                                disabled={addUserMutation.isPending || !addUserForm.email || !addUserForm.password}
                                className="w-full bg-gray-950 hover:bg-black text-white rounded-2xl py-6 font-black uppercase tracking-widest text-[11px] shadow-xl"
                            >
                                {addUserMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <UserPlus size={16} className="mr-2" />}
                                Authorize Operative
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Registry Search & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 placeholder:text-gray-400 shadow-sm"
                            placeholder="Search by name, email or ID identifier..."
                        />
                    </div>
                    <div className="relative min-w-[180px]">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            className="w-full h-full bg-white border border-gray-100 rounded-[2rem] pl-14 pr-8 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 shadow-sm text-sm appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Administrators</option>
                            <option value="OWNER">Hostel Owners</option>
                            <option value="TENANT">Tenants</option>
                        </select>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center px-8 gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Total Members</p>
                        <p className="text-2xl font-black text-gray-950 tracking-tighter">{meta.total}</p>
                    </div>
                </div>
            </div>

            {/* Registry Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Scanning Registry...</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-50">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity Details</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Access Level</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Security Status</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Audit Options</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user: any) => (
                                    <tr key={user.id} className={cn("hover:bg-gray-50/50 transition-all group", !user.isActive && "bg-red-50/10")}>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-lg shadow-blue-50 transition-transform group-hover:scale-110 relative">
                                                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                    {!user.isActive && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" title="Suspended" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-950 text-base italic tracking-tight leading-tight flex items-center gap-2">
                                                        {user.firstName} {user.lastName}
                                                        {!user.firstName && !user.lastName && "Anonymous Operative"}
                                                        {user.role === 'ADMIN' && <ShieldCheck size={14} className="text-blue-500" />}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                        <Mail size={10} className="text-gray-300" /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2.5 h-2.5 rounded-full ring-4",
                                                    user.role === "ADMIN" ? "bg-red-500 ring-red-50" : user.role === "OWNER" ? "bg-blue-500 ring-blue-50" : "bg-emerald-500 ring-emerald-50"
                                                )} />
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => updateRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                                                    className="bg-transparent font-black text-[11px] uppercase tracking-widest text-gray-900 outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                                >
                                                    <option value="TENANT">Tenant</option>
                                                    <option value="OWNER">Owner</option>
                                                    <option value="ADMIN">Administrator</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "flex items-center gap-2 px-4 py-2 rounded-xl border w-fit shadow-sm",
                                                    user.emailVerified ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-gray-50 border-gray-100 text-gray-400"
                                                )}>
                                                    {user.emailVerified ? <ShieldCheck size={14} /> : <Shield size={14} />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {user.emailVerified ? "Verified" : "Pending"}
                                                    </span>
                                                </div>
                                                {!user.isActive && (
                                                    <div className="px-3 py-2 rounded-xl border border-red-100 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                                        Suspended
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-3 hover:bg-white hover:shadow-lg rounded-2xl transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 p-2 shadow-xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 py-2">Audit Controls</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: user.id, role: user.role })} className="rounded-lg font-bold text-xs gap-3 py-2.5 cursor-pointer">
                                                        <UserCog size={16} className="text-purple-500" /> Advanced Settings
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toggleStatusMutation.mutate({ userId: user.id, suspended: user.isActive })}
                                                        className="rounded-lg font-bold text-xs gap-3 py-2.5 cursor-pointer"
                                                    >
                                                        {user.isActive ? (
                                                            <>
                                                                <Ban size={16} className="text-orange-500" /> Suspend Access
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={16} className="text-emerald-500" /> Reactivate Access
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-gray-50 my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (confirm(`Authorize permanent purge of ${user.email}?`)) {
                                                                deleteUserMutation.mutate(user.id);
                                                            }
                                                        }}
                                                        className="rounded-lg font-bold text-xs gap-3 py-2.5 text-red-600 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        <Trash2 size={16} /> Purge Identity
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="p-32 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-200">
                                    <Users size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-950 italic uppercase tracking-tighter mb-2">Zero Identifiers Found</h3>
                                <p className="text-gray-400 font-medium">Platform registry is currently empty or search parameters are too restrictive.</p>
                            </div>
                        )}
                    </div>
                )} { /* close isLoading else */}

                {/* Pagination */}
                <div className="px-10 py-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Analyzing {users.length} of {meta.total} Active Identifiers
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-950 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => handlePageChange(Math.min(meta.totalPages, page + 1))}
                            disabled={page === meta.totalPages || meta.totalPages === 0}
                            className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-950 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Initializing Security Protocol...</p>
                </div>
            </div>
        }>
            <AdminUsersContent />
        </Suspense>
    );
}
