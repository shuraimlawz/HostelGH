"use client";

import TableOfContents from "@/components/support/TableOfContents";

const SECTIONS = [
    { id: "intro", title: "Introduction" },
    { id: "data-collection", title: "Data We Collect" },
    { id: "usage", title: "How We Use Data" },
    { id: "sharing", title: "Data Sharing" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "payments", title: "Payment Safety" },
    { id: "security", title: "Security Measures" },
    { id: "rights", title: "User Rights" },
    { id: "contact", title: "Reach Out" },
];

export default function PrivacyPage() {
    return (
        <div className="flex flex-col-reverse lg:flex-row gap-12">
            <div className="flex-1 space-y-12">
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500 text-base font-medium leading-relaxed">
                        Your privacy is our priority. This policy outlines how we handle your personal data when you use HostelGH to find or list student housing.
                    </p>
                </div>

                <div className="space-y-12">
                    <section id="intro" className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900">Introduction</h2>
                        <p className="text-gray-600 leading-relaxed font-medium text-sm">
                            HostelGH ("we", "us", or "our") is committed to protecting the privacy of students and hostel owners in Ghana. We collect minimal data necessary to facilitate safe bookings and platform security.
                        </p>
                    </section>

                    <section id="data-collection" className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900">Data We Collect</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-1 text-sm">Registration Info</h3>
                                <p className="text-xs text-blue-800 opacity-80 leading-relaxed">Name, email address, phone number, and university details.</p>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-1 text-sm">Verification Info</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">ID cards for owners and student certificates for verified tenants.</p>
                            </div>
                        </div>
                    </section>

                    <section id="payments" className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900">Payment Safety</h2>
                        <p className="text-gray-600 leading-relaxed font-medium text-sm">
                            HostelGH uses <span className="text-blue-600 font-bold">Paystack</span> for all financial transactions. We do not store your credit card numbers or Mobile Money PINs on our servers. All sensitive data is handled securely by our licensed payment partners.
                        </p>
                    </section>

                    <section id="rights" className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900">Your User Rights</h2>
                        <p className="text-gray-600 leading-relaxed font-medium text-sm">
                            You have the right to access, update, or delete your personal information. If you wish to close your account and remove all data, please contact our privacy team.
                        </p>
                    </section>

                    <section id="contact" className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900">Reach Out</h2>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Privacy Officer</p>
                            <p className="text-sm font-black text-gray-900 underline decoration-blue-500/30 decoration-2 underline-offset-4">privacy@hostelgh.com</p>
                        </div>
                    </section>
                </div>
            </div>

            <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-40 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <TableOfContents sections={SECTIONS} />
                </div>
            </aside>
        </div>
    );
}
