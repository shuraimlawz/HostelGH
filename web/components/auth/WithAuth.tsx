import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Adjust this type based on your actual UserRole enum from Prisma
// The frontend needs a parallel type definition
export type Role = 'TENANT' | 'OWNER' | 'ADMIN';

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles?: Role[]
) {
    return function ProtectedRoute(props: P) {
        const router = useRouter();
        const [isVerified, setIsVerified] = useState(false);

        useEffect(() => {
            const verify = async () => {
                // Attempt to get user data from local storage where you might have stored it on login
                // Alternatively, decode the JWT accessToken here to get the role if user data isn't in localStorage
                const token = localStorage.getItem('accessToken');
                const userStr = localStorage.getItem('user');

                if (!token) {
                    // We could try to refresh proactively here before kicking them out, 
                    // but the axios interceptor handles API calls. 
                    // For initial page load, kicking to login is safest if no token exists in memory.
                    router.replace(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
                    return;
                }

                let user;
                if (userStr) {
                    try {
                        user = JSON.parse(userStr);
                    } catch { }
                }

                if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                    // Send to a 403 unauthorized page or dashboard based on role
                    router.replace('/unauthorized'); // You should create this page if it doesn't exist
                    return;
                }

                setIsVerified(true);
            };

            verify();
        }, [router]);

        if (!isVerified) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent text-emerald-500"></div>
                        <p className="text-sm font-medium text-gray-500">Checking credentials...</p>
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
}
