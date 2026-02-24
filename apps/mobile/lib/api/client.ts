import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/lib/stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class APIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor for authentication
        this.client.interceptors.request.use(async (config) => {
            try {
                const token = await SecureStore.getItemAsync('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error getting auth token:', error);
            }
            return config;
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid - logout
                    await SecureStore.deleteItemAsync('authToken');
                    useAuthStore.getState().logout();
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(email: string, password: string) {
        const response = await this.client.post('/auth/login', { email, password });
        const token = response.data.token;
        await SecureStore.setItemAsync('authToken', token);
        return response.data;
    }

    async register(email: string, password: string, name: string) {
        const response = await this.client.post('/auth/register', { email, password, name });
        const token = response.data.token;
        await SecureStore.setItemAsync('authToken', token);
        return response.data;
    }

    async logout() {
        await SecureStore.deleteItemAsync('authToken');
        useAuthStore.getState().logout();
    }

    // Hostel endpoints
    async getHostels(params?: any) {
        return this.client.get('/hostels', { params });
    }

    async getHostelById(id: string) {
        return this.client.get(`/hostels/${id}`);
    }

    async getHostelRooms(hostelId: string) {
        return this.client.get(`/hostels/${hostelId}/rooms`);
    }

    // Booking endpoints
    async createBooking(data: any) {
        return this.client.post('/bookings', data);
    }

    async getBookings() {
        return this.client.get('/bookings');
    }

    async getBookingById(id: string) {
        return this.client.get(`/bookings/${id}`);
    }

    async cancelBooking(id: string, reason: string) {
        return this.client.patch(`/bookings/${id}/cancel`, { reason });
    }

    // Payment endpoints
    async initializePayment(bookingId: string) {
        return this.client.post(`/payments/initialize`, { bookingId });
    }

    async initPaystackPayment(bookingId: string) {
        return this.client.post(`/payments/paystack/initialize`, { bookingId });
    }

    // User endpoints
    async getProfile() {
        return this.client.get('/users/profile');
    }

    async updateProfile(data: any) {
        return this.client.patch('/users/profile', data);
    }

    async uploadFile(file: any, type: 'avatar' | 'document') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return this.client.post('/upload/single', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
}

export const apiClient = new APIClient();
