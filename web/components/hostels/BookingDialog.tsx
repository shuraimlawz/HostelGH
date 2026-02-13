"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Room, Hostel } from "@/types";

// Room and Hostel interfaces are now imported from @/types

interface BookingDialogProps {
    hostel: Hostel;
    room: Room;
    trigger: React.ReactNode;
}

export default function BookingDialog({ hostel, room, trigger }: BookingDialogProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const handleBooking = async () => {
        if (!user) {
            toast.error("Please login to book a hostel");
            router.push("/auth/login");
            return;
        }

        if (!date) {
            toast.error("Please select a start date");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/bookings", {
                hostelId: hostel.id,
                startDate: date.toISOString(),
                endDate: new Date(date.getTime() + 1000 * 60 * 60 * 24 * 120).toISOString(), // 4 months term
                items: [{ roomId: room.id, quantity: 1 }],
                notes: "Automated booking request from web platform"
            });
            toast.success("Booking request sent! Awaiting owner approval.");
            setOpen(false);
            router.push("/tenant/bookings");
        } catch (error: any) {
            toast.error(error.message || "Failed to create booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Request to Book</DialogTitle>
                    <DialogDescription>
                        Selected: <span className="font-bold text-foreground">{room.name}</span> at {hostel.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Select Starting Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-medium h-12 rounded-xl",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border space-y-2">
                        <div className="flex justify-between text-sm">
                            <p className="text-muted-foreground">Term Duration</p>
                            <p className="font-bold">4 Months (1 Term)</p>
                        </div>
                        <div className="flex justify-between text-lg pt-2 border-t">
                            <p className="font-bold">Total due</p>
                            <p className="font-extrabold text-primary">GH₵ {room.pricePerTerm}</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleBooking} disabled={isSubmitting} className="w-full h-12 text-lg font-bold rounded-xl">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Confirm Booking Request"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
