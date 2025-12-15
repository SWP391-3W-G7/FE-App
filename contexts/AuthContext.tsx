import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const [AuthProvider, useAuth] = createContextHook(() => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        loadStoredAuth();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!token && segments[0] !== '(auth)') {
                router.replace('/(auth)/login' as any);
            } else if (token && segments[0] === '(auth)') {
                router.replace('/(tabs)/(home)' as any);
            }
        }
    }, [token, segments, isLoading, router]);

    const loadStoredAuth = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem(TOKEN_KEY),
                AsyncStorage.getItem(USER_KEY),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to load auth data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginMutation = useMutation({
        mutationFn: async (data: LoginRequest) => {
            const url = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;
            console.log('========== LOGIN API CALL ==========');
            console.log('URL:', url);
            console.log('Request body:', JSON.stringify(data, null, 2));
            const startTime = Date.now();

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const elapsed = Date.now() - startTime;
            console.log(`Response status: ${response.status} (took ${elapsed}ms)`);

            if (!response.ok) {
                console.error('Login failed with status:', response.status);
                throw new Error('Login failed');
            }

            const result = await response.json() as LoginResponse;
            console.log('Login response received:', result.token ? 'Token received' : 'No token');
            console.log('====================================');
            return result;
        },
        onSuccess: async (data) => {
            await AsyncStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);

            const decoded = parseJwt(data.token);
            const userData: User = {
                userId: parseInt(decoded.nameid),
                email: decoded.email,
                roleId: parseInt(decoded.role),
                campusId: parseInt(decoded.CampusId),
                username: '',
                fullName: '',
                status: 'Active',
                roleName: '',
                campusName: '',
            };

            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (data: RegisterRequest) => {
            const url = `${API_BASE_URL}${API_ENDPOINTS.REGISTER}`;
            console.log('========== REGISTER API CALL ==========');
            console.log('URL:', url);
            console.log('Request body:', JSON.stringify(data, null, 2));
            const startTime = Date.now();

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const elapsed = Date.now() - startTime;
            console.log(`Response status: ${response.status} (took ${elapsed}ms)`);

            if (!response.ok) {
                console.error('Registration failed with status:', response.status);
                throw new Error('Registration failed');
            }

            const result = await response.json() as User;
            console.log('Register response:', JSON.stringify(result, null, 2));
            console.log('========================================');
            return result;
        },
        onSuccess: async (userData) => {
            console.log('Register onSuccess - saving user data');
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
        },
    });

    const logout = async () => {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        setToken(null);
        setUser(null);
        router.replace('/(auth)/login' as any);
    };

    const parseJwt = (token: string) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    };

    return {
        token,
        user,
        isLoading,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
});
