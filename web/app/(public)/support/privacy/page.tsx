"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import TableOfContents from "@/components/support/TableOfContents";

const SECTIONS = [
    { id: "intro", title: "Introduction" },
    { id: "data-collection", title: "What We Collect" },
    { id: "usage", title: "How We Use It" },
    { id: "sharing", title: "Who We Share With" },
    { id: "cookies", title: "Cookies" },
    { id: "payments", title: "Payment Safety" },
    { id: "security", title: "Data Security" },
    { id: "rights", title: "Your Rights" },
    { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const isDark = mounted && resolvedTheme === "dark";

    const heading = { color: isDark ? "#ffffff" : "#111827" };
    const body = { color: isDark ? "#9ca3af" : "#4b5563" };
    const cardBg = { backgroundColor: isDark ? "#1e293b" : "#f9fafb", borderColor: isDark ? "#334155" : "#e5e7eb" };
    const cardBlue = { backgroundColor: isDark ? "rgba(37,99,235,0.12)" : "#eff6ff", borderColor: isDark ? "rgba(37,99,235,0.25)" : "#bfdbfe" };
    const cardGray = { backgroundColor: isDark ? "#1e293b" : "#f9fafb", borderColor: isDark ? "#334155" : "#e5e7eb" };

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-12">
            <div className="flex-1 space-y-12">
                {/* Header */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last updated: May 2025</p>
                    <h1 className="text-3xl font-black tracking-tight" style={heading}>Privacy Policy</h1>
                    <p className="text-sm font-medium leading-relaxed" style={body}>
                        We collect only what we need to make HostelGH work safely for students and hostel owners in Ghana. Here's how we handle your data.
                    </p>
                </div>

                <div className="space-y-12">
                    <section id="intro" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>Introduction</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            HostelGH is a Ghana-based student housing marketplace. We take your privacy seriously and only collect data that is necessary to connect students with safe, verified hostels.
                        </p>
                    </section>

                    <section id="data-collection" className="space-y-4">
                        <h2 className="text-lg font-black" style={heading}>What We Collect</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl border" style={cardBlue}>
                                <h3 className="font-black mb-1 text-sm" style={{ color: isDark ? "#93c5fd" : "#1d4ed8" }}>Account Info</h3>
                                <p className="text-xs leading-relaxed" style={{ color: isDark ? "#93c5fd" : "#1e40af", opacity: 0.8 }}>Name, email address, phone number, and profile photo.</p>
                            </div>
                            <div className="p-5 rounded-2xl border" style={cardGray}>
                                <h3 className="font-black mb-1 text-sm" style={heading}>Verification Docs</h3>
                                <p className="text-xs leading-relaxed" style={body}>Ghana Card or student ID — only for verified accounts (optional).</p>
                            </div>
                            <div className="p-5 rounded-2xl border" style={cardGray}>
                                <h3 className="font-black mb-1 text-sm" style={heading}>Booking Data</h3>
                                <p className="text-xs leading-relaxed" style={body}>Rooms viewed, bookings made, and payment status.</p>
                            </div>
                            <div className="p-5 rounded-2xl border" style={cardGray}>
                                <h3 className="font-black mb-1 text-sm" style={heading}>Device & Usage</h3>
                                <p className="text-xs leading-relaxed" style={body}>Browser type, IP address, and pages visited — used for security and performance.</p>
                            </div>
                        </div>
                    </section>

                    <section id="usage" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>How We Use It</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm" style={body}>
                            <li>To match students with verified hostels near their campus</li>
                            <li>To process payments and send booking confirmations</li>
                            <li>To verify the identity of owners and students when requested</li>
                            <li>To detect fraud, scams, and suspicious activity</li>
                            <li>To send platform updates and booking notifications</li>
                        </ul>
                        <p className="text-sm" style={body}>We don't sell your data. We don't use it for advertising outside of HostelGH.</p>
                    </section>

                    <section id="sharing" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>Who We Share With</h2>
                        <p className="text-sm" style={body}>We only share your data with:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm" style={body}>
                            <li><strong style={{ color: isDark ? "#d1d5db" : "#374151" }}>Paystack</strong> — to process your payments securely.</li>
                            <li><strong style={{ color: isDark ? "#d1d5db" : "#374151" }}>Hostel Owners</strong> — your name and contact (after booking is confirmed).</li>
                            <li><strong style={{ color: isDark ? "#d1d5db" : "#374151" }}>Safety & Legal</strong> — when investigating fraud or responding to legal requests.</li>
                        </ul>
                        <p className="text-sm" style={body}>We never share your data with advertisers or data brokers.</p>
                    </section>

                    <section id="cookies" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>Cookies</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            We use cookies to keep you logged in and remember your preferences (like dark mode and recent searches). We don't use tracking cookies for advertising. You can clear cookies in your browser settings at any time.
                        </p>
                    </section>

                    <section id="payments" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>Payment Safety</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            All payments go through <span className="text-blue-600 dark:text-blue-400 font-bold">Paystack</span>, a PCI-DSS compliant payment provider. HostelGH never stores your card details, MoMo PIN, or bank credentials. These go directly to Paystack's encrypted servers.
                        </p>
                    </section>

                    <section id="security" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>Data Security</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            We use HTTPS encryption across the platform, hashed passwords, and access controls to protect your account. If we ever discover a breach affecting your data, we will notify you within 72 hours.
                        </p>
                    </section>

                    <section id="rights" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>Your Rights</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm" style={body}>
                            <li>Access the personal data we hold about you</li>
                            <li>Update or correct your account information</li>
                            <li>Request deletion of your account and all associated data</li>
                            <li>Opt out of email notifications at any time</li>
                        </ul>
                        <p className="text-sm" style={body}>
                            To exercise any of these rights, email{" "}
                            <a href="mailto:privacy@hostelgh.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">privacy@hostelgh.com</a>.
                        </p>
                    </section>

                    <section id="contact" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>Contact</h2>
                        <div className="rounded-2xl p-6 border" style={cardBg}>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Privacy</p>
                            <a href="mailto:privacy@hostelgh.com" className="text-sm font-black text-blue-600 dark:text-blue-400 hover:underline">
                                privacy@hostelgh.com
                            </a>
                        </div>
                    </section>
                </div>
            </div>

            <aside className="hidden lg:block w-52 shrink-0">
                <div className="sticky top-40 rounded-2xl p-6 border" style={cardBg}>
                    <TableOfContents sections={SECTIONS} />
                </div>
            </aside>
        </div>
    );
}
