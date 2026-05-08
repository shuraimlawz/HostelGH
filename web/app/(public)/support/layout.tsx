import { Metadata } from "next";
import SupportShell from "@/components/support/SupportShell";

export const metadata: Metadata = {
    title: "Support & Help Center",
    description: "Get help with bookings, payments, refunds, and listing your hostel on HostelGH. Our support team is here to assist you 24/7.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
    return (
        <SupportShell>
            {children}
        </SupportShell>
    );
}
