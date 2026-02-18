"use client";

import { useState } from "react";
import { AlertTriangle, Upload, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportForm() {
    const [submitted, setSubmitted] = useState(false);
    const [type, setType] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // UI only
    };

    if (submitted) {
        return (
            <div className="bg-green-50 rounded-3xl p-12 text-center space-y-4 border border-green-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Report Received</h3>
                <p className="text-gray-600 font-medium max-w-sm mx-auto">
                    Thank you for helping keep HostelGH safe. Our trust & safety team will review your report within 24 hours.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="text-green-700 font-black text-sm uppercase tracking-widest hover:underline pt-4"
                >
                    Send another report
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 md:p-12 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900">Report an Issue</h3>
                    <p className="text-gray-500 text-sm font-medium">Protect the community from scams and bad actors.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-widest pl-1">
                        Issue Type
                    </label>
                    <select
                        required
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-medium appearance-none"
                    >
                        <option value="" disabled>Select issue type...</option>
                        <option value="scam">Potential Scam / Fraud</option>
                        <option value="fake">Fake Listing / Wrong Photos</option>
                        <option value="unsafe">Unsafe Property / Host Behavior</option>
                        <option value="payment">Payment Issue outside platform</option>
                        <option value="other">Other Concern</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-widest pl-1">
                        Detailed Message
                    </label>
                    <textarea
                        required
                        placeholder="Please provide details about the listing or behavior..."
                        rows={4}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-medium resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-widest pl-1">
                        Evidence (Optional)
                    </label>
                    <div className="group relative border-2 border-dashed border-gray-200 rounded-2xl p-8 transition-colors hover:border-red-200 hover:bg-red-50/10 cursor-pointer">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="text-center space-y-2">
                            <Upload className="mx-auto text-gray-400 group-hover:text-red-500 transition-colors" size={24} />
                            <p className="text-sm font-bold text-gray-500">Upload screenshot or document</p>
                            <p className="text-xs text-gray-400">Max size 5MB (JPG, PNG, PDF)</p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2"
                >
                    <Send size={20} />
                    Submit Report
                </button>
            </form>
        </div>
    );
}
