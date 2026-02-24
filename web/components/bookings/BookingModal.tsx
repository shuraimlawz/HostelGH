"use client";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { CheckCircle2, Upload, AlertCircle, Loader2 } from "lucide-react";

export default function BookingModal({
    open,
    onClose,
    hostelId,
    roomId,
    room,
}: {
    open: boolean;
    onClose: () => void;
    hostelId: string;
    roomId: string;
    room?: any;
}) {
    const { user } = useAuth();
    const [step, setStep] = useState<"personal" | "kyc" | "summary" | "done">("personal");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // Personal info step
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");

    // Booking details
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [quantity, setQuantity] = useState(1);

    // KYC step
    const [levelOfStudy, setLevelOfStudy] = useState("");
    const [guardianName, setGuardianName] = useState("");
    const [guardianPhone, setGuardianPhone] = useState("");
    const [admissionDocUrl, setAdmissionDocUrl] = useState("");
    const [passportPhotoUrl, setPassportPhotoUrl] = useState("");
    const [admissionDocFile, setAdmissionDocFile] = useState<File | null>(null);
    const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null);

    // Summary step
    const [acceptTerms, setAcceptTerms] = useState(false);

    if (!open) return null;

    const validatePersonalInfo = () => {
        if (!firstName.trim() || !lastName.trim()) return "First and last name are required";
        if (!email.trim()) return "Email is required";
        if (!phone.trim()) return "Phone is required";
        if (!startDate || !endDate) return "Start and end dates are required";
        return null;
    };

    const validateKYC = () => {
        if (!levelOfStudy.trim()) return "Level of study is required";
        if (!guardianName.trim()) return "Guardian name is required";
        if (!guardianPhone.trim()) return "Guardian phone is required";
        return null;
    };

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/upload/single", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.url;
    };

    const handleFileChange = async (
        file: File,
        type: "admission" | "passport",
    ) => {
        try {
            setLoading(true);
            const url = await uploadFile(file);
            if (type === "admission") {
                setAdmissionDocUrl(url);
                setAdmissionDocFile(file);
            } else {
                setPassportPhotoUrl(url);
                setPassportPhotoFile(file);
            }
        } catch (e: any) {
            setErr(`Failed to upload ${type} document`);
        } finally {
            setLoading(false);
        }
    };

    async function submit() {
        setErr(null);
        setLoading(true);
        try {
            await api.post("/bookings", {
                hostelId,
                startDate,
                endDate,
                items: [{ roomId, quantity }],
                levelOfStudy,
                guardianName,
                guardianPhone,
                admissionDocUrl,
                passportPhotoUrl,
            });
            setStep("done");
        } catch (e: any) {
            setErr(e.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[110]">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl rounded-3xl bg-white border shadow-2xl">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <div className="font-semibold">Complete Your Booking</div>
                        <button
                            onClick={onClose}
                            className="rounded-full px-3 py-1 text-sm hover:bg-gray-100"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
                        {["personal", "kyc", "summary"].map((s, i) => (
                            <div key={s} className="flex-1 flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                        step === s
                                            ? "bg-black text-white"
                                            : ["personal", "kyc", "summary"].indexOf(step) > i
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-200 text-gray-600"
                                    }`}
                                >
                                    {["personal", "kyc", "summary"].indexOf(step) > i ? (
                                        <CheckCircle2 size={18} />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                {i < 2 && (
                                    <div
                                        className={`flex-1 h-1 ml-2 ${
                                            ["personal", "kyc", "summary"].indexOf(step) > i
                                                ? "bg-green-500"
                                                : "bg-gray-200"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 space-y-6">
                        {err && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
                                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600">{err}</p>
                            </div>
                        )}

                        {/* Step: Personal Info */}
                        {step === "personal" && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Confirm Your Personal Information</h3>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">First Name *</label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Last Name *</label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Email *</label>
                                    <input
                                        type="email"
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Phone *</label>
                                    <input
                                        type="tel"
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+233..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">Start Date *</label>
                                        <input
                                            type="date"
                                            className="mt-1 w-full rounded-2xl border px-4 py-3"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">End Date *</label>
                                        <input
                                            type="date"
                                            className="mt-1 w-full rounded-2xl border px-4 py-3"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Number of Slots *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step: KYC */}
                        {step === "kyc" && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Student & Guardian Information</h3>
                                <p className="text-sm text-gray-600">
                                    Help us verify your identity. You can upload documents now or skip (optional for MVP).
                                </p>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Level of Study *</label>
                                    <select
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={levelOfStudy}
                                        onChange={(e) => setLevelOfStudy(e.target.value)}
                                    >
                                        <option value="">Select level</option>
                                        <option value="100">100 Level</option>
                                        <option value="200">200 Level</option>
                                        <option value="300">300 Level</option>
                                        <option value="400">400 Level</option>
                                        <option value="postgrad">Postgraduate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Guardian Name *</label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={guardianName}
                                        onChange={(e) => setGuardianName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Guardian Phone *</label>
                                    <input
                                        type="tel"
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={guardianPhone}
                                        onChange={(e) => setGuardianPhone(e.target.value)}
                                        placeholder="+233..."
                                    />
                                </div>

                                <div className="space-y-2 pt-4">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Admission Letter / Student ID (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleFileChange(e.target.files[0], "admission");
                                                }
                                            }}
                                            disabled={loading}
                                        />
                                        <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-xs text-gray-500">
                                            {admissionDocUrl ? "✓ Uploaded" : "Click to upload"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Passport Photo (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleFileChange(e.target.files[0], "passport");
                                                }
                                            }}
                                            disabled={loading}
                                        />
                                        <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-xs text-gray-500">
                                            {passportPhotoUrl ? "✓ Uploaded" : "Click to upload"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step: Summary */}
                        {step === "summary" && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Review Your Booking</h3>
                                <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Guest:</span>
                                        <span className="font-semibold">
                                            {firstName} {lastName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dates:</span>
                                        <span className="font-semibold">
                                            {startDate} to {endDate}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Slots:</span>
                                        <span className="font-semibold">{quantity}</span>
                                    </div>
                                    {room && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Room:</span>
                                                <span className="font-semibold">{room.name}</span>
                                            </div>
                                            <div className="border-t pt-3 flex justify-between font-bold">
                                                <span>Total:</span>
                                                <span>
                                                    ₵{((room.pricePerTerm * quantity) / 100).toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="mt-1 rounded border-gray-300"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                    />
                                    <label htmlFor="terms" className="text-xs text-gray-600">
                                        I agree to the hostel's booking terms and policies. I understand that payment is
                                        due within 24 hours of approval.
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Done step */}
                        {step === "done" && (
                            <div className="space-y-4 text-center py-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={32} className="text-green-600" />
                                </div>
                                <h3 className="font-bold text-lg">Booking Request Submitted!</h3>
                                <p className="text-sm text-gray-600">
                                    The owner will review your booking and contact you within 24 hours. Payment is due after approval.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Actions */}
                    {step !== "done" && (
                        <div className="px-6 py-4 border-t flex gap-3">
                            {step !== "personal" && (
                                <button
                                    onClick={() => {
                                        if (step === "kyc") setStep("personal");
                                        else if (step === "summary") setStep("kyc");
                                    }}
                                    className="flex-1 px-4 py-3 rounded-2xl border font-semibold hover:bg-gray-50"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (step === "personal") {
                                        const error = validatePersonalInfo();
                                        if (error) {
                                            setErr(error);
                                            return;
                                        }
                                        setStep("kyc");
                                    } else if (step === "kyc") {
                                        const error = validateKYC();
                                        if (error) {
                                            setErr(error);
                                            return;
                                        }
                                        setStep("summary");
                                    } else if (step === "summary") {
                                        if (!acceptTerms) {
                                            setErr("You must accept the terms to proceed");
                                            return;
                                        }
                                        submit();
                                    }
                                }}
                                disabled={loading}
                                className="flex-1 px-4 py-3 rounded-2xl bg-black text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {step === "summary" ? "Submit Booking" : "Next"}
                            </button>
                        </div>
                    )}
                    {step === "done" && (
                        <div className="px-6 py-4 border-t">
                            <button
                                onClick={onClose}
                                className="w-full px-4 py-3 rounded-2xl bg-black text-white font-semibold hover:opacity-90"
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
