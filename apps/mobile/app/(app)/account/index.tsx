import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    TextInput,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';
import { apiClient } from '@/lib/api/client';
import { User as UserType } from '@/lib/types';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerRole: {
        color: '#666',
        marginTop: 4,
    },
    editButton: {
        padding: 8,
    },
    editButtonText: {
        fontSize: 18,
    },
    infoSection: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 16,
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
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
        paddingTop: 16,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    infoRowLast: {
        marginBottom: 0,
    },
    infoIcon: {
        fontSize: 20,
        color: '#666',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        color: '#666',
        fontSize: 12,
    },
    infoValue: {
        fontWeight: '600',
        marginTop: 4,
    },
    memberBox: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        marginTop: 16,
    },
    memberText: {
        color: '#1e3a8a',
        fontSize: 14,
    },
    logoutButton: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    logoutIcon: {
        fontSize: 18,
    },
    logoutText: {
        color: '#dc2626',
        fontWeight: '600',
    },
    logoutSection: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
});

export default function AccountScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [profile, setProfile] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getProfile();
            setProfile(response.data);
            setEditData({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                phoneNumber: response.data.phoneNumber,
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            await apiClient.updateProfile(editData);
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
            loadProfile();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {
                text: 'Cancel',
                onPress: () => {},
                style: 'cancel',
            },
            {
                text: 'Logout',
                onPress: async () => {
                    await apiClient.logout();
                    logout();
                    router.replace('/(auth)/login');
                },
                style: 'destructive',
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatar}>
                            {profile?.profileImage ? (
                                <Image
                                    source={{ uri: profile.profileImage }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={{ fontSize: 32 }}>👤</Text>
                            )}
                        </View>

                        <View style={styles.headerInfo}>
                            <Text style={styles.headerName}>
                                {profile?.firstName} {profile?.lastName}
                            </Text>
                            <Text style={styles.headerRole}>{profile?.role}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsEditing(!isEditing)}
                            style={styles.editButton}
                        >
                            <Text style={styles.editButtonText}>✏️</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Info */}
                <View style={styles.infoSection}>
                    {isEditing ? (
                        <>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.firstName}
                                    onChangeText={(text: string) =>
                                        setEditData({ ...editData, firstName: text })
                                    }
                                />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.lastName}
                                    onChangeText={(text: string) =>
                                        setEditData({ ...editData, lastName: text })
                                    }
                                />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.phoneNumber}
                                    onChangeText={(text: string) =>
                                        setEditData({ ...editData, phoneNumber: text })
                                    }
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    onPress={() => setIsEditing(false)}
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleUpdateProfile}
                                    disabled={loading}
                                    style={styles.saveButton}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoIcon}>✉️</Text>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Email</Text>
                                        <Text style={styles.infoValue}>{profile?.email}</Text>
                                    </View>
                                </View>

                                <View style={[styles.infoRow, styles.infoRowLast]}>
                                    <Text style={styles.infoIcon}>📱</Text>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Phone</Text>
                                        <Text style={styles.infoValue}>{profile?.phoneNumber}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.memberBox}>
                                <Text style={styles.memberText}>
                                    📍 Member since{' '}
                                    {new Date(profile?.createdAt || '').toLocaleDateString()}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
