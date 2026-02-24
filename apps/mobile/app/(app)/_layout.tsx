import React from 'react';
import { Tabs } from 'expo-router';
import { Compass, MapPin, User } from 'lucide-react-native';

const TAB_ICONS = {
    explore: (color: string) => <Compass size={24} color={color} />,
    bookings: (color: string) => <MapPin size={24} color={color} />,
    account: (color: string) => <User size={24} color={color} />,
};

export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopColor: '#eee',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                headerStyle: {
                    backgroundColor: '#fff',
                    borderBottomColor: '#eee',
                },
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                },
            }}
        >
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarLabel: 'Explore',
                    tabBarIcon: ({ color }: { color: string }) => TAB_ICONS.explore(color),
                    headerShown: true,
                    headerTitle: 'Discover Hostels',
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Bookings',
                    tabBarLabel: 'Bookings',
                    tabBarIcon: ({ color }: { color: string }) => TAB_ICONS.bookings(color),
                    headerShown: true,
                    headerTitle: 'My Bookings',
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarLabel: 'Account',
                    tabBarIcon: ({ color }: { color: string }) => TAB_ICONS.account(color),
                    headerShown: true,
                    headerTitle: 'Profile',
                }}
            />
        </Tabs>
    );
}
