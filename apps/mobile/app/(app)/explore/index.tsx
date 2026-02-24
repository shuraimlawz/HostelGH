import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    FlatList,
    StyleSheet,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import { Hostel } from '@/lib/types';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchText: {
        flex: 1,
        marginLeft: 8,
        color: '#999',
    },
    filterButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    filterText: {
        fontSize: 18,
    },
    citiesContainer: {
        marginBottom: 24,
    },
    cityButton: {
        marginRight: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    cityButtonActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    cityButtonInactive: {
        backgroundColor: '#fff',
        borderColor: '#d1d5db',
    },
    cityButtonText: {
        fontWeight: '600',
    },
    cityButtonTextActive: {
        color: '#fff',
    },
    cityButtonTextInactive: {
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
    hostelsList: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    hostelCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    hostelImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#d1d5db',
    },
    hostelInfo: {
        padding: 16,
    },
    hostelName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    hostelCity: {
        color: '#666',
        fontSize: 12,
        marginBottom: 12,
    },
    hostelFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontWeight: '600',
    },
    reviewCount: {
        color: '#999',
        fontSize: 12,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default function ExploreScreen() {
    const router = useRouter();
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('Accra');

    useEffect(() => {
        loadHostels();
    }, [selectedCity]);

    const loadHostels = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getHostels({
                city: selectedCity,
                search: searchQuery,
            });
            setHostels(response.data);
        } catch (error) {
            console.error('Failed to load hostels:', error);
        } finally {
            setLoading(false);
        }
    };

    const cities = ['Accra', 'Kumasi', 'Cape Coast', 'Takoradi', 'Tema'];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Discover Hostels</Text>

                    {/* Search Bar */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchInput}>
                            <Text style={{ fontSize: 18 }}>🔍</Text>
                            <TextInput
                                style={styles.searchText}
                                placeholder="Search hostels..."
                                placeholderTextColor="#999"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity style={styles.filterButton}>
                            <Text style={styles.filterText}>⚙️</Text>
                        </TouchableOpacity>
                    </View>

                    {/* City Filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.citiesContainer}
                    >
                        {cities.map((city) => (
                            <TouchableOpacity
                                key={city}
                                onPress={() => setSelectedCity(city)}
                                style={[
                                    styles.cityButton,
                                    selectedCity === city
                                        ? styles.cityButtonActive
                                        : styles.cityButtonInactive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.cityButtonText,
                                        selectedCity === city
                                            ? styles.cityButtonTextActive
                                            : styles.cityButtonTextInactive,
                                    ]}
                                >
                                    {city}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Hostels List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : hostels.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hostels found</Text>
                    </View>
                ) : (
                    <View style={styles.hostelsList}>
                        {hostels.map((hostel) => (
                            <TouchableOpacity
                                key={hostel.id}
                                onPress={() => router.push(`/hostel/${hostel.id}`)}
                                style={styles.hostelCard}
                                activeOpacity={0.7}
                            >
                                {/* Image */}
                                <Image
                                    source={{ uri: hostel.imageUrl }}
                                    style={styles.hostelImage}
                                />

                                {/* Info */}
                                <View style={styles.hostelInfo}>
                                    <Text style={styles.hostelName}>{hostel.name}</Text>
                                    <Text style={styles.hostelCity}>{hostel.city}</Text>

                                    <View style={styles.hostelFooter}>
                                        <View style={styles.ratingContainer}>
                                            <Text>⭐</Text>
                                            <Text style={styles.ratingText}>
                                                {hostel.rating.toFixed(1)}
                                            </Text>
                                            <Text style={styles.reviewCount}>
                                                ({hostel.reviewCount})
                                            </Text>
                                        </View>
                                        <Text style={styles.priceText}>
                                            ₵{Math.floor(hostel.priceRange.min / 100)}/month
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
