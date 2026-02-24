import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
    const { isLoggedIn, setIsLoggedIn, token, setToken } = useAuthStore();
    const [isReady, setIsReady] = React.useState(false);

    useEffect(() => {
        bootstrapAsync();
    }, []);

    const bootstrapAsync = async () => {
        try {
            // Restore token from secure storage
            const savedToken = await SecureStore.getItemAsync('authToken');
            if (savedToken) {
                setToken(savedToken);
                setIsLoggedIn(true);
            }
        } catch (e) {
            console.warn('Failed to restore token:', e);
        } finally {
            setIsReady(true);
        }
    };

    if (!isReady) {
        return null; // Or a splash screen
    }

    return (
        <Stack>
            {isLoggedIn ? (
                // Authenticated user flow
                <Stack.Screen
                    name="(app)"
                    options={{
                        headerShown: false,
                    }}
                />
            ) : (
                // Login/Auth flow
                <Stack.Screen
                    name="(auth)"
                    options={{
                        headerShown: false,
                    }}
                />
            )}
        </Stack>
    );
}
