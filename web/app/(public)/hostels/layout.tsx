import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explore Hostels",
    description: "Browse, compare, and book verified student hostels across Ghana. Find accommodation near KNUST, UG Legon, UCC, and more.",
};

export default function HostelsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
