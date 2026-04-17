"use client";

import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = "danger"
}: ConfirmModalProps) {
    const isDanger = variant === "danger";
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl z-0" />
                
                <div className="relative z-10">
                    <div className={cn(
                        "p-8 pb-4 flex flex-col items-center text-center space-y-4",
                        isDanger ? "bg-rose-50/50" : "bg-blue-50/50"
                    )}>
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                            isDanger ? "bg-rose-100 text-rose-600 shadow-rose-100" : "bg-blue-100 text-blue-600 shadow-blue-100"
                        )}>
                            {isDanger ? <XCircle size={32} /> : <TriangleAlert size={32} />}
                        </div>
                        
                        <div className="space-y-2">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                                    {title}
                                </DialogTitle>
                                <DialogDescription className="text-sm font-medium text-gray-500 leading-relaxed px-4">
                                    {description}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>

                    <div className="p-8 pt-4">
                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="rounded-2xl h-12 text-xs font-bold border-gray-100 hover:bg-gray-50 uppercase tracking-widest flex-1"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={cn(
                                    "rounded-2xl h-12 text-xs font-bold uppercase tracking-widest flex-1 shadow-lg active:scale-95 transition-all",
                                    isDanger 
                                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200" 
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                                )}
                            >
                                {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                {confirmText}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
