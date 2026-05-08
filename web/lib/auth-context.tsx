"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";
import { ShieldAlert, X } from "lucide-react";

type User = {
    id: string;
    email: string;
    role: "ADMIN" | "TENANT" | "OWNER";
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    phone?: string;
    gender?: string;
    isOnboarded?: boolean;
    isVerified?: boolean;
    verificationStatus?: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
    verificationNote?: string;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User, remember?: boolean) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    exitShadowMode: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShadowMode, setIsShadowMode] = useState(false);

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
            const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

            if (token && storedUser && storedUser !== "undefined") {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user", e);
                    localStorage.removeItem("user");
                    localStorage.removeItem("accessToken");
                    sessionStorage.removeItem("user");
                    sessionStorage.removeItem("accessToken");
                }
            }
            
            if (localStorage.getItem("adminOriginalToken")) {
                setIsShadowMode(true);
            }
            
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = useCallback((token: string, userData: User, remember = false) => {
        if (!token || !userData) {
            console.error("Login failed: missing token or user data");
            return;
        }
        const storage = remember ? localStorage : sessionStorage;

        storage.setItem("accessToken", token);
        storage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
        window.location.href = "/";
    }, []);

    const updateUser = useCallback((updatedData: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const newUser = { ...prev, ...updatedData };
            localStorage.setItem("user", JSON.stringify(newUser));
            return newUser;
        });
    }, []);

    const exitShadowMode = useCallback(() => {
        const originalToken = localStorage.getItem("adminOriginalToken");
        const originalUser = localStorage.getItem("adminOriginalUser");
        
        if (originalToken && originalUser) {
            localStorage.setItem("accessToken", originalToken);
            localStorage.setItem("user", originalUser);
            
            localStorage.removeItem("adminOriginalToken");
            localStorage.removeItem("adminOriginalUser");
            
            setUser(JSON.parse(originalUser));
            setIsShadowMode(false);
            window.location.href = "/admin";
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser, exitShadowMode }}>
            {children}
            {isShadowMode && (
                <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-violet-600 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border-2 border-violet-400/30">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="animate-pulse text-violet-200" size={20} />
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-violet-200">System Override</p>
                                <p className="text-sm font-bold tracking-tight">Shadow Mode Active</p>
                            </div>
                        </div>
                        <button 
                            onClick={exitShadowMode}
                            className="h-10 px-4 bg-white text-violet-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-violet-50 transition-colors flex items-center gap-2 ml-4"
                        >
                            <X size={14} /> Exit
                        </button>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
