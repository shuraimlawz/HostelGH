import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/queryClient";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import Shell from "@/components/layout/Shell";
import { Toaster } from "sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HostelGH",
  description: "Next-generation Hostel Booking Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased uppercase-headings`}>
        <AuthProvider>
          <QueryProvider>
            <AuthModalProvider>
              <Shell>
                {children}
              </Shell>
              <Toaster position="top-center" richColors />
            </AuthModalProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
