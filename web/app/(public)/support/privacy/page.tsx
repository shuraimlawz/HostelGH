export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-gray prose-lg max-w-none space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-black">Data Collection</h2>
                    <p className="text-muted-foreground">
                        We collect personal information that you provide directly to us when you create an account, make a booking, or communicate with support. This includes your name, email address, phone number, and payment information.
                    </p>
                </section>

                <section className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 bg-blue-50/50 rounded-3xl">
                        <h3 className="font-bold mb-2">How we use data</h3>
                        <p className="text-sm text-muted-foreground">
                            To process your bookings, verify your identity, and improve our services through analytics.
                        </p>
                    </div>
                    <div className="p-6 bg-green-50/50 rounded-3xl">
                        <h3 className="font-bold mb-2">Your data rights</h3>
                        <p className="text-sm text-muted-foreground">
                            You have the right to access, correct, or delete your personal information at any time.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black">Third-Party Sharing</h2>
                    <p className="text-muted-foreground">
                        We share necessary information with hostel owners to facilitate your bookings. We also use third-party payment processors like Paystack to securely handle financial transactions. We do not sell your personal data to advertisers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black">Security Measures</h2>
                    <p className="text-muted-foreground">
                        We implement industry-standard security protocols, including SSL encryption and secure server infrastructure, to protect your data from unauthorized access or disclosure.
                    </p>
                </section>

                <section className="pt-12 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                        If you have any questions about our privacy practices, please contact us at privacy@hostelgh.com
                    </p>
                </section>
            </div>
        </div>
    );
}
