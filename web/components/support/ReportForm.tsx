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
            <div className="bg-green-500/10 rounded-3xl p-12 text-center space-y-4 border border-green-500/20 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-card text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-foreground">Report Received</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm">
                    Thanks for keeping HostelGH safe. Our team will review your report within 24 hours and take action.
                </p>
                <button
                    onClick={() => { setSubmitted(false); setType(""); setMessage(""); }}
                    className="text-green-600 font-black text-sm uppercase tracking-widest hover:underline pt-4"
                >
                    Submit another report
                </button>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-[2.5rem] border-2 border-border p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-foreground">Report an Issue</h3>
                    <p className="text-muted-foreground text-sm font-medium">Help us protect the HostelGH community.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">
                        Issue Type
                    </label>
                    <select
                        required
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-muted border-2 border-border focus:border-destructive outline-none transition-all font-medium text-foreground appearance-none"
                    >
                        <option value="" disabled>Select issue type...</option>
                        <option value="scam">Potential Scam / Fraud</option>
                        <option value="fake">Fake Listing / Wrong Photos</option>
                        <option value="unsafe">Unsafe Property or Host Behaviour</option>
                        <option value="payment">Payment Requested Outside Platform</option>
                        <option value="harassment">Harassment or Intimidation</option>
                        <option value="other">Other Concern</option>
                    </select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">
                        What happened?
                    </label>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe what you saw or experienced. Include hostel name, date, and any other details..."
                        rows={4}
                        className="w-full px-5 py-4 rounded-2xl bg-muted border-2 border-border focus:border-destructive outline-none transition-all font-medium resize-none text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                {/* Evidence */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">
                        Evidence (Optional)
                    </label>
                    <div className="group relative border-2 border-dashed border-border rounded-2xl p-8 transition-colors hover:border-destructive/50 hover:bg-destructive/5 cursor-pointer">
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        <div className="text-center space-y-2">
                            <Upload className="mx-auto text-muted-foreground group-hover:text-destructive transition-colors" size={24} />
                            <p className="text-sm font-bold text-muted-foreground">Upload screenshot or document</p>
                            <p className="text-xs text-muted-foreground/60">Max 5MB — JPG, PNG, PDF</p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-5 bg-destructive hover:bg-destructive/90 text-white rounded-2xl font-black text-base hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Send size={20} />
                    Submit Report
                </button>
            </form>
        </div>
    );
}
