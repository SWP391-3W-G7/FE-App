import { Stack } from 'expo-router';
import React from 'react';

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
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
          title: 'Lost & Found',
        }}
      />
    </Stack>
  );
}