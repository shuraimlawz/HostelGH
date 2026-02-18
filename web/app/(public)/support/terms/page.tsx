"use client";

import TableOfContents from "@/components/support/TableOfContents";

const SECTIONS = [
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "accounts", title: "User Accounts" },
    { id: "bookings", title: "Bookings & Availability" },
    { id: "payments", title: "Payments & Fees" },
    { id: "refunds", title: "Refund Policy" },
    { id: "content", title: "User Content" },
    { id: "prohibited", title: "Prohibited Use" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "termination", title: "Termination" },
    { id: "changes", title: "Changes to Terms" },
    { id: "contact", title: "Contact Us" },
];

export default function TermsPage() {
    return (
        <div className="flex flex-col-reverse lg:flex-row gap-12">
            <div className="flex-1 space-y-16">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Terms of Service
                    </h1>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">
                        Please read these terms carefully before using the HostelGH platform. By accessing our services, you agree to be bound by these legal conditions.
                    </p>
                </div>

                <div className="space-y-20">
                    <section id="acceptance" className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            By accessing or using the HostelGH website or mobile applications (the "Platform"), you agree to comply with and be bound by these Terms of Service. These terms apply to all visitors, students (Tenants), and hostel owners (Owners).
                        </p>
                    </section>

                    <section id="accounts" className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900">2. User Accounts</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            To use certain features of the Platform, you must register for an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 font-medium space-y-2">
                            <li>Students must provide valid university identification if requested.</li>
                            <li>Owners must provide proof of property ownership or management authority.</li>
                        </ul>
                    </section>

                    <section id="bookings" className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900">3. Bookings & Availability</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            HostelGH operates as a marketplace. We do not own or manage the hostels listed on the platform. Booking a room creates a direct agreement between the Tenant and the Owner. We do not guarantee the perpetual availability of any listed room.
                        </p>
                    </section>

                    <section id="payments" className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900">4. Payments & Fees</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            HostelGH charges a non-refundable booking fee to Tenants to secure a room. This fee is processed via Paystack. The remaining rent balance is typically paid directly to the Owner according to their specific payment schedule.
                        </p>
                    </section>

                    <section id="refunds" className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900">5. Refund Policy</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Booking fees are non-refundable except in cases where the listing is proven to be fraudulent or the room is grossly misrepresented. Refund requests must be submitted within 24 hours of the booking confirmation.
                        </p>
                    </section>

                    <section id="contact" className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900">11. Contact Us</h2>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Legal Team</p>
                            <p className="text-gray-900 font-black">legal@hostelgh.com</p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Desktop ToC Sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-40 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <TableOfContents sections={SECTIONS} />
                </div>
            </aside>
        </div>
    );
}
