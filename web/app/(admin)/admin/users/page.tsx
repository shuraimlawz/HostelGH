"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Users,
    Search,
    UserPlus,
    Loader2,
    ChevronLeft,
    Shield,
    UserCog,
    MoreHorizontal,
    Trash2,
    ShieldCheck,
    Mail,
    Filter,
    Ban,
    CheckCircle2,
    ChevronRight,
    ChevronRight as ChevronRightIcon
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

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
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
            return res.data;
        }
    });

    const users = data?.data || [];
    const meta = data?.meta || { total: 0, totalPages: 1 };

    const addUserMutation = useMutation({
        mutationFn: async (data: any) => api.post("/admin/users", data),
        onSuccess: () => {
            toast.success("Internal operative created");
            setAddUserOpen(false);
            setAddUserForm({ email: "", password: "", firstName: "", lastName: "", role: "ADMIN" });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => api.patch(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => {
            toast.success("Access level modified");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Modification failed")
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ userId, suspended }: { userId: string, suspended: boolean }) => api.patch(`/admin/users/${userId}/status`, { suspended }),
        onSuccess: (_, variables) => {
            toast.success(variables.suspended ? "User suspended" : "User reactivated");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Status update failed")
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => api.delete(`/admin/users/${userId}`),
        onSuccess: () => {
            toast.success("User purged from registry");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Control</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Member Registry</h1>
                    <p className="text-gray-500 text-sm max-w-md">Manage and verify platform entities, from landlords to student residents.</p>
                </div>

                <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                    <DialogTrigger asChild>
                        <button className="h-12 px-8 bg-gray-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-900/10 flex items-center gap-2 active:scale-95">
                            <UserPlus size={16} /> Register Operative
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl p-8">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight uppercase">Internal Registry</DialogTitle>
                            <p className="text-xs font-medium text-gray-400 mt-1">Provision a new administrative or support account.</p>
                        </DialogHeader>
                        <div className="space-y-6 py-6 border-y border-gray-50 my-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">First Name</Label>
                                    <input
                                        className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                        value={addUserForm.firstName}
                                        onChange={e => setAddUserForm({ ...addUserForm, firstName: e.target.value })}
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Last Name</Label>
                                    <input
                                        className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                        value={addUserForm.lastName}
                                        onChange={e => setAddUserForm({ ...addUserForm, lastName: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Identifier</Label>
                                <input
                                    type="email"
                                    className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                    value={addUserForm.email}
                                    onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })}
                                    placeholder="operative@hostelgh.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Access Credential</Label>
                                <input
                                    type="password"
                                    className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                    value={addUserForm.password}
                                    onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Assigned Role</Label>
                                <div className="relative">
                                    <select
                                        className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm appearance-none cursor-pointer"
                                        value={addUserForm.role}
                                        onChange={e => setAddUserForm({ ...addUserForm, role: e.target.value })}
                                    >
                                        <option value="ADMIN">Administrator</option>
                                        <option value="OWNER">Hostel Owner</option>
                                        <option value="TENANT">Tenant Assistant</option>
                                    </select>
                                    <ChevronRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => addUserMutation.mutate(addUserForm)}
                                disabled={addUserMutation.isPending || !addUserForm.email || !addUserForm.password}
                                className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-12 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-gray-900/10"
                            >
                                {addUserMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <UserPlus size={16} className="mr-2" />}
                                Authorize Operative
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Registry Search & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
                <div className="md:col-span-3 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full h-12 bg-white border border-gray-100 rounded-xl pl-12 pr-4 outline-none focus:border-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm text-sm"
                            placeholder="Search by name, email or ID..."
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            className="w-full h-12 bg-white border border-gray-100 rounded-xl pl-12 pr-10 outline-none focus:border-blue-500 transition-all font-bold text-gray-900 shadow-sm text-sm appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Member Roles</option>
                            <option value="ADMIN">Administrators</option>
                            <option value="OWNER">Owners</option>
                            <option value="TENANT">Tenants</option>
                        </select>
                        <ChevronRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 pointer-events-none" size={14} />
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl flex items-center px-6 gap-4 shadow-sm h-12">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                        <Users size={16} />
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total:</p>
                        <p className="text-base font-bold text-gray-950 tracking-tight">{meta.total}</p>
                    </div>
                </div>
            </div>

            {/* Registry Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                            <p className="text-sm font-medium text-gray-400">Syncing registry data...</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-50">
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Entity Details</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Access Role</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Security</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Audit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user: any) => (
                                    <tr key={user.id} className={cn("hover:bg-gray-50/50 transition-all group", !user.isActive && "opacity-60")}>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-inner overflow-hidden shrink-0 border border-gray-100">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-2">
                                                        {user.firstName ? `${user.firstName} ${user.lastName}` : "Unnamed Operative"}
                                                        {user.role === 'ADMIN' && <ShieldCheck size={14} className="text-blue-500" />}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    user.role === "ADMIN" ? "bg-red-500" : user.role === "OWNER" ? "bg-blue-500" : "bg-emerald-500"
                                                )} />
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => updateRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                                                    className="bg-transparent font-bold text-[10px] uppercase tracking-widest text-gray-900 outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                                >
                                                    <option value="TENANT">Tenant</option>
                                                    <option value="OWNER">Owner</option>
                                                    <option value="ADMIN">Administrator</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit font-bold uppercase tracking-widest text-[9px]",
                                                    user.emailVerified ? "bg-emerald-50 border-emerald-100/50 text-emerald-600" : "bg-gray-50 border-gray-100 text-gray-400"
                                                )}>
                                                    {user.emailVerified ? <ShieldCheck size={12} /> : <Shield size={12} />}
                                                    {user.emailVerified ? "Verified" : "Pending"}
                                                </div>
                                                {!user.isActive && (
                                                    <div className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold uppercase tracking-widest">
                                                        Suspended
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-300 hover:text-gray-900 border border-transparent hover:border-gray-100">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-gray-100 p-2 shadow-xl w-52">
                                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 py-2">Audit Controls</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: user.id, role: user.role })} className="rounded-lg font-bold text-[11px] gap-3 py-2.5 cursor-pointer uppercase tracking-wide">
                                                        <UserCog size={14} className="text-indigo-500" /> Member Settings
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toggleStatusMutation.mutate({ userId: user.id, suspended: user.isActive })}
                                                        className="rounded-lg font-bold text-[11px] gap-3 py-2.5 cursor-pointer uppercase tracking-wide"
                                                    >
                                                        {user.isActive ? (
                                                            <>
                                                                <Ban size={14} className="text-orange-500" /> Suspend Access
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={14} className="text-emerald-500" /> Reactivate Access
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-gray-50 my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (confirm(`Authorize terminal purge of ${user.email}?`)) {
                                                                deleteUserMutation.mutate(user.id);
                                                            }
                                                        }}
                                                        className="rounded-lg font-bold text-[11px] gap-3 py-2.5 text-red-600 hover:bg-red-50 cursor-pointer uppercase tracking-wide"
                                                    >
                                                        <Trash2 size={14} /> Purge Identity
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="py-32 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-200 border border-gray-100 shadow-inner">
                                    <Users size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Zero Registry Hits</h3>
                                    <p className="text-gray-400 text-sm font-medium">No members found matching your current parameters.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )} 

                {/* Pagination */}
                <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Analyzing {users.length} of {meta.total} Strategic Entities
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => handlePageChange(Math.min(meta.totalPages, page + 1))}
                            disabled={page === meta.totalPages || meta.totalPages === 0}
                            className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 shadow-sm"
                        >
                            <ChevronRight size={18} />
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
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400">Loading registry...</p>
                </div>
            </div>
        }>
            <AdminUsersContent />
        </Suspense>
    );
}
