import { Stack } from 'expo-router';
import React from 'react';

export default function MyItemsStackLayout() {
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
        }}
      />
      <Stack.Screen
        name="found-item/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="claim/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
