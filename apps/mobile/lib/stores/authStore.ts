import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStore {
    token: string | null;
    user: any | null;
    isLoggedIn: boolean;
    setToken: (token: string) => void;
    setUser: (user: any) => void;
    setIsLoggedIn: (logged: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isLoggedIn: false,
            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            setIsLoggedIn: (logged) => set({ isLoggedIn: logged }),
            logout: () => set({ token: null, user: null, isLoggedIn: false }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
