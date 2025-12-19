import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { API_BASE_URL } from '@/constants/api';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Backend base URL without /api
const BACKEND_ROOT_URL = API_BASE_URL?.replace('/api', '');

// Generate redirect URI for mobile app
// This is what the backend should redirect to after processing Google login
const REDIRECT_URI = AuthSession.makeRedirectUri({
    scheme: 'fpulostfound',
    path: 'callback',
});

console.log('Google Auth Redirect URI:', REDIRECT_URI);

export interface GoogleAuthResult {
    success: boolean;
    token?: string;
    error?: string;
}

export const useGoogleAuth = () => {
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Prompt Google login with campusId
     * @param campusId - The campus ID to associate with the user
     */
    const promptGoogleLogin = useCallback(async (campusId?: number): Promise<GoogleAuthResult> => {
        setIsLoading(true);

        try {
            // Build Google login URL with campusId and redirect URI
            const params = new URLSearchParams();
            if (campusId) {
                params.append('campusId', campusId.toString());
            }
            // Tell backend where to redirect after login
            params.append('redirectUri', REDIRECT_URI);

            const googleLoginUrl = `${BACKEND_ROOT_URL}/api/auth/google-login?${params.toString()}`;
            console.log('Opening Google Login URL:', googleLoginUrl);

            // Open browser for Google login
            const result = await WebBrowser.openAuthSessionAsync(
                googleLoginUrl,
                REDIRECT_URI
            );

            console.log('WebBrowser result:', result.type);

            if (result.type === 'success' && result.url) {
                console.log('Callback URL received:', result.url);
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
                    return { success: false, error: 'Không nhận được token từ server' };
                }
            } else if (result.type === 'cancel') {
                setIsLoading(false);
                return { success: false, error: 'User cancelled' };
            } else {
                setIsLoading(false);
                return { success: false, error: 'Đăng nhập thất bại' };
            }
        } catch (error) {
            console.error('Google login error:', error);
            setIsLoading(false);
            return { success: false, error: 'Lỗi mạng' };
        }
    }, []);

    /**
     * Handle Google login with UI feedback
     * @param campusId - The campus ID to associate with the user
     */
    const handleGoogleLogin = useCallback(async (campusId?: number) => {
        if (!campusId) {
            Alert.alert('Lỗi', 'Vui lòng chọn cơ sở trước khi đăng nhập bằng Google');
            return false;
        }

        const result = await promptGoogleLogin(campusId);

        if (result.success) {
            Alert.alert('Thành công', 'Đăng nhập Google thành công!');
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
        redirectUri: REDIRECT_URI, // Expose for debugging
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
