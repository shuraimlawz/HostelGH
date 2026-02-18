"use client";

import SupportShell from "@/components/support/SupportShell";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
    return (
        <SupportShell>
            {children}
        </SupportShell>
    );
}
