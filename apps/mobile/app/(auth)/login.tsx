import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';
import { apiClient } from '@/lib/api/client';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
    const router = useRouter();
    const { setToken, setUser, setIsLoggedIn } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.login(email, password);
            
            setToken(response.token);
            setUser(response.user);
            setIsLoggedIn(true);
            
            router.replace('/(app)/explore');
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.response?.data?.message || 'Invalid email or password'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 justify-center"
            >
                <View className="mb-12">
                    <Text className="text-4xl font-bold mb-2">Welcome</Text>
                    <Text className="text-gray-600">to HostelGH</Text>
                </View>

                <View className="gap-4 mb-8">
                    <View>
                        <Text className="text-sm font-semibold mb-2 text-gray-700">Email</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-semibold mb-2 text-gray-700">Password</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className={`rounded-lg py-3 mb-4 ${loading ? 'bg-gray-400' : 'bg-black'}`}
                >
                    <Text className="text-white font-semibold text-center text-lg">
                        {loading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/(auth)/forgot-password')}
                    disabled={loading}
                >
                    <Text className="text-center text-blue-600 font-semibold">
                        Forgot Password?
                    </Text>
                </TouchableOpacity>

                <View className="mt-8 flex-row justify-center gap-2">
                    <Text className="text-gray-600">Don't have an account?</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/register')}
                        disabled={loading}
                    >
                        <Text className="text-blue-600 font-semibold">Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
