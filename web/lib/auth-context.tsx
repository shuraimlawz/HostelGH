"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";

type User = {
    id: string;
    email: string;
    role: "ADMIN" | "TENANT" | "OWNER";
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    phone?: string;
    isOnboarded?: boolean;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("accessToken");
            if (storedUser && token && storedUser !== "undefined") {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user", e);
                    localStorage.removeItem("user");
                    localStorage.removeItem("accessToken");
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = useCallback((token: string, userData: User) => {
        if (!token || !userData) {
            console.error("Login failed: missing token or user data");
            return;
        }
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.clear();
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

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
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
