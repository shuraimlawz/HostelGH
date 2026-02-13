import { Shield, CheckCircle, AlertTriangle, LifeBuoy } from "lucide-react";

export default function SafetyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-full mb-4">
                    <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Safety Guidelines</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Your safety is our top priority. Here's how we keep our community secure and what you can do to stay safe.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-20">
                <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Verified Hostels</h3>
                    <p className="text-muted-foreground">
                        Every listing on HostelGH undergoes a verification process. We verify the ownership and physical existence of the property to prevent scams.
                    </p>
                </div>

                <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Secure Communication</h3>
                    <p className="text-muted-foreground">
                        Always communicate through the HostelGH platform. Never share sensitive personal information or make payments outside of our secure system.
                    </p>
                </div>
            </div>

            <section className="space-y-8 bg-gray-50 p-8 md:p-12 rounded-[2.5rem] border border-gray-200">
                <h2 className="text-3xl font-bold text-center">Tips for Students</h2>
                <div className="grid gap-6">
                    {[
                        "Visit the hostel during daylight if possible before check-in.",
                        "Always tell someone where you are going when visiting a new location.",
                        "Inspect the room and common areas upon arrival.",
                        "Lock your doors and keep valuables in a secure place.",
                        "Report any suspicious behavior or discrepancies immediately."
                    ].map((tip, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border shadow-sm">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
                                {i + 1}
                            </span>
                            <p className="text-lg">{tip}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="mt-20 text-center space-y-6">
                <LifeBuoy className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-2xl font-bold">See something concerning?</h3>
                <p className="text-muted-foreground">
                    If you encounter a listing or user that violates our safety guidelines, please report it immediately.
                </p>
                <button className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors">
                    Report an Issue
                </button>
            </div>
        </div>
    );
}
