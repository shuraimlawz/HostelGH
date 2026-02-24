import React from 'react';
import { Tabs } from 'expo-router';

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
                    headerShown: true,
                    headerTitle: 'Discover Hostels',
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Bookings',
                    tabBarLabel: 'Bookings',
                    headerShown: true,
                    headerTitle: 'My Bookings',
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarLabel: 'Account',
                    headerShown: true,
                    headerTitle: 'Profile',
                }}
            />
        </Tabs>
    );
}

