"use client";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { CheckCircle2, Upload, Loader2, X, AlertCircle, CreditCard, Landmark, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentMethodSelector from "../payments/PaymentMethodSelector";
import BankTransferForm from "../payments/BankTransferForm";
import MobileMoneyForm from "../payments/MobileMoneyForm";

export default function BookingModal({
    open,
    onClose,
    hostelId,
    hostelName,
    roomId,
    room,
}: {
    open: boolean;
    onClose: () => void;
    hostelId: string;
    hostelName?: string;
    roomId: string;
    room?: any;
}) {
    const { user } = useAuth();
    const [step, setStep] = useState<"personal" | "kyc" | "summary" | "payment" | "done">("personal");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [levelOfStudy, setLevelOfStudy] = useState("");
    const [guardianName, setGuardianName] = useState("");
    const [guardianPhone, setGuardianPhone] = useState("");
    const [admissionDocUrl, setAdmissionDocUrl] = useState("");
    const [passportPhotoUrl, setPassportPhotoUrl] = useState("");

    const [acceptTerms, setAcceptTerms] = useState(false);

    if (!open) return null;

    const clearErr = (field: string) => {
        setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };

    const validatePersonal = () => {
        const e: Record<string, string> = {};
        if (!firstName.trim()) e.firstName = "Required";
        if (!lastName.trim()) e.lastName = "Required";
        if (!email.trim()) e.email = "Required";
        if (!phone.trim()) e.phone = "Required";
        if (!startDate) e.startDate = "Required";
        if (!endDate) e.endDate = "Required";
        if (startDate && endDate && endDate <= startDate) e.endDate = "Must be after move-in date";
        setFieldErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateKYC = () => {
        const e: Record<string, string> = {};
        if (!levelOfStudy) e.levelOfStudy = "Required";
        if (!guardianName.trim()) e.guardianName = "Required";
        if (!guardianPhone.trim()) e.guardianPhone = "Required";
        setFieldErrors(e);
        return Object.keys(e).length === 0;
    };

    const uploadFile = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post("/upload/single", fd, { headers: { "Content-Type": "multipart/form-data" } });
        return res.data.url;
    };

    const handleFile = async (file: File, type: "admission" | "passport") => {
        setLoading(true);
        try {
            const url = await uploadFile(file);
            if (type === "admission") setAdmissionDocUrl(url);
            else setPassportPhotoUrl(url);
        } catch {
            setErr("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const submit = async () => {
        setLoading(true);
        setErr(null);
        try {
            const bookingRes = await api.post("/bookings", {
                hostelId, startDate, endDate,
                items: [{ roomId, quantity }],
                levelOfStudy, guardianName, guardianPhone,
                admissionDocUrl, passportPhotoUrl,
            });
            
            setBookingId(bookingRes.data.id);
            setStep("payment");
        } catch (e: any) {
            setErr(e.response?.data?.message || e.message || "Booking failed. Please try again.");
            setLoading(false);
        }
    };

    const handlePaymentMethodSelected = async (method: string) => {
        setSelectedPaymentMethod(method);
        if (method === "CARD") {
            setLoading(true);
            try {
                const res = await api.post(`/payments/paystack/init/${bookingId}`);
                if (res.data?.authorizationUrl) {
                    window.location.href = res.data.authorizationUrl;
                }
            } catch (e: any) {
                setErr(e.response?.data?.message || "Payment initiation failed.");
                setLoading(false);
            }
        }
    };

    const token = typeof window !== "undefined" ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")) : null;

    const steps = ["Your Info", "Student Details", "Review", "Payment"];
    const stepIndex = { personal: 0, kyc: 1, summary: 2, payment: 3, done: 4 }[step];

    const inputCls = (field: string) => cn(
        "w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors",
        fieldErrors[field]
            ? "border-red-300 bg-red-50 focus:border-red-400"
            : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500"
    );

    const FieldErr = ({ field }: { field: string }) =>
        fieldErrors[field] ? <p className="text-xs text-red-500 mt-0.5">{fieldErrors[field]}</p> : null;

    return (
        <div className="fixed inset-0 z-[110]">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">Complete your booking</p>
                            {hostelName && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {hostelName}{room ? ` · ${room.name}` : ""}
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Step indicator */}
                    {step !== "done" && (
                        <div className="px-5 py-3 border-b shrink-0">
                            <div className="flex items-center gap-2">
                                {steps.map((label, i) => (
                                    <div key={i} className="flex items-center gap-2 flex-1 last:flex-initial">
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                                                stepIndex > i ? "bg-blue-600 text-white" :
                                                    stepIndex === i ? "bg-blue-600 text-white" :
                                                        "bg-gray-100 text-gray-400"
                                            )}>
                                                {stepIndex > i ? <CheckCircle2 size={12} /> : i + 1}
                                            </div>
                                            <span className={cn(
                                                "text-xs hidden sm:block",
                                                stepIndex === i ? "text-gray-900 font-medium" : stepIndex > i ? "text-blue-600" : "text-gray-400"
                                            )}>
                                                {label}
                                            </span>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className={cn("flex-1 h-px", stepIndex > i ? "bg-blue-200" : "bg-gray-200")} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                        {err && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                {err}
                            </div>
                        )}

                        {/* Step 1: Personal */}
                        {step === "personal" && (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">Your information</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Fields marked * are required.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">First name *</label>
                                        <input
                                            className={inputCls("firstName")}
                                            value={firstName}
                                            onChange={e => { setFirstName(e.target.value); clearErr("firstName"); }}
                                            placeholder="Kofi"
                                        />
                                        <FieldErr field="firstName" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Last name *</label>
                                        <input
                                            className={inputCls("lastName")}
                                            value={lastName}
                                            onChange={e => { setLastName(e.target.value); clearErr("lastName"); }}
                                            placeholder="Mensah"
                                        />
                                        <FieldErr field="lastName" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
                                    <input
                                        type="email"
                                        className={inputCls("email")}
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                                        placeholder="kofi@example.com"
                                    />
                                    <FieldErr field="email" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        className={inputCls("phone")}
                                        value={phone}
                                        onChange={e => { setPhone(e.target.value); clearErr("phone"); }}
                                        placeholder="0244 123 456"
                                    />
                                    <FieldErr field="phone" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Move-in date *</label>
                                        <input
                                            type="date"
                                            className={inputCls("startDate")}
                                            value={startDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={e => { setStartDate(e.target.value); clearErr("startDate"); }}
                                        />
                                        <FieldErr field="startDate" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Move-out date *</label>
                                        <input
                                            type="date"
                                            className={inputCls("endDate")}
                                            value={endDate}
                                            min={startDate || new Date().toISOString().split("T")[0]}
                                            onChange={e => { setEndDate(e.target.value); clearErr("endDate"); }}
                                        />
                                        <FieldErr field="endDate" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Number of slots</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className={inputCls("quantity")}
                                        value={quantity}
                                        onChange={e => setQuantity(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: KYC */}
                        {step === "kyc" && (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">Student & guardian details</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Required for identity verification by the hostel owner.</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Level of study *</label>
                                    <select
                                        className={inputCls("levelOfStudy")}
                                        value={levelOfStudy}
                                        onChange={e => { setLevelOfStudy(e.target.value); clearErr("levelOfStudy"); }}
                                    >
                                        <option value="">Select your level</option>
                                        <option value="100">100 Level (Year 1)</option>
                                        <option value="200">200 Level (Year 2)</option>
                                        <option value="300">300 Level (Year 3)</option>
                                        <option value="400">400 Level (Year 4)</option>
                                        <option value="postgrad">Postgraduate</option>
                                    </select>
                                    <FieldErr field="levelOfStudy" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Guardian or parent name *</label>
                                    <input
                                        className={inputCls("guardianName")}
                                        value={guardianName}
                                        onChange={e => { setGuardianName(e.target.value); clearErr("guardianName"); }}
                                        placeholder="Full name"
                                    />
                                    <FieldErr field="guardianName" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Guardian phone *</label>
                                    <input
                                        type="tel"
                                        className={inputCls("guardianPhone")}
                                        value={guardianPhone}
                                        onChange={e => { setGuardianPhone(e.target.value); clearErr("guardianPhone"); }}
                                        placeholder="0244 000 000"
                                    />
                                    <FieldErr field="guardianPhone" />
                                </div>

                                <div className="space-y-3 pt-1">
                                    <p className="text-xs font-medium text-gray-500">Documents (optional, helps speed up approval)</p>
                                    {([
                                        { type: "admission" as const, label: "Admission letter / Student ID", url: admissionDocUrl },
                                        { type: "passport" as const, label: "Passport photo", url: passportPhotoUrl },
                                    ]).map(doc => (
                                        <div key={doc.type} className={cn(
                                            "relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                                            doc.url ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300"
                                        )}>
                                            <input
                                                type="file"
                                                accept={doc.type === "admission" ? "image/*,.pdf" : "image/*"}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0], doc.type); }}
                                                disabled={loading}
                                            />
                                            <Upload size={16} className={cn("mx-auto mb-1", doc.url ? "text-green-500" : "text-gray-400")} />
                                            <p className="text-xs text-gray-500">
                                                {doc.url ? "✓ Uploaded" : doc.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Summary */}
                        {step === "summary" && (
                            <div className="space-y-4">
                                <p className="font-medium text-gray-900 text-sm">Review your booking</p>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm border border-gray-100">
                                    {hostelName && (
                                        <div className="flex justify-between pb-2.5 border-b border-gray-200">
                                            <span className="text-gray-500">Hostel</span>
                                            <span className="font-medium text-gray-900 text-right max-w-[55%]">{hostelName}</span>
                                        </div>
                                    )}
                                    {room && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Room type</span>
                                            <span className="font-medium text-gray-900">{room.name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Guest</span>
                                        <span className="font-medium text-gray-900">{firstName} {lastName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Dates</span>
                                        <span className="font-medium text-gray-900">{startDate} → {endDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Slots</span>
                                        <span className="font-medium text-gray-900">{quantity}</span>
                                    </div>
                                    {room && (
                                        <div className="flex justify-between pt-2.5 border-t border-gray-200 font-semibold">
                                            <span>Total</span>
                                            <span className="text-blue-600">₵{((room.pricePerTerm * quantity) / 100).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={e => setAcceptTerms(e.target.checked)}
                                        className="mt-0.5 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                                        I agree to the terms and policies. I understand that a non-refundable booking fee of ₵5 is required to reveal the manager's contact for direct communication.
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Step 4: Payment */}
                        {step === "payment" && bookingId && (
                            <div className="space-y-4">
                                {selectedPaymentMethod === "BANK_TRANSFER" ? (
                                    <BankTransferForm 
                                        bookingId={bookingId} 
                                        token={token}
                                        onError={(e) => setErr(e)}
                                    />
                                ) : selectedPaymentMethod === "MOBILE_MONEY" ? (
                                    <MobileMoneyForm 
                                        bookingId={bookingId} 
                                        token={token}
                                        onError={(e) => setErr(e)}
                                        onSuccess={() => setStep("done")}
                                    />
                                ) : (
                                    <PaymentMethodSelector 
                                        bookingId={bookingId} 
                                        token={token} 
                                        onMethodSelected={handlePaymentMethodSelected}
                                        onError={(e) => setErr(e)}
                                    />
                                )}
                                
                                {(selectedPaymentMethod === "BANK_TRANSFER" || selectedPaymentMethod === "MOBILE_MONEY") && (
                                    <button 
                                        onClick={() => setSelectedPaymentMethod(null)}
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        ← Change payment method
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Done */}
                        {step === "done" && (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={28} className="text-green-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="font-semibold text-gray-900">Payment successful!</p>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                                        You can now view the manager's contact details and chat with them directly to confirm your move-in dates.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {step !== "done" && (
                        <div className="px-5 py-4 border-t shrink-0 flex gap-3">
                            {step !== "personal" && (
                                <button
                                    onClick={() => {
                                        setFieldErrors({}); setErr(null);
                                        if (step === "kyc") setStep("personal");
                                        else if (step === "summary") setStep("kyc");
                                        else if (step === "payment") setStep("summary");
                                    }}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                disabled={loading}
                                onClick={() => {
                                    setErr(null);
                                    if (step === "personal") {
                                        if (validatePersonal()) setStep("kyc");
                                    } else if (step === "kyc") {
                                        if (validateKYC()) setStep("summary");
                                    } else if (step === "summary") {
                                        if (!acceptTerms) { setErr("Please accept the terms to continue."); return; }
                                        submit();
                                    }
                                }}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 size={15} className="animate-spin" />}
                                {step === "summary" ? "Submit booking" : step === "payment" ? "I have made the transfer" : "Continue"}
                            </button>
                        </div>
                    )}
                    {step === "done" && (
                        <div className="px-5 py-4 border-t shrink-0">
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
