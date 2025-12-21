import { Tabs } from 'expo-router';
import { Bell, FileText, Home, LayoutList, User } from 'lucide-react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const iconSize = 24;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0f172a',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(report)"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <FileText size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Bell size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(my-items)"
        options={{
          title: 'My Items',
          tabBarIcon: ({ color }) => <LayoutList size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={iconSize} color={color} />,
        }}
      />
    </Tabs>
  );
}
