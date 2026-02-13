export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-gray prose-lg max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-black border-l-4 border-primary pl-4">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground">
                        By accessing or using the HostelGH platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black border-l-4 border-primary pl-4">2. User Obligations</h2>
                    <p className="text-muted-foreground">
                        Users must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                        <li>You must be at least 18 years old to use our service.</li>
                        <li>You agree not to use the platform for any illegal or unauthorized purposes.</li>
                        <li>Hostel owners must ensure that all listing details are accurate and up-to-date.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black border-l-4 border-primary pl-4">3. Booking and Payments</h2>
                    <p className="text-muted-foreground">
                        All bookings made through HostelGH are subject to the specific hostel's availability and rules. Payments are processed via Paystack. HostelGH acts as a facilitator and is not responsible for the actual provision of accommodation.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black border-l-4 border-primary pl-4">4. Limitation of Liability</h2>
                    <p className="text-muted-foreground">
                        HostelGH shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform or the services provided by hostel owners.
                    </p>
                </section>

                <section className="bg-gray-50 p-8 rounded-3xl border border-gray-200 mt-12">
                    <h2 className="text-xl font-bold mb-4">Last Updated</h2>
                    <p className="text-sm text-muted-foreground">
                        These terms were last updated on February 13, 2026. We reserve the right to modify these terms at any time.
                    </p>
                </section>
            </div>
        </div>
    );
}
