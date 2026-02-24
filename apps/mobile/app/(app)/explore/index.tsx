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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, Star } from 'lucide-react-native';
import { apiClient } from '@/lib/api/client';
import { Hostel } from '@/lib/types';

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
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-4 pt-4 pb-6">
                    <Text className="text-3xl font-bold mb-6">Discover Hostels</Text>

                    {/* Search Bar */}
                    <View className="flex-row items-center gap-2 mb-6">
                        <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-3 border border-gray-200">
                            <Search size={20} color="#999" />
                            <Text className="flex-1 ml-2" placeholder="Search hostels..." placeholderTextColor="#999" />
                        </View>
                        <TouchableOpacity className="bg-white p-3 rounded-lg border border-gray-200">
                            <Filter size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* City Filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-6"
                    >
                        {cities.map((city) => (
                            <TouchableOpacity
                                key={city}
                                onPress={() => setSelectedCity(city)}
                                className={`mr-2 px-4 py-2 rounded-full border ${
                                    selectedCity === city
                                        ? 'bg-black border-black'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                <Text
                                    className={
                                        selectedCity === city
                                            ? 'text-white font-semibold'
                                            : 'text-gray-700'
                                    }
                                >
                                    {city}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Hostels List */}
                {loading ? (
                    <View className="flex-1 justify-center items-center py-12">
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : hostels.length === 0 ? (
                    <View className="px-4 py-12 items-center">
                        <Text className="text-gray-600 text-lg">No hostels found</Text>
                    </View>
                ) : (
                    <View className="px-4 pb-6">
                        {hostels.map((hostel) => (
                            <TouchableOpacity
                                key={hostel.id}
                                onPress={() => router.push(`/hostel/${hostel.id}`)}
                                className="bg-white rounded-lg overflow-hidden mb-4 shadow-sm border border-gray-100"
                                activeOpacity={0.7}
                            >
                                {/* Image */}
                                <Image
                                    source={{ uri: hostel.imageUrl }}
                                    className="w-full h-40 bg-gray-200"
                                />

                                {/* Info */}
                                <View className="p-4">
                                    <Text className="text-lg font-bold mb-1">{hostel.name}</Text>
                                    <Text className="text-gray-600 text-sm mb-3">{hostel.city}</Text>

                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-row items-center gap-1">
                                            <Star size={16} color="#fbbf24" fill="#fbbf24" />
                                            <Text className="font-semibold">
                                                {hostel.rating.toFixed(1)}
                                            </Text>
                                            <Text className="text-gray-500 text-sm">
                                                ({hostel.reviewCount})
                                            </Text>
                                        </View>
                                        <Text className="text-lg font-bold">
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
