"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { 
    Activity, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    ArrowLeft,
    Clock,
    User,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";

export default function AdminLogsPage() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data: logData, isLoading } = useQuery({
        queryKey: ["admin-logs", page],
        queryFn: async () => {
            const res = await api.get(`/admin/activity?page=${page}&limit=${limit}`);
            return res.data;
        }
    });

    const activities = logData?.activities || [];
    const meta = logData?.meta || { totalPages: 1, total: 0 };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">System Audit Logs</h1>
                        <p className="text-muted-foreground font-medium">Detailed tracking of all global actions on HostelGH.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-950/50">
                                <TableRow>
                                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 dark:text-gray-500">Status</TableHead>
                                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 dark:text-gray-500">User</TableHead>
                                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 dark:text-gray-500">Action</TableHead>
                                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 dark:text-gray-500">Timestamp</TableHead>
                                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 dark:text-gray-500 text-right">Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activities.map((log: any, i: number) => (
                                    <TableRow key={i} className="hover:bg-gray-50 dark:bg-gray-950/50 transition-colors group">
                                        <TableCell className="py-6 px-8">
                                            <div className={cn(
                                                "w-2.5 h-2.5 rounded-full",
                                                log.type === "success" && "bg-emerald-500 shadow-sm shadow-emerald-200",
                                                log.type === "info" && "bg-blue-500 shadow-sm shadow-blue-200",
                                                log.type === "warning" && "bg-orange-500 shadow-sm shadow-orange-200",
                                                log.type === "critical" && "bg-red-500 shadow-sm shadow-red-200"
                                            )} />
                                        </TableCell>
                                        <TableCell className="py-6 px-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">{log.user}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 px-8 font-medium text-gray-700">
                                            {log.action}
                                        </TableCell>
                                        <TableCell className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                    {new Date(log.time).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                                    {new Date(log.time).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-right">
                                            <Link 
                                                href={log.targetUrl || "#"}
                                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                View Source <ExternalLink size={10} />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {activities.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs">
                                            No system logs found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="p-8 bg-gray-50 dark:bg-gray-950 border-t flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Showing {(page - 1) * limit + 1} - {Math.min(page * limit, meta.total)} of {meta.total} events
                    </p>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage(p => p - 1)}
                            className="rounded-xl border-gray-200"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <div className="px-4 text-xs font-black uppercase tracking-widest">
                            Page {page} of {meta.totalPages}
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={page >= meta.totalPages || isLoading}
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-xl border-gray-200"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
