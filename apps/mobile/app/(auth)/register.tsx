import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';
import { apiClient } from '@/lib/api/client';

export default function RegisterScreen() {
    const router = useRouter();
    const { setToken, setUser, setIsLoggedIn } = useAuthStore();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.register(email, password, `${firstName} ${lastName}`);
            
            setToken(response.token);
            setUser(response.user);
            setIsLoggedIn(true);
            
            router.replace('/(app)/explore');
        } catch (error: any) {
            Alert.alert(
                'Registration Failed',
                error.response?.data?.message || 'Please try again'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="px-6 pt-6" showsVerticalScrollIndicator={false}>
                    <View className="mb-8">
                        <Text className="text-4xl font-bold mb-2">Create Account</Text>
                        <Text className="text-gray-600">Join HostelGH today</Text>
                    </View>

                    <View className="gap-4 mb-8">
                        <View>
                            <Text className="text-sm font-semibold mb-2 text-gray-700">First Name</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg px-4 py-3"
                                placeholder="First name"
                                value={firstName}
                                onChangeText={setFirstName}
                                editable={!loading}
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold mb-2 text-gray-700">Last Name</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg px-4 py-3"
                                placeholder="Last name"
                                value={lastName}
                                onChangeText={setLastName}
                                editable={!loading}
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold mb-2 text-gray-700">Email</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg px-4 py-3"
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                editable={!loading}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold mb-2 text-gray-700">Phone</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg px-4 py-3"
                                placeholder="Phone number"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                editable={!loading}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold mb-2 text-gray-700">Password</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg px-4 py-3"
                                placeholder="Password (min 8 chars)"
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading}
                                secureTextEntry
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold mb-2 text-gray-700">Confirm Password</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg px-4 py-3"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                editable={!loading}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={loading}
                        className={`rounded-lg py-3 mb-4 ${loading ? 'bg-gray-400' : 'bg-black'}`}
                    >
                        <Text className="text-white font-semibold text-center text-lg">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center gap-2 pb-8">
                        <Text className="text-gray-600">Already have an account?</Text>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text className="text-blue-600 font-semibold">Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
