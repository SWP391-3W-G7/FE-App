import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { API_BASE_URL } from '@/constants/api';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Backend callback URL that returns the token
const CALLBACK_URL = `${API_BASE_URL?.replace('/api', '')}/callback`;
const GOOGLE_LOGIN_URL = `${API_BASE_URL?.replace('/api', '')}/api/auth/google-login`;

export interface GoogleAuthResult {
    success: boolean;
    token?: string;
    error?: string;
}

export const useGoogleAuth = () => {
    const [isLoading, setIsLoading] = useState(false);

    const promptGoogleLogin = useCallback(async (): Promise<GoogleAuthResult> => {
        setIsLoading(true);

        try {
            // Open browser for Google login
            const result = await WebBrowser.openAuthSessionAsync(
                GOOGLE_LOGIN_URL,
                CALLBACK_URL
            );

            if (result.type === 'success' && result.url) {
                // Extract token from callback URL
                const url = new URL(result.url);
                const token = url.searchParams.get('token');

                if (token) {
                    // Parse JWT to get user info
                    const userData = parseJwt(token);

                    // Save to AsyncStorage
                    await Promise.all([
                        AsyncStorage.setItem(TOKEN_KEY, token),
                        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
                    ]);

                    setIsLoading(false);
                    return { success: true, token };
                } else {
                    setIsLoading(false);
                    return { success: false, error: 'No token received' };
                }
            } else if (result.type === 'cancel') {
                setIsLoading(false);
                return { success: false, error: 'User cancelled' };
            } else {
                setIsLoading(false);
                return { success: false, error: 'Login failed' };
            }
        } catch (error) {
            console.error('Google login error:', error);
            setIsLoading(false);
            return { success: false, error: 'Network error' };
        }
    }, []);

    const handleGoogleLogin = useCallback(async () => {
        const result = await promptGoogleLogin();

        if (result.success) {
            Alert.alert('Thành công', 'Đăng nhập Google thành công!');
            // Navigation will be handled by AuthContext watching the token
            return true;
        } else {
            if (result.error !== 'User cancelled') {
                Alert.alert('Lỗi', result.error || 'Đăng nhập thất bại');
            }
            return false;
        }
    }, [promptGoogleLogin]);

    return {
        promptGoogleLogin,
        handleGoogleLogin,
        isLoading,
    };
};

// Parse JWT token to extract user data
const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const decoded = JSON.parse(jsonPayload);

        return {
            userId: parseInt(decoded.nameid || decoded.sub || '0'),
            email: decoded.email || '',
            roleId: parseInt(decoded.role || '0'),
            campusId: parseInt(decoded.CampusId || '0'),
            username: decoded.unique_name || '',
            fullName: decoded.name || '',
            status: 'Active',
            roleName: '',
            campusName: '',
        };
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return {
            userId: 0,
            email: '',
            roleId: 0,
            campusId: 0,
            username: '',
            fullName: '',
            status: 'Active',
            roleName: '',
            campusName: '',
        };
    }
};
