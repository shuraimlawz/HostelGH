import axios from "axios";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://hostelgh.onrender.com").replace(/\/$/, "");

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized, and we haven't retried yet, and we aren't already trying to refresh or login
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh" &&
            originalRequest.url !== "/auth/login"
        ) {
            originalRequest._retry = true;
            try {
                // The browser automatically appends the HttpOnly `refresh_token` cookie here
                const res = await api.post("/auth/refresh", {});

                if (res.data?.token || res.data?.accessToken) {
                    const newToken = res.data.token || res.data.accessToken;
                    if (typeof window !== "undefined") {
                        localStorage.setItem("accessToken", newToken);
                    }
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    // Re-fire the original failed request with the new token
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Silent refresh failed (cookie expired, revoked, or missing)
                if (typeof window !== "undefined") {
                    localStorage.removeItem("accessToken");

                    // Prevent redirect loops if already on auth page
                    if (!window.location.pathname.startsWith("/auth")) {
                        window.location.href = "/auth/login?session_expired=true";
                    }
                }
                return Promise.reject(refreshError);
            }
        }

        // Standard error formatting
        const data = error.response?.data;
        const message =
            (typeof data?.message === "string" ? data.message : Array.isArray(data?.message) ? data.message[0] : null) ||
            data?.error ||
            error.message ||
            "An unexpected error occurred";
        return Promise.reject({ ...error, message });
    },
);
