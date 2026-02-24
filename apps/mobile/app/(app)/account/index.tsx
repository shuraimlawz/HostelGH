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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Edit2, User, Phone, Mail } from 'lucide-react-native';
import { useAuthStore } from '@/lib/stores/authStore';
import { apiClient } from '@/lib/api/client';
import { User as UserType } from '@/lib/types';

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
            <SafeAreaView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View className="bg-white px-4 py-6 border-b border-gray-200">
                    <View className="flex-row items-center gap-4">
                        <View className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                            {profile?.profileImage ? (
                                <Image
                                    source={{ uri: profile.profileImage }}
                                    className="w-16 h-16 rounded-full"
                                />
                            ) : (
                                <User size={32} color="#666" />
                            )}
                        </View>

                        <View className="flex-1">
                            <Text className="text-2xl font-bold">
                                {profile?.firstName} {profile?.lastName}
                            </Text>
                            <Text className="text-gray-600">{profile?.role}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsEditing(!isEditing)}
                            className="p-2"
                        >
                            <Edit2 size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Info */}
                <View className="px-4 py-6 gap-4">
                    {isEditing ? (
                        <>
                            <View>
                                <Text className="text-sm font-semibold mb-2 text-gray-700">
                                    First Name
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3"
                                    value={editData.firstName}
                                    onChangeText={(text: string) =>
                                        setEditData({ ...editData, firstName: text })
                                    }
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-semibold mb-2 text-gray-700">
                                    Last Name
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3"
                                    value={editData.lastName}
                                    onChangeText={(text: string) =>
                                        setEditData({ ...editData, lastName: text })
                                    }
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-semibold mb-2 text-gray-700">
                                    Phone Number
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3"
                                    value={editData.phoneNumber}
                                    onChangeText={(text: string) =>
                                        setEditData({ ...editData, phoneNumber: text })
                                    }
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View className="flex-row gap-2 pt-4">
                                <TouchableOpacity
                                    onPress={() => setIsEditing(false)}
                                    className="flex-1 border border-gray-300 py-3 rounded-lg"
                                >
                                    <Text className="text-center font-semibold">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleUpdateProfile}
                                    disabled={loading}
                                    className="flex-1 bg-black py-3 rounded-lg"
                                >
                                    <Text className="text-white font-semibold text-center">
                                        Save
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <View className="bg-white p-4 rounded-lg border border-gray-200">
                                <View className="flex-row items-center gap-3 mb-3">
                                    <Mail size={20} color="#666" />
                                    <View>
                                        <Text className="text-gray-600 text-sm">Email</Text>
                                        <Text className="font-semibold">{profile?.email}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-3">
                                    <Phone size={20} color="#666" />
                                    <View>
                                        <Text className="text-gray-600 text-sm">Phone</Text>
                                        <Text className="font-semibold">{profile?.phoneNumber}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                                <Text className="text-blue-900 text-sm">
                                    📍 Member since{' '}
                                    {new Date(profile?.createdAt || '').toLocaleDateString()}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Logout Button */}
                <View className="px-4 pb-8">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-red-50 border border-red-200 py-3 rounded-lg flex-row items-center justify-center gap-2"
                    >
                        <LogOut size={20} color="#dc2626" />
                        <Text className="text-red-600 font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
