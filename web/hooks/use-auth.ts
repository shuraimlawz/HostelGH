"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "@/lib/validators";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useLogin() {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (values: any) => {
        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", values);
            console.log("Full Axios response:", response);
            const { data } = response;
            console.log("Login response body (data):", data);
            console.log("Data keys:", Object.keys(data || {}));
            login(data.accessToken, data.user);
            toast.success("Welcome back!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return { handleLogin, isLoading };
}

export function useRegister() {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (values: any) => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/register", values);
            console.log("Register response data:", data);
            if (data.accessToken && data.user) {
                login(data.accessToken, data.user);
                toast.success("Account created successfully!");
                router.push("/");
            } else {
                toast.success("Account created! Please login.");
                router.push("/auth/login");
            }
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return { handleRegister, isLoading };
}
