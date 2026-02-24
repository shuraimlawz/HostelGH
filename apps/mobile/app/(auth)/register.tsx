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
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';
import { apiClient } from '@/lib/api/client';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    header: {
        marginBottom: 32,
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
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingBottom: 32,
    },
    bottomText: {
        color: '#666',
    },
    loginLink: {
        color: '#0066cc',
        fontWeight: '600',
    },
});

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
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join HostelGH today</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="First name"
                                value={firstName}
                                onChangeText={(text: string) => setFirstName(text)}
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Last name"
                                value={lastName}
                                onChangeText={(text: string) => setLastName(text)}
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={(text: string) => setEmail(text)}
                                editable={!loading}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Phone number"
                                value={phoneNumber}
                                onChangeText={(text: string) => setPhoneNumber(text)}
                                editable={!loading}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Password (min 8 chars)"
                                value={password}
                                onChangeText={(text: string) => setPassword(text)}
                                editable={!loading}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChangeText={(text: string) => setConfirmPassword(text)}
                                editable={!loading}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={loading}
                        style={[
                            styles.submitButton,
                            loading ? styles.submitButtonDisabled : styles.submitButtonActive,
                        ]}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.bottomSection}>
                        <Text style={styles.bottomText}>Already have an account?</Text>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
