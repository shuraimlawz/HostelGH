"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import TableOfContents from "@/components/support/TableOfContents";

const SECTIONS = [
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "accounts", title: "User Accounts" },
    { id: "bookings", title: "Bookings & Availability" },
    { id: "payments", title: "Payments & Fees" },
    { id: "refunds", title: "Refund Policy" },
    { id: "content", title: "Your Content" },
    { id: "prohibited", title: "Prohibited Use" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "termination", title: "Termination" },
    { id: "changes", title: "Changes to Terms" },
    { id: "contact", title: "Contact" },
];

export default function TermsPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const isDark = mounted && resolvedTheme === "dark";

    const heading = { color: isDark ? "#ffffff" : "#111827" };
    const body = { color: isDark ? "#9ca3af" : "#4b5563" };
    const cardBg = { backgroundColor: isDark ? "#1e293b" : "#f9fafb", borderColor: isDark ? "#334155" : "#e5e7eb" };

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-12">
            <div className="flex-1 space-y-12">
                {/* Header */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last updated: May 2025</p>
                    <h1 className="text-3xl font-black tracking-tight" style={heading}>Terms of Service</h1>
                    <p className="text-sm font-medium leading-relaxed" style={body}>
                        By using HostelGH, you agree to these terms. This applies to all students, hostel owners, and visitors on the platform.
                    </p>
                </div>

                <div className="space-y-12">
                    <section id="acceptance" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>1. Acceptance of Terms</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            Using HostelGH means you accept these Terms of Service. If you don't agree, please don't use the platform. These terms apply to students (Tenants) and hostel owners (Owners) alike.
                        </p>
                    </section>

                    <section id="accounts" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>2. User Accounts</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            You are responsible for keeping your account secure. Don't share your password. You must provide accurate information when you sign up.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm" style={body}>
                            <li>Students may be asked for a valid university ID during verification.</li>
                            <li>Owners must provide proof of property ownership or management authority.</li>
                            <li>One account per person. Duplicate accounts may result in suspension.</li>
                        </ul>
                    </section>

                    <section id="bookings" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>3. Bookings & Availability</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            HostelGH is a marketplace — we connect students with hostel owners. We don't own or operate any of the hostels listed. Booking a room creates a direct agreement between you and the owner. Availability can change, and we can't guarantee a room will remain open until payment is made.
                        </p>
                    </section>

                    <section id="payments" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>4. Payments & Fees</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            A non-refundable booking fee of GHS 5 is charged to reserve your room. All payments are processed through Paystack. The remaining rent is paid directly to the owner — HostelGH does not collect rent.
                        </p>
                    </section>

                    <section id="refunds" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>5. Refund Policy</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            The booking fee is non-refundable except when a listing is proven fraudulent or severely misrepresented. Refund requests must be submitted within 24 hours of booking. Our team reviews all claims within 48 hours.
                        </p>
                    </section>

                    <section id="content" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>6. Your Content</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            You own any content you post (photos, reviews, messages). By posting on HostelGH, you give us permission to display it on the platform. We won't sell your content to third parties.
                        </p>
                    </section>

                    <section id="prohibited" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>7. Prohibited Use</h2>
                        <p className="text-sm" style={body}>The following are not allowed on HostelGH:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm" style={body}>
                            <li>Posting fake listings or misleading photos</li>
                            <li>Requesting payments outside the platform</li>
                            <li>Harassing or threatening other users</li>
                            <li>Creating multiple accounts to abuse promotions</li>
                            <li>Scraping data or using bots on the platform</li>
                        </ul>
                    </section>

                    <section id="liability" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>8. Limitation of Liability</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            HostelGH connects students and owners but is not responsible for what happens after a booking is made. We are not liable for disputes about room conditions, owner behaviour, or missed move-in dates. We'll mediate where we can, but the final agreement is between you and the owner.
                        </p>
                    </section>

                    <section id="termination" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>9. Termination</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            We can suspend or close your account at any time if you have violated these terms or posed a risk to other users. We will notify you unless doing so would compromise a safety investigation.
                        </p>
                    </section>

                    <section id="changes" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>10. Changes to Terms</h2>
                        <p className="text-sm leading-relaxed" style={body}>
                            We may update these terms as the platform grows. If we make significant changes, we'll notify you by email and show a notice on the platform. Continued use after changes means you accept the new terms.
                        </p>
                    </section>

                    <section id="contact" className="space-y-3">
                        <h2 className="text-lg font-black" style={heading}>11. Contact</h2>
                        <div className="rounded-2xl p-6 border" style={cardBg}>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Legal</p>
                            <a href="mailto:legal@hostelgh.com" className="text-sm font-black text-blue-600 dark:text-blue-400 hover:underline">
                                legal@hostelgh.com
                            </a>
                        </div>
                    </section>
                </div>
            </div>

            {/* Desktop ToC */}
            <aside className="hidden lg:block w-52 shrink-0">
                <div className="sticky top-40 rounded-2xl p-6 border" style={cardBg}>
                    <TableOfContents sections={SECTIONS} />
                </div>
            </aside>
        </div>
    );
}
