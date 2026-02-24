import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { apiClient } from '@/lib/api/client';
import { BookingDetail } from '@/lib/types';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    filterTabs: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tabButtonActive: {
        backgroundColor: '#000',
    },
    tabButtonInactive: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    tabButtonText: {
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    tabButtonTextActive: {
        color: '#fff',
    },
    tabButtonTextInactive: {
        color: '#333',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyContainer: {
        paddingHorizontal: 16,
        paddingVertical: 48,
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    bookingsList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
        paddingBottom: 24,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bookingHeaderLeft: {
        flex: 1,
    },
    hostelName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    roomName: {
        color: '#666',
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    bookingDetails: {
        gap: 8,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailIcon: {
        fontSize: 14,
    },
    detailText: {
        color: '#333',
        fontSize: 13,
    },
    actionButton: {
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    cancelButtonText: {
        color: '#dc2626',
        fontWeight: '600',
    },
    paymentButton: {
        backgroundColor: '#000',
    },
    paymentButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

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
                return '#fef3c7';
            case 'CONFIRMED':
                return '#dcfce7';
            case 'CANCELLED':
                return '#fee2e2';
            default:
                return '#f3f4f6';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL':
                return '#78350f';
            case 'CONFIRMED':
                return '#166534';
            case 'CANCELLED':
                return '#991b1b';
            default:
                return '#374151';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Filter Tabs */}
                <View style={styles.filterTabs}>
                    {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            style={[
                                styles.tabButton,
                                filter === f ? styles.tabButtonActive : styles.tabButtonInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    filter === f
                                        ? styles.tabButtonTextActive
                                        : styles.tabButtonTextInactive,
                                ]}
                            >
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bookings List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : filteredBookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No bookings found</Text>
                    </View>
                ) : (
                    <View style={styles.bookingsList}>
                        {filteredBookings.map((booking) => (
                            <View key={booking.id} style={styles.bookingCard}>
                                {/* Header */}
                                <View style={styles.bookingHeader}>
                                    <View style={styles.bookingHeaderLeft}>
                                        <Text style={styles.hostelName}>{booking.hostel.name}</Text>
                                        <Text style={styles.roomName}>{booking.room.name}</Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(booking.status) },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                { color: getStatusTextColor(booking.status) },
                                            ]}
                                        >
                                            {booking.status.replace(/_/g, ' ')}
                                        </Text>
                                    </View>
                                </View>

                                {/* Details */}
                                <View style={styles.bookingDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailIcon}>📅</Text>
                                        <Text style={styles.detailText}>
                                            {new Date(booking.startDate).toLocaleDateString()} -{' '}
                                            {new Date(booking.endDate).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailIcon}>📍</Text>
                                        <Text style={styles.detailText}>{booking.hostel.city}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailIcon}>💰</Text>
                                        <Text style={styles.detailText}>
                                            ₵{Math.floor(booking.totalPrice / 100)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Actions */}
                                {booking.status === 'PENDING_APPROVAL' && (
                                    <TouchableOpacity
                                        onPress={() => handleCancelBooking(booking.id)}
                                        style={[styles.actionButton, styles.cancelButton]}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel Request</Text>
                                    </TouchableOpacity>
                                )}
                                {booking.status === 'CONFIRMED' && booking.paymentStatus !== 'SUCCESS' && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.paymentButton]}
                                    >
                                        <Text style={styles.paymentButtonText}>Complete Payment</Text>
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
