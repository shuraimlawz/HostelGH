"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function QueryProvider({ children }: { children: ReactNode | any }) {
    const [client] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={client}>
            {children}
            <Toaster position="top-center" richColors />
        </QueryClientProvider>
    );
}
