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
    X,
    Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [page, setPage] = useState(1);
    const [addUserOpen, setAddUserOpen] = useState(false);
    const [addUserForm, setAddUserForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "ADMIN"
    });

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await api.get("/users");
            return res.data;
        }
    });

    const addUserMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post("/admin/users", data);
        },
        onSuccess: () => {
            toast.success("Internal user created successfully");
            setAddUserOpen(false);
            setAddUserForm({ email: "", password: "", firstName: "", lastName: "", role: "ADMIN" });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create user")
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            return api.patch(`/users/${userId}/role`, { role });
        },
        onSuccess: () => {
            toast.success("User role updated");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update role")
    });

    const filteredUsers = users?.filter((u: any) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase())) ||
        (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase()))
    );

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil((filteredUsers?.length || 0) / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers?.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-950 mb-2">User Registry</h1>
                    <p className="text-gray-500 font-medium">Manage permissions and view all registered platform members.</p>
                </div>

                <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                    <DialogTrigger asChild>
                        <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-gray-200">
                            <UserPlus size={18} />
                            Add Internal User
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Internal User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={addUserForm.firstName}
                                        onChange={e => setAddUserForm({ ...addUserForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={addUserForm.lastName}
                                        onChange={e => setAddUserForm({ ...addUserForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full border rounded-lg p-2"
                                    value={addUserForm.email}
                                    onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    className="w-full border rounded-lg p-2"
                                    value={addUserForm.password}
                                    onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={addUserForm.role}
                                    onChange={e => setAddUserForm({ ...addUserForm, role: e.target.value })}
                                >
                                    <option value="ADMIN">Administrator</option>
                                    <option value="OWNER">Hostel Owner</option>
                                    <option value="TENANT">Tenant</option>
                                </select>
                            </div>
                            <button
                                onClick={() => addUserMutation.mutate(addUserForm)}
                                disabled={addUserMutation.isPending || !addUserForm.email || !addUserForm.password}
                                className="w-full bg-black text-white p-3 rounded-lg font-bold disabled:opacity-50 mt-2"
                            >
                                {addUserMutation.isPending ? "Creating..." : "Create User"}
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border rounded-[1.5rem] py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-900"
                        placeholder="Search by name, email or ID..."
                    />
                </div>
                <div className="bg-white border rounded-[1.5rem] flex items-center justify-center px-6 gap-3">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Users:</span>
                    <span className="text-xl font-black text-blue-600">{users?.length || 0}</span>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">User Details</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned Role</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Internal status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {paginatedUsers?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black shrink-0 relative overflow-hidden">
                                                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{user.firstName} {user.lastName} {!user.firstName && !user.lastName && "Anonymous User"}</p>
                                                <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                user.role === "ADMIN" ? "bg-red-500" : user.role === "OWNER" ? "bg-blue-500" : "bg-gray-400"
                                            )} />
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                                                className="bg-transparent font-bold text-xs uppercase tracking-widest outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                            >
                                                <option value="TENANT">Tenant</option>
                                                <option value="OWNER">Owner</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 bg-white w-fit shadow-sm">
                                            {user.emailVerified ? <Check size={10} className="text-emerald-500" /> : <Shield size={10} className="text-gray-400" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                {user.emailVerified ? "Verified" : "Unverified"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all group-hover:shadow-lg group-hover:scale-110">
                                            <UserCog size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {paginatedUsers?.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500">Adjust your search parameters to find the member you're looking for.</p>
                    </div>
                )}

                <div className="px-8 py-6 bg-gray-50/50 border-t flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Showing {paginatedUsers?.length} of {filteredUsers?.length} Users
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border rounded-lg hover:bg-white transition-colors disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="p-2 border rounded-lg hover:bg-white transition-colors disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
