import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        try {
            setLoading(true);
            // TODO: Call API endpoint to send reset email
            // await apiClient.sendPasswordReset(email);
            
            setSent(true);
            Alert.alert(
                'Check Your Email',
                'We\'ve sent password reset instructions to your email address'
            );
        } catch (error: any) {
            Alert.alert('Error', 'Failed to send reset email');
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
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mb-8"
                >
                    <ArrowLeft size={24} color="#000" />
                    <Text className="ml-2 font-semibold">Back</Text>
                </TouchableOpacity>

                <View className="mb-12">
                    <Text className="text-4xl font-bold mb-2">Reset Password</Text>
                    <Text className="text-gray-600">
                        Enter your email to receive password reset instructions
                    </Text>
                </View>

                {sent ? (
                    <View className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <Text className="text-green-900 font-semibold text-center">
                            ✓ Reset email sent!
                        </Text>
                        <Text className="text-green-800 text-sm text-center mt-2">
                            Check your email for instructions to reset your password.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View className="mb-8">
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

                        <TouchableOpacity
                            onPress={handleResetPassword}
                            disabled={loading}
                            className={`rounded-lg py-3 mb-4 ${loading ? 'bg-gray-400' : 'bg-black'}`}
                        >
                            <Text className="text-white font-semibold text-center text-lg">
                                {loading ? 'Sending...' : 'Send Reset Email'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                <View className="mt-8 flex-row justify-center gap-2">
                    <Text className="text-gray-600">Remember your password?</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className="text-blue-600 font-semibold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
