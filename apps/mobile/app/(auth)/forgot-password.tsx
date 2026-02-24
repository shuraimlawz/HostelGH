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
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

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
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButtonText: {
        marginLeft: 8,
        fontWeight: '600',
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
    successBox: {
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    successTitle: {
        color: '#166534',
        fontWeight: '600',
        textAlign: 'center',
    },
    successMessage: {
        color: '#187a3a',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    formContainer: {
        marginBottom: 32,
    },
    fieldGroup: {
        gap: 8,
        marginBottom: 32,
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
        marginTop: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    bottomText: {
        color: '#666',
    },
    goBackLink: {
        color: '#0066cc',
        fontWeight: '600',
    },
});

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
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Text style={{ fontSize: 18 }}>←</Text>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your email to receive password reset instructions
                    </Text>
                </View>

                {sent ? (
                    <View style={styles.successBox}>
                        <Text style={styles.successTitle}>✓ Reset email sent!</Text>
                        <Text style={styles.successMessage}>
                            Check your email for instructions to reset your password.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={(text: string) => setEmail(text)}
                                editable={!loading}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleResetPassword}
                            disabled={loading}
                            style={[
                                styles.submitButton,
                                loading ? styles.submitButtonDisabled : styles.submitButtonActive,
                            ]}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Sending...' : 'Send Reset Email'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.bottomSection}>
                    <Text style={styles.bottomText}>Remember your password?</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.goBackLink}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
