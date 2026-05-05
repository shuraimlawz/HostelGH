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
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last updated: May 2025</p>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Privacy Policy</h1>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                        We collect only what we need to make HostelGH work safely for students and hostel owners in Ghana. Here's how we handle your data.
                    </p>
                </div>

                <div className="space-y-12">
                    <section id="intro" className="space-y-3">
                        <h2 className="text-lg font-black text-foreground">Introduction</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            HostelGH is a Ghana-based student housing marketplace. We take your privacy seriously and only collect data that is necessary to connect students with safe, verified hostels.
                        </p>
                    </section>

                    <section id="data-collection" className="space-y-4">
                        <h2 className="text-lg font-black text-foreground">What We Collect</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                                <h3 className="font-black mb-1 text-sm text-primary">Account Info</h3>
                                <p className="text-xs leading-relaxed text-primary/70">Name, email address, phone number, and profile photo.</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-muted border border-border">
                                <h3 className="font-black mb-1 text-sm text-foreground">Verification Docs</h3>
                                <p className="text-xs leading-relaxed text-muted-foreground">Ghana Card or student ID — only for verified accounts (optional).</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-muted border border-border">
                                <h3 className="font-black mb-1 text-sm text-foreground">Booking Data</h3>
                                <p className="text-xs leading-relaxed text-muted-foreground">Rooms viewed, bookings made, and payment status.</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-muted border border-border">
                                <h3 className="font-black mb-1 text-sm text-foreground">Device & Usage</h3>
                                <p className="text-xs leading-relaxed text-muted-foreground">Browser type, IP address, and pages visited — used for security and performance.</p>
                            </div>
                        </div>
                    </section>

                    <section id="usage" className="space-y-3">
                        <h2 className="text-lg font-black text-foreground">How We Use It</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li>To match students with verified hostels near their campus</li>
                            <li>To process payments and send booking confirmations</li>
                            <li>To verify the identity of owners and students when requested</li>
                            <li>To detect fraud, scams, and suspicious activity</li>
                            <li>To send platform updates and booking notifications</li>
                        </ul>
                        <p className="text-sm text-muted-foreground">We don't sell your data. We don't use it for advertising outside of HostelGH.</p>
                    </section>

                    <section id="sharing" className="space-y-3">
                        <h2 className="text-lg font-black text-foreground">Who We Share With</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li><strong className="text-foreground">Paystack</strong> — to process your payments securely.</li>
                            <li><strong className="text-foreground">Hostel Owners</strong> — your name and contact (after booking is confirmed).</li>
                            <li><strong className="text-foreground">Safety & Legal</strong> — when investigating fraud or responding to legal requests.</li>
                        </ul>
                        <p className="text-sm text-muted-foreground">We never share your data with advertisers or data brokers.</p>
                    </section>

                    <section id="cookies" className="space-y-3">
                        <h2 className="text-lg font-black text-foreground">Cookies</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We use cookies to keep you logged in and remember your preferences (like dark mode and recent searches). We don't use tracking cookies for advertising. You can clear cookies in your browser settings at any time.
                        </p>
                    </section>

                    <section id="payments" className="space-y-3">
                        <h2 className="text-lg font-black text-foreground">Payment Safety</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            All payments go through <span className="text-primary font-bold">Paystack</span>, a PCI-DSS compliant payment provider. HostelGH never stores your card details, MoMo PIN, or bank credentials. These go directly to Paystack's encrypted servers.
                        </p>
                    </section>

                    <section id="security" className="space-y-3">
                        <h2 className="text-lg font-black text-foreground">Data Security</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We use HTTPS encryption across the platform, hashed passwords, and access controls to protect your account. If we ever discover a breach affecting your data, we will notify you within 72 hours.
                        </p>
                    </section>

                    <section id="rights" className="space-y-3">
                        <h2 className="text-lg font-black text-foreground">Your Rights</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li>Access the personal data we hold about you</li>
                            <li>Update or correct your account information</li>
                            <li>Request deletion of your account and all associated data</li>
                            <li>Opt out of email notifications at any time</li>
                        </ul>
                        <p className="text-sm text-muted-foreground">
                            To exercise any of these rights, email{" "}
                            <a href="mailto:privacy@hostelgh.com" className="text-primary font-bold hover:underline">privacy@hostelgh.com</a>.
                        </p>
                    </section>

                    <section id="contact" className="space-y-3">
                        <h2 className="text-lg font-black text-foreground">Contact</h2>
                        <div className="rounded-2xl p-6 bg-muted border border-border">
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Privacy</p>
                            <a href="mailto:privacy@hostelgh.com" className="text-sm font-black text-primary hover:underline">
                                privacy@hostelgh.com
                            </a>
                        </div>
                    </section>
                </div>
            </div>

            <aside className="hidden lg:block w-52 shrink-0">
                <div className="sticky top-40 rounded-2xl p-6 bg-muted border border-border">
                    <TableOfContents sections={SECTIONS} />
                </div>
            </aside>
        </div>
    );
}
