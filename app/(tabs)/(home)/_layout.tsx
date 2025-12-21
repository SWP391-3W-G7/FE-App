import { Stack } from 'expo-router';
import React from 'react';

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold' as const,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Lost & Found',
        }}
      />
      <Stack.Screen
        name="lost-item/[id]"
        options={{
          headerShown: false,
          title: 'Item Details',
        }}
      />
      <Stack.Screen
        name="found-item/[id]"
        options={{
          headerShown: false,
          title: 'Found Item',
        }}
      />
    </Stack>
  );
}
