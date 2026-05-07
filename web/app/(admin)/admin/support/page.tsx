"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { MessageSquare, User, Send, CheckCircle2, Search, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://hostelgh.onrender.com").replace(/\/$/, "");

export default function AdminSupportPage() {
    const { user } = useAuth();
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: conversations, isLoading, refetch } = useQuery({
        queryKey: ["admin-support-conversations"],
        queryFn: async () => (await api.get("/chat/support/active")).data
    });

    // Socket Setup
    useEffect(() => {
        const s = io(`${API_BASE_URL}/chat`, {
            auth: { token: localStorage.getItem("accessToken") }
        });

        s.on("connect", () => console.log("Admin connected to chat"));
        s.on("new_message", (msg) => {
            if (selectedConversation?.id === msg.conversationId) {
                setMessages(prev => [...prev, msg]);
            }
            refetch(); // Update sidebar last message
        });

        setSocket(s);
        return () => { s.disconnect(); };
    }, [selectedConversation?.id, refetch]);

    // Room management
    useEffect(() => {
        if (selectedConversation && socket) {
            socket.emit("join_room", selectedConversation.id);
            // Fetch history
            api.get(`/chat/${selectedConversation.id}/messages`).then(res => {
                setMessages(res.data);
            });
        }
    }, [selectedConversation, socket]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !selectedConversation) return;

        socket.emit("send_message", {
            conversationId: selectedConversation.id,
            content: newMessage,
            senderId: user?.id
        });
        setNewMessage("");
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in duration-700">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50 dark:bg-gray-950/30">
                <div className="p-8 border-b border-gray-100 bg-white dark:bg-gray-900">
                    <h1 className="text-xl font-bold tracking-tight mb-6">Support Pulse</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
                        <input 
                            type="text" 
                            placeholder="Find user..." 
                            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-950 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-blue-500 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl w-full" />)
                    ) : (
                        conversations?.map((conv: any) => {
                            const lastMsg = conv.messages?.[0];
                            const guest = conv.guestId ? (lastMsg?.guestName || "Guest User") : null;
                            const participant = conv.participants.find((p: any) => p.role !== 'ADMIN');
                            const displayName = guest || (participant ? `${participant.firstName} ${participant.lastName}` : "Unknown");

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl text-left transition-all border group relative",
                                        selectedConversation?.id === conv.id 
                                            ? "bg-white dark:bg-gray-900 border-blue-100 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10" 
                                            : "bg-transparent border-transparent hover:bg-white dark:bg-gray-900 hover:border-gray-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                                            conv.isSupport ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-gray-100 border-gray-200 text-gray-400 dark:text-gray-500"
                                        )}>
                                            <User size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="font-bold text-xs text-gray-900 dark:text-white truncate tracking-tight">{displayName}</p>
                                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 shrink-0">
                                                    {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate leading-relaxed">
                                                {lastMsg?.content || "No messages yet"}
                                            </p>
                                        </div>
                                        {!lastMsg?.isRead && !participant && (
                                            <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-500/50" />
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 flex items-center justify-center text-blue-600 shadow-inner">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg tracking-tight">
                                        {selectedConversation.guestId ? (messages[0]?.guestName || "Guest Case") : `${selectedConversation.participants.find((p: any) => p.role !== 'ADMIN')?.firstName} (Registered)`}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgb(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Technical Support Line 01</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2 bg-gray-50 dark:bg-gray-950">
                                    <CheckCircle2 size={14} /> Resolve Case
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-gray-50 dark:bg-gray-950/20" ref={scrollRef}>
                            {messages.map((msg, i) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={i} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300", isMe ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "max-w-[70%] px-6 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                                            isMe 
                                                ? "bg-gray-900 text-white rounded-tr-none border border-gray-800" 
                                                : "bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-tl-none border border-gray-100"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 px-1">
                                            {isMe && <CheckCircle2 size={10} className="text-blue-500" />}
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-8 border-t border-gray-50 bg-white dark:bg-gray-900">
                            <form onSubmit={handleSend} className="relative flex items-center gap-4">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type official response..."
                                    className="flex-1 h-14 pl-6 pr-20 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-transparent text-sm font-medium outline-none focus:bg-white dark:bg-gray-900 focus:border-blue-500 transition-all shadow-inner"
                                />
                                <button type="submit" className="absolute right-2 h-10 px-6 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center gap-2">
                                    <Send size={14} /> Dispatch
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-gray-950/10">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 relative">
                            <MessageSquare size={48} className="text-blue-600" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                <ShieldAlert size={14} className="text-amber-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3 italic uppercase">Tactical Support Center</h2>
                        <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm font-medium leading-loose">
                            Select a strategic conversation from the left pulse to begin a direct communication session with the target user.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
