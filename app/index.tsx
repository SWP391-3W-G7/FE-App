import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Index route - redirect based on auth state
 * This ensures the app starts at the correct screen
 */
export default function Index() {
    const { token, isLoading } = useAuth();

    // Don't redirect while still loading auth state
    if (isLoading) {
        return null;
    }

    // Redirect to login if not authenticated, otherwise to home
    if (!token) {
        return <Redirect href="/(auth)/login" />;
    }

    return <Redirect href="/(tabs)/(home)" />;
}
