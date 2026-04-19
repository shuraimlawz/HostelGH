"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldAlert, CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnsubscribePage() {
    const { hash } = useParams();
    const [status, setStatus] = useState<"loading" | "confirm" | "success" | "error">("loading");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://hostelgh.onrender.com"}/newsletter/unsubscribe-status/${hash}`);
                if (res.ok) {
                    const data = await res.json();
                    setEmail(data.email);
                    if (data.isActive) {
                        setStatus("confirm");
                    } else {
                        setStatus("success"); // Already unsubscribed
                    }
                } else {
                    setStatus("error");
                }
            } catch (err) {
                setStatus("error");
            }
        };

        if (hash) fetchStatus();
    }, [hash]);

    const handleUnsubscribe = async () => {
        setStatus("loading");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://hostelgh.onrender.com"}/newsletter/unsubscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hash })
            });
            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (err) {
            setStatus("error");
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-900">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Checking subscription...</p>
                    </div>
                )}

                {status === "confirm" && (
                    <>
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                            <ShieldAlert className="text-amber-500" size={40} />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic">Join The Out?</h1>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                We're sorry to see you go. Are you sure you want to unsubscribe <span className="text-gray-900 font-bold">{email}</span> from the HostelGH Circle?
                            </p>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <Button 
                                onClick={handleUnsubscribe}
                                className="w-full h-14 bg-gray-900 hover:bg-black rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                            >
                                Confirm Unsubscribe
                            </Button>
                            <Link href="/">
                                <Button variant="ghost" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-gray-400">
                                    Keep Me Subscribed
                                </Button>
                            </Link>
                        </div>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="text-emerald-500" size={40} />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic">Successfully Unsubscribed</h1>
                            <p className="text-gray-500 text-sm font-medium">
                                You have been removed from our mailing list. You can join back anytime by entering your email in the footer.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link href="/">
                                <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                                    Return to Home
                                </Button>
                            </Link>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="text-red-500" size={40} />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic">Invalid Link</h1>
                            <p className="text-gray-500 text-sm font-medium">
                                This unsubscription link is invalid or has expired. Please contact support if you continue to receive unwanted emails.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link href="/">
                                <Button className="w-full h-14 bg-gray-900 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                                    Go Back Home
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
