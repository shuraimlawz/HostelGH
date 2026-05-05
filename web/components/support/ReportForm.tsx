"use client";

import { useState } from "react";
import { AlertTriangle, Upload, Send, CheckCircle2 } from "lucide-react";

export default function ReportForm() {
    const [submitted, setSubmitted] = useState(false);
    const [type, setType] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-3xl p-12 text-center space-y-4 border border-green-100 dark:border-green-900/50 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Report Received</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium max-w-sm mx-auto">
                    Thanks for keeping HostelGH safe. Our team will review your report within 24 hours and take action.
                </p>
                <button
                    onClick={() => { setSubmitted(false); setType(""); setMessage(""); }}
                    className="text-green-700 dark:text-green-400 font-black text-sm uppercase tracking-widest hover:underline pt-4"
                >
                    Submit another report
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 p-8 md:p-12 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-2xl flex items-center justify-center">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Report an Issue</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Help us protect the HostelGH community.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                        Issue Type
                    </label>
                    <select
                        required
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent dark:border-slate-700 focus:border-red-500 dark:focus:border-red-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-medium text-gray-900 dark:text-white appearance-none"
                    >
                        <option value="" disabled className="text-gray-400">Select issue type...</option>
                        <option value="scam" className="text-gray-900 dark:text-white bg-white dark:bg-slate-800">Potential Scam / Fraud</option>
                        <option value="fake" className="text-gray-900 dark:text-white bg-white dark:bg-slate-800">Fake Listing / Wrong Photos</option>
                        <option value="unsafe" className="text-gray-900 dark:text-white bg-white dark:bg-slate-800">Unsafe Property or Host Behaviour</option>
                        <option value="payment" className="text-gray-900 dark:text-white bg-white dark:bg-slate-800">Payment Requested Outside Platform</option>
                        <option value="harassment" className="text-gray-900 dark:text-white bg-white dark:bg-slate-800">Harassment or Intimidation</option>
                        <option value="other" className="text-gray-900 dark:text-white bg-white dark:bg-slate-800">Other Concern</option>
                    </select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                        What happened?
                    </label>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe what you saw or experienced. Include hostel name, date, and any other details..."
                        rows={4}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent dark:border-slate-700 focus:border-red-500 dark:focus:border-red-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-medium resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                </div>

                {/* Evidence Upload */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                        Evidence (Optional)
                    </label>
                    <div className="group relative border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 transition-colors hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50/10 dark:hover:bg-red-950/10 cursor-pointer">
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        <div className="text-center space-y-2">
                            <Upload className="mx-auto text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" size={24} />
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Upload screenshot or document</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Max 5MB — JPG, PNG, PDF</p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-base hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-red-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                >
                    <Send size={20} />
                    Submit Report
                </button>
            </form>
        </div>
    );
}
