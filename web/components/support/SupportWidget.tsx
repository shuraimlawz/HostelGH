"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import LogoAnimation from "@/components/layout/LogoAnimation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://hostelgh-api.onrender.com").replace(/\/$/, "");

export default function SupportWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [guestName, setGuestName] = useState("");
    const [isGuestInit, setIsGuestInit] = useState(false);
    const [conversation, setConversation] = useState<any>(null);
    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Guest ID persistence
    useEffect(() => {
        if (typeof window !== "undefined" && !user) {
            let gid = localStorage.getItem("hostelgh_guest_id");
            if (!gid) {
                gid = "guest_" + Math.random().toString(36).substring(2, 15);
                localStorage.setItem("hostelgh_guest_id", gid);
            }
            const gname = localStorage.getItem("hostelgh_guest_name");
            if (gname) setGuestName(gname);
        }
    }, [user]);

    // Socket Connection
    useEffect(() => {
        if (!isOpen) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        const socket = io(`${API_BASE_URL}/chat`, {
            auth: { token: localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") }
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            const gid = localStorage.getItem("hostelgh_guest_id");
            socket.emit("request_support", {
                userId: user?.id,
                guestId: gid,
                guestName: guestName
            }, (res: any) => {
                setConversation(res);
                setMessages(res.messages?.slice().reverse() || []); // Database returns desc, we want asc display
            });
        });

        socket.on("new_message", (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on("disconnect", () => setIsConnected(false));

        return () => {
            socket.disconnect();
        };
    }, [isOpen, user]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !socketRef.current || !conversation) return;

        if (!user && !guestName) {
            setIsGuestInit(true);
            return;
        }

        const msgData = {
            conversationId: conversation.id,
            content: newMessage,
            senderId: user?.id || null,
            guestName: user ? null : guestName
        };

        socketRef.current.emit("send_message", msgData);
        setNewMessage("");
    };

    const handleGuestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (guestName.trim()) {
            localStorage.setItem("hostelgh_guest_name", guestName);
            setIsGuestInit(false);
            
            // Re-emit support request to update name on backend if needed
            if (socketRef.current) {
                const gid = localStorage.getItem("hostelgh_guest_id");
                socketRef.current.emit("request_support", { guestId: gid, guestName: guestName }, (res: any) => {
                    setConversation(res);
                    handleSendMessage();
                });
            }
        }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[999] flex flex-col items-end gap-3 sm:gap-4 pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] sm:h-[600px] max-h-[calc(100vh-120px)] sm:max-h-[700px] bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 pointer-events-auto">
                    {/* Header */}
                    <div className="p-6 bg-blue-600 text-white flex items-center justify-between shadow-lg shadow-blue-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-1">
                                <LogoAnimation />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight">HostelGH Support</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isConnected ? "bg-emerald-400" : "bg-red-400")} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                                        {isConnected ? "Direct Line Active" : "Connecting..."}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth" ref={scrollRef}>
                        <div className="text-center pb-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Beginning of conversation</p>
                        </div>
                        
                        {messages.map((msg, i) => {
                            // Identify if message is "Me"
                            // If user is logged in, compare senderId
                            // If guest, compare guestName or assume senderId null is guest (if not admin)
                            const isAdmin = conversation?.participants?.some((p: any) => p.id === msg.senderId && p.role === 'ADMIN');
                            const isMe = user ? (msg.senderId === user.id) : !isAdmin;

                            return (
                                <div key={i} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                    <div className={cn(
                                        "max-w-[85%] px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed",
                                        isMe 
                                            ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10" 
                                            : "bg-gray-100 text-gray-900 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 px-1">
                                        {isAdmin ? "ADMIN " : (isMe ? "YOU • " : "")} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer / Input */}
                    <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                        {isGuestInit ? (
                            <form onSubmit={handleGuestSubmit} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Enter your name to start</p>
                                <input 
                                    type="text" 
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Your Display Name"
                                    className="w-full h-12 px-4 rounded-xl bg-white border border-gray-100 text-xs font-bold outline-none focus:border-blue-500 transition-colors"
                                    autoFocus
                                />
                                <Button type="submit" className="w-full bg-blue-600 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest">Connect to Admin</Button>
                            </form>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center gap-3">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 h-12 pl-4 pr-12 rounded-xl bg-white border border-gray-100 text-xs font-medium outline-none focus:border-blue-500 transition-colors shadow-sm"
                                />
                                <button type="submit" className="absolute right-1 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Bubble Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_8px_30px_rgb(37,99,235,0.4)] hover:scale-110 hover:shadow-[0_12px_40px_rgb(37,99,235,0.6)] transition-all duration-300 active:scale-95 group pointer-events-auto"
            >
                {isOpen ? <X size={28} className="animate-in spin-in-90 duration-300" /> : <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />}
            </button>
        </div>
    );
}
