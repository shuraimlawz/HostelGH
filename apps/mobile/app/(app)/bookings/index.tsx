import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Calendar, MapPin, DollarSign, CheckCircle, Clock } from 'lucide-react-native';
import { apiClient } from '@/lib/api/client';
import { BookingDetail } from '@/lib/types';

export default function BookingsScreen() {
    const [bookings, setBookings] = useState<BookingDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getBookings();
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await apiClient.cancelBooking(bookingId, 'User requested cancellation');
                            Alert.alert('Success', 'Booking cancelled');
                            loadBookings();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const filteredBookings = bookings.filter((b) => {
        if (filter === 'all') return true;
        if (filter === 'pending') return b.status === 'PENDING_APPROVAL';
        if (filter === 'confirmed') return b.status === 'CONFIRMED';
        if (filter === 'cancelled') return b.status === 'CANCELLED';
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL':
                return 'bg-yellow-100';
            case 'CONFIRMED':
                return 'bg-green-100';
            case 'CANCELLED':
                return 'bg-red-100';
            default:
                return 'bg-gray-100';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL':
                return 'text-yellow-800';
            case 'CONFIRMED':
                return 'text-green-800';
            case 'CANCELLED':
                return 'text-red-800';
            default:
                return 'text-gray-800';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Filter Tabs */}
                <View className="flex-row gap-2 px-4 pt-4 pb-4 border-b border-gray-200">
                    {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full ${
                                filter === f ? 'bg-black' : 'bg-white border border-gray-300'
                            }`}
                        >
                            <Text
                                className={
                                    filter === f
                                        ? 'text-white font-semibold capitalize'
                                        : 'text-gray-700 capitalize'
                                }
                            >
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bookings List */}
                {loading ? (
                    <View className="flex-1 justify-center items-center py-12">
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : filteredBookings.length === 0 ? (
                    <View className="px-4 py-12 items-center">
                        <Text className="text-gray-600 text-lg">No bookings found</Text>
                    </View>
                ) : (
                    <View className="px-4 pb-6 gap-4">
                        {filteredBookings.map((booking) => (
                            <View
                                key={booking.id}
                                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                            >
                                {/* Header */}
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold mb-1">
                                            {booking.hostel.name}
                                        </Text>
                                        <Text className="text-gray-600 text-sm">
                                            {booking.room.name}
                                        </Text>
                                    </View>
                                    <View
                                        className={`px-3 py-1 rounded-full ${getStatusColor(
                                            booking.status
                                        )}`}
                                    >
                                        <Text
                                            className={`text-xs font-semibold ${getStatusTextColor(
                                                booking.status
                                            )}`}
                                        >
                                            {booking.status.replace(/_/g, ' ')}
                                        </Text>
                                    </View>
                                </View>

                                {/* Details */}
                                <View className="gap-2 mb-4">
                                    <View className="flex-row items-center gap-2">
                                        <Calendar size={16} color="#666" />
                                        <Text className="text-gray-700 text-sm">
                                            {new Date(booking.startDate).toLocaleDateString()} -{' '}
                                            {new Date(booking.endDate).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                        <MapPin size={16} color="#666" />
                                        <Text className="text-gray-700 text-sm">
                                            {booking.hostel.city}
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                        <DollarSign size={16} color="#666" />
                                        <Text className="text-gray-700 text-sm font-semibold">
                                            ₵{Math.floor(booking.totalPrice / 100)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Actions */}
                                {booking.status === 'PENDING_APPROVAL' && (
                                    <TouchableOpacity
                                        onPress={() => handleCancelBooking(booking.id)}
                                        className="bg-red-50 py-2 rounded-lg border border-red-200"
                                    >
                                        <Text className="text-red-600 font-semibold text-center">
                                            Cancel Request
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {booking.status === 'CONFIRMED' && booking.paymentStatus !== 'SUCCESS' && (
                                    <TouchableOpacity className="bg-black py-2 rounded-lg">
                                        <Text className="text-white font-semibold text-center">
                                            Complete Payment
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
