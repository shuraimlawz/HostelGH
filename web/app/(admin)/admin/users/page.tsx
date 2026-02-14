"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Users,
    Search,
    MoreHorizontal,
    Mail,
    Shield,
    UserPlus,
    Loader2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserCog
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await api.get("/users");
            return res.data;
        }
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
        (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    );

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
                <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-gray-200">
                    <UserPlus size={18} />
                    Add Internal User
                </button>
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
                            {filteredUsers?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black shrink-0">
                                                {user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{user.name || "Anonymous User"}</p>
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
                                            <Shield size={10} className="text-gray-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Verified</span>
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

                {filteredUsers?.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500">Adjust your search parameters to find the member you're looking for.</p>
                    </div>
                )}

                <div className="px-8 py-6 bg-gray-50/50 border-t flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Showing {filteredUsers?.length} of {users?.length} Users</p>
                    <div className="flex gap-2">
                        <button className="p-2 border rounded-lg hover:bg-white transition-colors disabled:opacity-30" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="p-2 border rounded-lg hover:bg-white transition-colors disabled:opacity-30" disabled>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
