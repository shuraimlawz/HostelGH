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
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';
import { apiClient } from '@/lib/api/client';
import * as SecureStore from 'expo-secure-store';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    formContainer: {
        gap: 16,
        marginBottom: 32,
    },
    fieldGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
    },
    submitButton: {
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 16,
    },
    submitButtonActive: {
        backgroundColor: '#000',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    link: {
        textAlign: 'center',
        color: '#0066cc',
        fontWeight: '600',
    },
    bottomSection: {
        marginTop: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    bottomText: {
        color: '#666',
    },
    signupLink: {
        color: '#0066cc',
        fontWeight: '600',
    },
});

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
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>to HostelGH</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text: string) => setPassword(text)}
                            editable={!loading}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    style={[
                        styles.submitButton,
                        loading ? styles.submitButtonDisabled : styles.submitButtonActive,
                    ]}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/(auth)/forgot-password')}
                    disabled={loading}
                >
                    <Text style={styles.link}>Forgot Password?</Text>
                </TouchableOpacity>

                <View style={styles.bottomSection}>
                    <Text style={styles.bottomText}>Don't have an account?</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/register')}
                        disabled={loading}
                    >
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

