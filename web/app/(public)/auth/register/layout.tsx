import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create an account on HostelGH to book student accommodation or list your property.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
