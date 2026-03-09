import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/queryClient";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import Shell from "@/components/layout/Shell";
import { Toaster } from "sonner";
import JsonLd from "@/components/JsonLd";
import BrowsingTip from "@/components/BrowsingTip";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hostelgh.vercel.app"),
  title: {
    default: "HostelGH – Find & Book Affordable Hostels in Ghana",
    template: "%s | HostelGH",
  },
  description:
    "HostelGH helps students find, compare and book affordable hostels across Ghana. Verified listings, photos, and secure payments.",
  applicationName: "HostelGH",
  keywords: [
    "Hostels in Ghana",
    "Student hostel booking",
    "Ghana accommodation",
    "Hostel booking platform",
    "University hostels Ghana",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "HostelGH – Find & Book Affordable Hostels in Ghana",
    description:
      "Search, compare and book verified student hostels in Ghana.",
    siteName: "HostelGH",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "HostelGH" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HostelGH – Find & Book Affordable Hostels in Ghana",
    description:
      "Search, compare and book verified student hostels in Ghana.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased uppercase-headings`}>
        <JsonLd />
        <AuthProvider>
          <QueryProvider>
            <AuthModalProvider>
              <Shell>
                {children}
              </Shell>
              <Toaster position="top-center" richColors />
              <BrowsingTip />
            </AuthModalProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
