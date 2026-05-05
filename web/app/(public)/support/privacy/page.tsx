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
    return (
        <div className="flex flex-col-reverse lg:flex-row gap-12">
            <div className="flex-1 space-y-12">
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last updated: May 2025</p>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                        We collect only what we need to make HostelGH work safely for students and hostel owners in Ghana. Here's how we handle your data.
                    </p>
                </div>

                <div className="space-y-12">
                    <section id="intro" className="space-y-3">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Introduction</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                            HostelGH is a Ghana-based student housing marketplace. We take your privacy seriously and only collect data that is necessary to connect students with safe, verified hostels.
                        </p>
                    </section>

                    <section id="data-collection" className="space-y-4">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">What We Collect</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <h3 className="font-black text-blue-900 dark:text-blue-300 mb-1 text-sm">Account Info</h3>
                                <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">Name, email address, phone number, and profile photo.</p>
                            </div>
                            <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <h3 className="font-black text-gray-900 dark:text-white mb-1 text-sm">Verification Docs</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Ghana Card or student ID (only for verified accounts — optional).</p>
                            </div>
                            <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <h3 className="font-black text-gray-900 dark:text-white mb-1 text-sm">Booking Data</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Rooms viewed, bookings made, and payment status.</p>
                            </div>
                            <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <h3 className="font-black text-gray-900 dark:text-white mb-1 text-sm">Device & Usage</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Browser type, IP address, and pages visited — used for security and performance.</p>
                            </div>
                        </div>
                    </section>

                    <section id="usage" className="space-y-3">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">How We Use It</h2>
                        <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400 space-y-2 text-sm">
                            <li>To match students with verified hostels near their campus</li>
                            <li>To process payments and send booking confirmations</li>
                            <li>To verify the identity of owners and students when requested</li>
                            <li>To detect fraud, scams, and suspicious activity</li>
                            <li>To send platform updates and booking notifications</li>
                        </ul>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            We don't sell your data. We don't use it for advertising outside of HostelGH.
                        </p>
                    </section>

                    <section id="sharing" className="space-y-3">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Who We Share With</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                            We only share your data with:
                        </p>
                        <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400 space-y-2 text-sm">
                            <li><strong className="text-gray-700 dark:text-gray-300">Paystack</strong> — to process your payments securely.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">Hostel Owners</strong> — your name and contact (after booking is confirmed).</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">Safety & Legal teams</strong> — when investigating fraud or legal requests.</li>
                        </ul>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            We never share your data with advertisers or data brokers.
                        </p>
                    </section>

                    <section id="cookies" className="space-y-3">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Cookies</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                            We use cookies to keep you logged in and to remember your preferences (like dark mode and recent searches). We don't use tracking cookies for advertising. You can clear cookies in your browser settings at any time.
                        </p>
                    </section>

                    <section id="payments" className="space-y-3">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Payment Safety</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                            All payments go through <span className="text-blue-600 dark:text-blue-400 font-bold">Paystack</span>, a PCI-DSS compliant payment provider. HostelGH never stores your card details, MoMo PIN, or bank credentials. These go directly to Paystack's encrypted servers.
                        </p>
                    </section>

                    <section id="security" className="space-y-3">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Data Security</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                            We use HTTPS encryption across the platform, hashed passwords, and access controls to protect your account. Our infrastructure runs on secure cloud providers. If we ever discover a breach affecting your data, we will notify you within 72 hours.
                        </p>
                    </section>

                    <section id="rights" className="space-y-3">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Your Rights</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400 space-y-2 text-sm">
                            <li>Access the personal data we hold about you</li>
                            <li>Update or correct your account information</li>
                            <li>Request deletion of your account and all associated data</li>
                            <li>Opt out of email notifications at any time</li>
                        </ul>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            To exercise any of these rights, email us at <a href="mailto:privacy@hostelgh.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">privacy@hostelgh.com</a>.
                        </p>
                    </section>

                    <section id="contact" className="space-y-3">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Contact</h2>
                        <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Privacy</p>
                            <a href="mailto:privacy@hostelgh.com" className="text-sm font-black text-blue-600 dark:text-blue-400 hover:underline">
                                privacy@hostelgh.com
                            </a>
                        </div>
                    </section>
                </div>
            </div>

            <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-40 bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                    <TableOfContents sections={SECTIONS} />
                </div>
            </aside>
        </div>
    );
}
