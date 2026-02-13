import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Create Account"
            subtitle="Sign up to book hostels or list your space"
        >
            <Suspense fallback={
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Loading form...</p>
                </div>
            }>
                <RegisterForm />
            </Suspense>
        </AuthLayout>
    );
}
