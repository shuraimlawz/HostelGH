"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Activity, ChevronLeft, ChevronRight, User, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DashCard, SectionHeader, Skeleton } from "@/components/dashboard/DashComponents";

const TYPE_DOT: Record<string, string> = {
    success: "bg-emerald-500 shadow-emerald-200 dark:shadow-emerald-900/30",
    info:    "bg-blue-500 shadow-blue-200 dark:shadow-blue-900/30",
    warning: "bg-amber-500 shadow-amber-200 dark:shadow-amber-900/30",
    critical: "bg-red-500 shadow-red-200 dark:shadow-red-900/30",
};

export default function AdminLogsPage() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data: logData, isLoading } = useQuery({
        queryKey: ["admin-logs", page],
        queryFn: async () => (await api.get(`/admin/activity?page=${page}&limit=${limit}`)).data
    });

    const activities: any[] = logData?.activities ?? [];
    const meta = logData?.meta ?? { totalPages: 1, total: 0 };

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 pt-16 lg:pt-6 space-y-6">

            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Admin Audit</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Activity Logs</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1">Detailed tracking of all global actions on HostelGH.</p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Events", val: meta.total ?? 0, dot: "bg-blue-500" },
                    { label: "This Page", val: activities.length, dot: "bg-emerald-500" },
                    { label: "Critical", val: activities.filter(a => a.type === "critical").length, dot: "bg-red-500" },
                    { label: "Warnings", val: activities.filter(a => a.type === "warning").length, dot: "bg-amber-500" },
                ].map(({ label, val, dot }) => (
                    <div key={label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
                        <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", dot)} />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                            <p className="text-xl font-bold text-foreground">{val}</p>
                        </div>
                    </div>
                ))}
            </div>

            <DashCard>
                {isLoading ? (
                    <div className="p-4 space-y-3">{[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-14" />)}</div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        {["Status", "User", "Action", "Timestamp", ""].map(h => (
                                            <th key={h} className="px-5 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {activities.map((log, i) => (
                                        <tr key={i} className="hover:bg-muted/40 transition-colors group">
                                            <td className="px-5 py-4">
                                                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", TYPE_DOT[log.type] ?? "bg-slate-400")} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                        <User size={13} />
                                                    </div>
                                                    <span className="font-bold text-foreground text-xs">{log.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-foreground font-medium">{log.action}</td>
                                            <td className="px-5 py-4">
                                                <p className="text-xs font-bold text-foreground">{new Date(log.time).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{new Date(log.time).toLocaleTimeString()}</p>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {log.targetUrl && (
                                                    <a href={log.targetUrl} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        View <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {activities.length === 0 && (
                                        <tr><td colSpan={5} className="px-5 py-16 text-center text-sm text-muted-foreground font-medium">No system logs found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile list */}
                        <div className="md:hidden divide-y divide-border">
                            {activities.map((log, i) => (
                                <div key={i} className="px-4 py-4 flex items-start gap-3">
                                    <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", TYPE_DOT[log.type] ?? "bg-slate-400")} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground">{log.user}</p>
                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{log.action}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(log.time).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {activities.length > 0 ? `${(page - 1) * limit + 1}–${Math.min(page * limit, meta.total)} of ${meta.total}` : "No results"}
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-30">
                                    <ChevronLeft size={15} />
                                </button>
                                <span className="text-xs font-bold text-foreground px-3">{page} / {meta.totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                                    className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-30">
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </DashCard>
        </div>
    );
}
